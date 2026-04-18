import { NextResponse } from 'next/server';
import { getCachedValue, setCachedValue } from '@/lib/runtime-cache';

const FX_API_BASE = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api';
const GOLD_API_URL = 'https://api.gold-api.com/price/XAU/USD';
const OUNCE_TO_GRAM = 31.1034768;
const DEFAULT_DAYS = 30;
const MAX_DAYS = 45;
const CACHE_TTL_SECONDS = 15 * 60;

const SUPPORTED_CURRENCIES = [
  'SAR',
  'USD',
  'EUR',
  'GBP',
  'AED',
  'KWD',
  'QAR',
  'BHD',
  'OMR',
  'EGP',
  'JOD',
  'GBX',
  'TRY',
  'INR',
  'PKR',
  'MYR',
  'JPY',
  'CNY',
] as const;

const KARAT_MULTIPLIERS = {
  '24K': 1,
  '22K': 22 / 24,
  '21K': 21 / 24,
  '18K': 18 / 24,
} as const;

type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];
type KaratKey = keyof typeof KARAT_MULTIPLIERS;

type CurrencySnapshotPayload = {
  date?: string;
} & Record<string, unknown>;

type GoldApiPayload = {
  price?: number;
  updatedAt?: string;
  currency?: string;
  symbol?: string;
};

type HistoryPoint = {
  date: string;
  asOf: string;
  retrievedAt: string;
  rate: number;
};

function isSupportedCurrency(value: string): value is SupportedCurrency {
  return SUPPORTED_CURRENCIES.includes(value as SupportedCurrency);
}

function normalizeCurrency(value: string | null, fallback: SupportedCurrency): SupportedCurrency {
  const normalized = String(value || '').trim().toUpperCase();
  return isSupportedCurrency(normalized) ? normalized : fallback;
}

function toDateTag(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildRecentDateTags(days: number) {
  const now = new Date();
  const tags: string[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(now.getTime());
    date.setUTCDate(now.getUTCDate() - i);
    tags.push(toDateTag(date));
  }
  return tags;
}

function parseRatesObject(payload: CurrencySnapshotPayload, base: string) {
  const key = base.toLowerCase();
  const rates = payload[key];
  if (!rates || typeof rates !== 'object') {
    return null;
  }

  return rates as Record<string, number>;
}

async function fetchCurrencySnapshot(base: SupportedCurrency, dateTag: string) {
  const baseLower = base.toLowerCase();
  const url = `${FX_API_BASE}@${dateTag}/v1/currencies/${baseLower}.json`;
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`FX snapshot failed (${response.status}) for ${dateTag}`);
  }
  const payload = (await response.json()) as CurrencySnapshotPayload;
  const rates = parseRatesObject(payload, base);
  if (!rates) {
    throw new Error(`FX payload missing rates for ${base} on ${dateTag}`);
  }

  return {
    date: typeof payload.date === 'string' ? payload.date : dateTag,
    rates,
  };
}

function toSarRates(rawSarRates: Record<string, number>) {
  const mapped: Record<string, number> = { SAR: 1 };
  for (const code of SUPPORTED_CURRENCIES) {
    if (code === 'SAR') {
      mapped.SAR = 1;
      continue;
    }

    const value = rawSarRates[code.toLowerCase()];
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      mapped[code] = value;
    }
  }

  return mapped;
}

function toUsdToTargetRate(ratesVsSar: Record<string, number>, targetCurrency: SupportedCurrency) {
  const usdRateVsSar = ratesVsSar.USD;
  const targetRateVsSar = ratesVsSar[targetCurrency];

  if (
    typeof usdRateVsSar !== 'number' ||
    !Number.isFinite(usdRateVsSar) ||
    usdRateVsSar <= 0 ||
    typeof targetRateVsSar !== 'number' ||
    !Number.isFinite(targetRateVsSar) ||
    targetRateVsSar <= 0
  ) {
    return null;
  }

  return targetRateVsSar / usdRateVsSar;
}

