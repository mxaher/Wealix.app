import { NextResponse } from 'next/server';
import { buildRateLimitHeaders, enforceRateLimit } from '@/lib/rate-limit';
import { requireAuthenticatedUser } from '@/lib/server-auth';

const DEFAULT_BASE_URL = 'https://api.twelvedata.com';

type SupportedExchange = 'EGX' | 'NASDAQ' | 'NYSE';

type HoldingInput = {
  ticker: string;
  exchange: SupportedExchange;
};

type TwelveDataQuote = {
  symbol?: string;
  name?: string;
  exchange?: string;
  currency?: string;
  close?: string;
  price?: string;
  change?: string;
  percent_change?: string;
  datetime?: string;
  code?: number;
  message?: string;
};

type TwelveDataFx = {
  symbol?: string;
  rate?: string;
  datetime?: string;
  code?: number;
  message?: string;
};

function normalizeHoldingSymbol(ticker: string, exchange: SupportedExchange) {
  const trimmed = ticker.trim().toUpperCase();

  if (exchange === 'EGX') {
    if (trimmed.includes(':')) {
      return trimmed;
    }

    const withoutSuffix = trimmed.replace(/\.CA$/i, '');
    return `${withoutSuffix}:EGX`;
  }

  return trimmed;
}

async function fetchJson<T>(url: string) {
  const response = await fetch(url, { cache: 'no-store' });
  const json = (await response.json()) as T;
  return json;
}

export async function POST(request: Request) {
  const authResult = await requireAuthenticatedUser();
  if (authResult.error) {
    return authResult.error;
  }

  const rateLimit = enforceRateLimit(`market-global:${authResult.userId}`, 120, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', code: 'RATE_LIMITED' },
      { status: 429, headers: buildRateLimitHeaders(rateLimit) }
    );
  }

  const apiKey = process.env.TWELVEDATA_API_KEY;
  const apiBase = (process.env.TWELVEDATA_API_BASE || DEFAULT_BASE_URL).replace(/\/$/, '');

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Service unavailable.' },
      { status: 503, headers: buildRateLimitHeaders(rateLimit) }
    );
  }

  try {
    const body = await request.json();
    const holdings = Array.isArray(body?.holdings) ? body.holdings as HoldingInput[] : [];

    const uniqueHoldings = holdings.filter((holding) =>
      holding?.ticker && ['EGX', 'NASDAQ', 'NYSE'].includes(String(holding.exchange))
    );

    const quoteEntries = await Promise.all(uniqueHoldings.map(async (holding) => {
      const symbol = normalizeHoldingSymbol(holding.ticker, holding.exchange);
      const endpoint = holding.exchange === 'EGX' ? 'eod' : 'quote';
      const url = `${apiBase}/${endpoint}?symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(apiKey)}`;
      const data = await fetchJson<TwelveDataQuote>(url);

      return [holding.ticker.toUpperCase(), {
        symbol,
        name: data.name || holding.ticker.toUpperCase(),
        exchange: holding.exchange,
        currency: data.currency || (holding.exchange === 'EGX' ? 'EGP' : 'USD'),
        price: Number(data.price ?? data.close ?? 0),
        change: Number(data.change ?? 0),
        changePercent: Number(data.percent_change ?? 0),
        datetime: data.datetime || null,
        status: holding.exchange === 'EGX' ? 'EOD' : 'REALTIME',
        error: data.message || null,
      }] as const;
    }));

    const fxPairs = [
      { key: 'USD_SAR', symbol: 'USD/SAR' },
      { key: 'EGP_SAR', symbol: 'EGP/SAR' },
    ];

    const fxEntries = await Promise.all(fxPairs.map(async (pair) => {
      const url = `${apiBase}/exchange_rate?symbol=${encodeURIComponent(pair.symbol)}&apikey=${encodeURIComponent(apiKey)}`;
      const data = await fetchJson<TwelveDataFx>(url);
      return [pair.key, {
        symbol: pair.symbol,
        rate: Number(data.rate ?? 0),
        datetime: data.datetime || null,
        source: 'Twelve Data',
      }] as const;
    }));

    return NextResponse.json({
      quotes: Object.fromEntries(quoteEntries),
      fxRates: Object.fromEntries(fxEntries),
    }, { headers: buildRateLimitHeaders(rateLimit) });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Service unavailable.',
      },
      { status: 503, headers: buildRateLimitHeaders(rateLimit) }
    );
  }
}
