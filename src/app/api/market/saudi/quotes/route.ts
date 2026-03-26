import { NextResponse } from 'next/server';
import { buildRateLimitHeaders, enforceRateLimit } from '@/lib/rate-limit';
import { requireAuthenticatedUser } from '@/lib/server-auth';

const DEFAULT_BASE_URL = 'https://app.sahmk.sa/api/v1';

function normalizeSaudiSymbol(symbol: string) {
  return symbol.trim().toUpperCase().replace(/\.SR$/i, '');
}

type SahmkQuote = {
  symbol?: string | number;
  name_en?: string;
  name_ar?: string;
  price?: string | number;
  change?: string | number;
  change_percent?: string | number;
};

async function fetchBatchQuotes(symbols: string[], apiKey: string, apiBase: string) {
  const response = await fetch(`${apiBase}/quote/batch/?symbols=${encodeURIComponent(symbols.join(','))}`, {
    headers: {
      'X-API-Key': apiKey,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to fetch SAHMK batch quotes.');
  }

  return response.json() as Promise<SahmkQuote[]>;
}

export async function POST(request: Request) {
  const authResult = await requireAuthenticatedUser();
  if (authResult.error) {
    return authResult.error;
  }

  const rateLimit = enforceRateLimit(`market-saudi:${authResult.userId}`, 120, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', code: 'RATE_LIMITED' },
      { status: 429, headers: buildRateLimitHeaders(rateLimit) }
    );
  }

  const apiKey = process.env.SAHMK_API_KEY;
  const apiBase = (process.env.SAHMK_API_BASE || DEFAULT_BASE_URL).replace(/\/$/, '');

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Service unavailable.' },
      { status: 503, headers: buildRateLimitHeaders(rateLimit) }
    );
  }

  try {
    const body = await request.json();
    const requestedSymbols: Array<string | number> = Array.isArray(body?.symbols)
      ? body.symbols.filter((symbol: unknown): symbol is string | number => typeof symbol === 'string' || typeof symbol === 'number')
      : [];
    const normalizedSymbols = requestedSymbols
      .map((symbol) => normalizeSaudiSymbol(String(symbol)))
      .filter((symbol): symbol is string => symbol.length > 0);
    const symbols: string[] = [...new Set(normalizedSymbols)];

    if (symbols.length === 0) {
      return NextResponse.json({ quotes: {} }, { headers: buildRateLimitHeaders(rateLimit) });
    }

    const chunks: string[][] = [];
    for (let index = 0; index < symbols.length; index += 20) {
      chunks.push(symbols.slice(index, index + 20));
    }

    const allQuotes = await Promise.all(chunks.map((chunk) => fetchBatchQuotes(chunk, apiKey, apiBase)));
    const quotes = allQuotes.flat().reduce<Record<string, {
      symbol: string;
      nameEn: string;
      nameAr: string;
      price: number;
      change: number;
      changePercent: number;
    }>>((accumulator, quote) => {
      const symbol = normalizeSaudiSymbol(String(quote.symbol ?? ''));
      if (!symbol) {
        return accumulator;
      }

      accumulator[symbol] = {
        symbol,
        nameEn: quote.name_en || symbol,
        nameAr: quote.name_ar || quote.name_en || symbol,
        price: Number(quote.price ?? 0),
        change: Number(quote.change ?? 0),
        changePercent: Number(quote.change_percent ?? 0),
      };

      return accumulator;
    }, {});

    return NextResponse.json({ quotes }, { headers: buildRateLimitHeaders(rateLimit) });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Service unavailable.',
      },
      { status: 503, headers: buildRateLimitHeaders(rateLimit) }
    );
  }
}