function buildGoldPerGramByKarat(usdOuncePrice: number, usdToTargetRate: number) {
  const perGram24 = (usdOuncePrice / OUNCE_TO_GRAM) * usdToTargetRate;

  return Object.fromEntries(
    Object.entries(KARAT_MULTIPLIERS).map(([karat, multiplier]) => [karat, perGram24 * multiplier])
  ) as Record<KaratKey, number>;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const from = normalizeCurrency(url.searchParams.get('from'), 'SAR');
  const to = normalizeCurrency(url.searchParams.get('to'), 'USD');
  const goldCurrency = normalizeCurrency(url.searchParams.get('goldCurrency'), 'SAR');
  const requestedDays = Number(url.searchParams.get('days') || DEFAULT_DAYS);
  const days = Number.isFinite(requestedDays)
    ? Math.max(7, Math.min(MAX_DAYS, Math.floor(requestedDays)))
    : DEFAULT_DAYS;

  const cacheKey = `converter:market:${from}:${to}:${goldCurrency}:${days}`;
  const cached = await getCachedValue<Record<string, unknown>>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });
  }

  const retrievedAt = new Date().toISOString();

  try {
    const [latestBaseSnapshot, historySnapshots, goldPayload] = await Promise.all([
      fetchCurrencySnapshot('SAR', 'latest'),
      Promise.all(
        buildRecentDateTags(days).map(async (dateTag) => {
          try {
            return await fetchCurrencySnapshot(from, dateTag);
          } catch {
            return null;
          }
        })
      ),
      fetch(GOLD_API_URL, { cache: 'no-store' }).then(async (response) => {
        if (!response.ok) {
          throw new Error(`Gold API failed (${response.status})`);
        }
        return (await response.json()) as GoldApiPayload;
      }),
    ]);

    const ratesVsSar = toSarRates(latestBaseSnapshot.rates);

    const latestFromRate = from === 'SAR' ? 1 : ratesVsSar[from];
    const latestToRate = to === 'SAR' ? 1 : ratesVsSar[to];

    if (
      typeof latestFromRate !== 'number' ||
      !Number.isFinite(latestFromRate) ||
      latestFromRate <= 0 ||
      typeof latestToRate !== 'number' ||
      !Number.isFinite(latestToRate) ||
      latestToRate <= 0
    ) {
      throw new Error('Latest FX rates missing for selected pair.');
    }

    const history: HistoryPoint[] = historySnapshots
      .filter((snapshot): snapshot is NonNullable<typeof snapshot> => Boolean(snapshot))
      .map((snapshot) => {
        if (from === to) {
          return {
            date: snapshot.date,
            asOf: `${snapshot.date}T00:00:00.000Z`,
            retrievedAt,
            rate: 1,
          };
        }

        const toRate = snapshot.rates[to.toLowerCase()];
        if (typeof toRate !== 'number' || !Number.isFinite(toRate) || toRate <= 0) {
          return null;
        }

        return {
          date: snapshot.date,
          asOf: `${snapshot.date}T00:00:00.000Z`,
          retrievedAt,
          rate: toRate,
        };
      })
      .filter((point): point is HistoryPoint => Boolean(point));

    if (history.length === 0) {
      throw new Error('No history data available for selected pair.');
    }

    const usdOuncePrice = Number(goldPayload.price ?? 0);
    if (!Number.isFinite(usdOuncePrice) || usdOuncePrice <= 0) {
      throw new Error('Invalid gold price payload.');
    }

    const usdToTargetRate = toUsdToTargetRate(ratesVsSar, goldCurrency);
    if (!usdToTargetRate) {
      throw new Error('Could not convert gold price to selected currency.');
    }

    const goldPerGramByKarat = buildGoldPerGramByKarat(usdOuncePrice, usdToTargetRate);
    const latestRate = latestToRate / latestFromRate;

    const responseData = {
      source: {
        fx: 'publicapis.io/currency-api',
        gold: 'gold-api.com',
      },
      pair: { from, to },
      latest: {
        date: latestBaseSnapshot.date,
        asOf: `${latestBaseSnapshot.date}T00:00:00.000Z`,
        retrievedAt,
        rate: latestRate,
      },
      history,
      ratesVsSar,
      gold: {
        currency: goldCurrency,
        ouncePriceUsd: usdOuncePrice,
        usdToTargetRate,
        updatedAt: goldPayload.updatedAt ?? retrievedAt,
        perGramByKarat: goldPerGramByKarat,
      },
    };

    await setCachedValue(cacheKey, responseData, CACHE_TTL_SECONDS);

    return NextResponse.json(responseData, { headers: { 'X-Cache': 'MISS' } });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to load converter market data.',
        detail: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
