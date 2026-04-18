'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeftRight, Info } from 'lucide-react';
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useAppStore } from '@/store/useAppStore';

const RATES_VS_SAR: Record<string, { rate: number; symbol: string; name: string; nameAr: string }> = {
  SAR: { rate: 1, symbol: 'ر.س', name: 'Saudi Riyal', nameAr: 'ريال سعودي' },
  USD: { rate: 0.2667, symbol: '$', name: 'US Dollar', nameAr: 'دولار أمريكي' },
  EUR: { rate: 0.2453, symbol: '€', name: 'Euro', nameAr: 'يورو' },
  GBP: { rate: 0.2101, symbol: '£', name: 'British Pound', nameAr: 'جنيه إسترليني' },
  AED: { rate: 0.9796, symbol: 'د.إ', name: 'UAE Dirham', nameAr: 'درهم إماراتي' },
  KWD: { rate: 0.08196, symbol: 'د.ك', name: 'Kuwaiti Dinar', nameAr: 'دينار كويتي' },
  QAR: { rate: 0.9713, symbol: 'ر.ق', name: 'Qatari Riyal', nameAr: 'ريال قطري' },
  BHD: { rate: 0.1005, symbol: 'د.ب', name: 'Bahraini Dinar', nameAr: 'دينار بحريني' },
  OMR: { rate: 0.1026, symbol: 'ر.ع', name: 'Omani Rial', nameAr: 'ريال عُماني' },
  EGP: { rate: 13.23, symbol: 'ج.م', name: 'Egyptian Pound', nameAr: 'جنيه مصري' },
  JOD: { rate: 0.1892, symbol: 'د.ا', name: 'Jordanian Dinar', nameAr: 'دينار أردني' },
  GBX: { rate: 210.1, symbol: 'p', name: 'Pence Sterling', nameAr: 'بنس إسترليني' },
  TRY: { rate: 8.72, symbol: '₺', name: 'Turkish Lira', nameAr: 'ليرة تركية' },
  INR: { rate: 22.27, symbol: '₹', name: 'Indian Rupee', nameAr: 'روبية هندية' },
  PKR: { rate: 74.54, symbol: '₨', name: 'Pakistani Rupee', nameAr: 'روبية باكستانية' },
  MYR: { rate: 1.259, symbol: 'RM', name: 'Malaysian Ringgit', nameAr: 'رينغيت ماليزي' },
  JPY: { rate: 40.26, symbol: '¥', name: 'Japanese Yen', nameAr: 'ين ياباني' },
  CNY: { rate: 1.937, symbol: '¥', name: 'Chinese Yuan', nameAr: 'يوان صيني' },
};

const GOLD_PRICE_SAR_PER_GRAM: Record<string, number> = {
  '24K': 340,
  '22K': 311.7,
  '21K': 297.5,
  '18K': 255,
};

const CURRENCY_ORDER = ['SAR', 'USD', 'EUR', 'GBP', 'AED', 'KWD', 'QAR', 'BHD', 'OMR', 'EGP', 'JOD', 'TRY', 'INR', 'PKR', 'MYR', 'JPY', 'CNY', 'GBX'] as const;

type HistoryPoint = {
  date: string;
  asOf: string;
  retrievedAt: string;
  rate: number;
};

type ConverterMarketResponse = {
  latest?: {
    date?: string;
    asOf?: string;
    retrievedAt?: string;
    rate?: number;
  };
  history?: HistoryPoint[];
  ratesVsSar?: Record<string, number>;
  gold?: {
    currency?: string;
    updatedAt?: string;
    perGramByKarat?: Record<'24K' | '22K' | '21K' | '18K', number>;
  };
};

export default function ConverterPage() {
  const locale = useAppStore((s) => s.locale);
  const isArabic = locale === 'ar';

  const [ratesVsSar, setRatesVsSar] = useState(RATES_VS_SAR);
  const [lastRatesSync, setLastRatesSync] = useState<string | null>(null);
  const [lastRateAsOf, setLastRateAsOf] = useState<string | null>(null);

  const [amount, setAmount] = useState('1000');
  const [from, setFrom] = useState('SAR');
  const [to, setTo] = useState('USD');

  const [goldKarat, setGoldKarat] = useState<'24K' | '22K' | '21K' | '18K'>('21K');
  const [goldGrams, setGoldGrams] = useState('1');
  const [goldCurrency, setGoldCurrency] = useState<(typeof CURRENCY_ORDER)[number]>('SAR');
  const [goldPrices, setGoldPrices] = useState(GOLD_PRICE_SAR_PER_GRAM);
  const [goldLastUpdated, setGoldLastUpdated] = useState<string | null>(null);

  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [marketError, setMarketError] = useState<string | null>(null);
  const [tab, setTab] = useState<'currency' | 'gold'>('currency');

  useEffect(() => {
    let cancelled = false;

    async function syncMarketData() {
      setHistoryLoading(true);
      setMarketError(null);

      try {
        const params = new URLSearchParams({ from, to, goldCurrency, days: '30' });
        const response = await fetch(`/api/converter/market?${params.toString()}`, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Market API request failed.');
        }

        const payload = (await response.json()) as ConverterMarketResponse;

        if (cancelled) {
          return;
        }

        if (payload.ratesVsSar) {
          const nextRates = { ...RATES_VS_SAR };
          for (const code of Object.keys(nextRates)) {
            if (code === 'SAR') {
              nextRates[code] = { ...nextRates[code], rate: 1 };
              continue;
            }

            const liveRate = payload.ratesVsSar[code];
            if (typeof liveRate === 'number' && Number.isFinite(liveRate) && liveRate > 0) {
              nextRates[code] = { ...nextRates[code], rate: liveRate };
            }
          }
          setRatesVsSar(nextRates);
        }

        if (payload.latest?.retrievedAt) {
          setLastRatesSync(payload.latest.retrievedAt);
        }
        if (payload.latest?.asOf) {
          setLastRateAsOf(payload.latest.asOf);
        }

        setHistory(Array.isArray(payload.history) ? payload.history : []);

        if (payload.gold?.perGramByKarat) {
          setGoldPrices(payload.gold.perGramByKarat);
        }
        if (payload.gold?.updatedAt) {
          setGoldLastUpdated(payload.gold.updatedAt);
        }
      } catch {
        if (!cancelled) {
          setMarketError(
            isArabic
              ? 'تعذر تحميل الأسعار المباشرة، ويتم استخدام الأسعار التقريبية الاحتياطية.'
              : 'Could not load live prices, so fallback approximate rates are being used.'
          );
        }
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      }
    }

    void syncMarketData();

    return () => {
      cancelled = true;
    };
  }, [from, to, goldCurrency, isArabic]);

  const result = useMemo(() => {
    const num = parseFloat(amount);
    if (Number.isNaN(num) || num < 0) return null;
    const fromRate = ratesVsSar[from]?.rate ?? 1;
    const toRate = ratesVsSar[to]?.rate ?? 1;
    const sarAmount = num / fromRate;
    return sarAmount * toRate;
  }, [amount, from, to, ratesVsSar]);

  const goldResult = useMemo(() => {
    const grams = parseFloat(goldGrams);
    if (Number.isNaN(grams) || grams <= 0) return null;
    return grams * (goldPrices[goldKarat] ?? GOLD_PRICE_SAR_PER_GRAM[goldKarat]);
  }, [goldGrams, goldKarat, goldPrices]);

  const crossRate = useMemo(() => {
    const fromRate = ratesVsSar[from]?.rate ?? 1;
    const toRate = ratesVsSar[to]?.rate ?? 1;
    return toRate / fromRate;
  }, [from, to, ratesVsSar]);

  const historyChart = useMemo(
    () =>
      history.map((point) => ({
        ...point,
        label: new Date(`${point.date}T00:00:00Z`).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
          month: 'short',
          day: 'numeric',
        }),
      })),
    [history, isArabic]
  );

  function swap() {
    setFrom(to);
    setTo(from);
  }

  const popularPairs = [
    { from: 'SAR', to: 'USD' },
    { from: 'SAR', to: 'EUR' },
    { from: 'SAR', to: 'AED' },
    { from: 'SAR', to: 'KWD' },
    { from: 'USD', to: 'SAR' },
    { from: 'USD', to: 'EUR' },
  ];

  const goldSymbol = ratesVsSar[goldCurrency]?.symbol ?? goldCurrency;

  return (
    <DashboardShell>
      <div className="w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{isArabic ? 'محول العملات' : 'Currency Converter'}</h1>
          <p className="text-sm text-muted-foreground">
            {isArabic
              ? 'أسعار مباشرة من Currency API عبر publicapis.io مع تاريخ 30 يومًا'
              : 'Live rates from Currency API via publicapis.io with 30-day history'}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={tab === 'currency' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTab('currency')}
          >
            {isArabic ? 'عملات' : 'Currency'}
          </Button>
          <Button
            variant={tab === 'gold' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTab('gold')}
          >
            {isArabic ? 'ذهب' : 'Gold'}
          </Button>
        </div>

        {marketError && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
            <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">{marketError}</p>
          </div>
        )}

        {tab === 'currency' && (
          <>
            <Card>
              <CardContent className="p-6 space-y-5">
                <div>
                  <Label className="mb-1.5 block">{isArabic ? 'المبلغ' : 'Amount'}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-lg font-semibold"
                    placeholder="0"
                  />
                </div>

                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <Label className="mb-1.5 block">{isArabic ? 'من' : 'From'}</Label>
                    <Select value={from} onValueChange={setFrom}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCY_ORDER.map((code) => (
                          <SelectItem key={code} value={code}>
                            <span className="font-mono me-2">{ratesVsSar[code]?.symbol}</span>
                            {code} — {isArabic ? ratesVsSar[code]?.nameAr : ratesVsSar[code]?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button variant="outline" size="icon" onClick={swap} className="mb-0.5 shrink-0">
                    <ArrowLeftRight className="h-4 w-4" />
                  </Button>

                  <div className="flex-1">
                    <Label className="mb-1.5 block">{isArabic ? 'إلى' : 'To'}</Label>
                    <Select value={to} onValueChange={setTo}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCY_ORDER.map((code) => (
                          <SelectItem key={code} value={code}>
                            <span className="font-mono me-2">{ratesVsSar[code]?.symbol}</span>
                            {code} — {isArabic ? ratesVsSar[code]?.nameAr : ratesVsSar[code]?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-xl bg-muted/60 p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    {parseFloat(amount) || 0} {from} =
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    {result !== null
                      ? `${ratesVsSar[to]?.symbol ?? ''} ${result.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`
                      : '—'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    1 {from} = {crossRate.toFixed(6)} {to}
                  </p>
                  {lastRateAsOf && (
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {isArabic ? 'تاريخ السعر:' : 'Price date:'} {new Date(lastRateAsOf).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                    </p>
                  )}
                  {lastRatesSync && (
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {isArabic ? 'وقت السحب:' : 'Fetched at:'} {new Date(lastRatesSync).toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
                    </p>
                  )}
                </div>

                <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                  <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    {isArabic
                      ? 'المصدر: publicapis.io/currency-api. الأسعار مرجعية وقد تختلف عن سعر البنك أو الصرافة.'
                      : 'Source: publicapis.io/currency-api. Rates are indicative and may differ from bank/exchange execution rates.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">{isArabic ? 'أزواج شائعة' : 'Popular Pairs'}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {popularPairs.map((pair) => {
                    const fromRate = ratesVsSar[pair.from]?.rate ?? 1;
                    const toRate = ratesVsSar[pair.to]?.rate ?? 1;
                    const rate = toRate / fromRate;
                    return (
                      <button
                        key={`${pair.from}-${pair.to}`}
                        onClick={() => {
                          setFrom(pair.from);
                          setTo(pair.to);
                        }}
                        className="rounded-lg border bg-muted/30 p-3 text-start hover:bg-muted/60 transition-colors"
                      >
                        <p className="text-xs font-semibold">{pair.from} → {pair.to}</p>
                        <p className="text-sm font-bold mt-0.5">{rate.toFixed(4)}</p>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {isArabic ? 'تاريخ السعر خلال 30 يوم' : '30-Day Rate History'}
                </CardTitle>
                <CardDescription>
                  {from} → {to}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  {historyChart.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historyChart}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} />
                        <YAxis
                          stroke="var(--muted-foreground)"
                          fontSize={11}
                          width={66}
                          tickFormatter={(value: number) => value.toFixed(3)}
                        />
                        <Tooltip
                          formatter={(value: number) => [value.toFixed(6), `${from} → ${to}`]}
                          labelFormatter={(_, payload) => {
                            const point = payload?.[0]?.payload as HistoryPoint | undefined;
                            if (!point) {
                              return '';
                            }
                            const asOfText = new Date(point.asOf).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US');
                            const fetchedText = new Date(point.retrievedAt).toLocaleTimeString(isArabic ? 'ar-SA' : 'en-US');
                            return `${isArabic ? 'التاريخ' : 'Date'}: ${asOfText} • ${isArabic ? 'الوقت' : 'Time'}: ${fetchedText}`;
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="rate"
                          stroke="var(--primary)"
                          strokeWidth={2.5}
                          dot={false}
                          activeDot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full grid place-items-center text-sm text-muted-foreground">
                      {historyLoading
                        ? (isArabic ? 'جاري تحميل تاريخ الأسعار...' : 'Loading rate history...')
                        : (isArabic ? 'لا توجد بيانات تاريخية متاحة حالياً.' : 'No history data available right now.')}
                    </div>
                  )}
                </div>
                {lastRatesSync && (
                  <p className="text-[11px] text-muted-foreground mt-3">
                    {isArabic ? 'آخر مزامنة:' : 'Last sync:'} {new Date(lastRatesSync).toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {tab === 'gold' && (
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'تحويل الذهب' : 'Gold Converter'}</CardTitle>
              <CardDescription>
                {isArabic
                  ? 'أسعار الذهب الحية للغرام حسب العيار مع التحويل للعملة المختارة'
                  : 'Live gold gram prices by karat, converted to your selected currency'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <Label className="mb-1.5 block">{isArabic ? 'الوزن (غرام)' : 'Weight (grams)'}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={goldGrams}
                    onChange={(e) => setGoldGrams(e.target.value)}
                    className="text-lg font-semibold"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block">{isArabic ? 'العيار' : 'Karat'}</Label>
                  <Select value={goldKarat} onValueChange={(v) => setGoldKarat(v as typeof goldKarat)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(['24K', '22K', '21K', '18K'] as const).map((k) => (
                        <SelectItem key={k} value={k}>{k}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1.5 block">{isArabic ? 'عملة التسعير' : 'Pricing currency'}</Label>
                  <Select value={goldCurrency} onValueChange={(v) => setGoldCurrency(v as (typeof CURRENCY_ORDER)[number])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY_ORDER.map((code) => (
                        <SelectItem key={code} value={code}>
                          <span className="font-mono me-2">{ratesVsSar[code]?.symbol}</span>
                          {code} — {isArabic ? ratesVsSar[code]?.nameAr : ratesVsSar[code]?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-xl bg-muted/60 p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  {goldGrams}g × {goldKarat} =
                </p>
                <p className="text-3xl font-bold text-amber-500">
                  {goldResult !== null
                    ? `${goldSymbol} ${goldResult.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : '—'}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {isArabic ? 'سعر الغرام' : 'Price per gram'}: {goldSymbol} {(goldPrices[goldKarat] ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                {goldLastUpdated && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {isArabic ? 'تحديث الذهب:' : 'Gold update:'} {new Date(goldLastUpdated).toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {(['24K', '22K', '21K', '18K'] as const).map((k) => (
                  <div key={k} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 text-xs">
                    <Badge variant="outline">{k}</Badge>
                    <span className="font-medium">
                      {goldSymbol} {(goldPrices[k] ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/g
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  {isArabic
                    ? 'المصدر: gold-api.com (XAU/USD) مع تحويل مباشر للعملة المختارة. الأسعار لحظية تقريبية وقد تختلف عند الشراء الفعلي.'
                    : 'Source: gold-api.com (XAU/USD) with live conversion into your selected currency. Prices are indicative and may differ from dealer execution.'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
