'use client';

import { useMemo, useState } from 'react';
import {
  Check,
  ChevronsUpDown,
  Gem,
  LayoutGrid,
  Package,
  Plus,
  TrendingUp,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { createOpaqueId } from '@/lib/ids';
import {
  MARKETS_LIST,
  MARKET_GROUP_LABELS,
  GOLD_FORMS,
  KARAT_OPTIONS,
  type MarketOption,
} from '@/lib/data/financialLists';
import {
  formatCurrency,
  type PortfolioHolding,
  type PortfolioExchange,
} from '@/store/useAppStore';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SecurityType = 'stock' | 'etf' | 'gold' | 'other';

type HoldingDraft = {
  ticker: string;
  name: string;
  exchange: string;
  shares: string;
  avgCost: string;
  currentPrice: string;
  isShariah: boolean;
  units: string;
  purchasePricePerUnit: string;
  currentUnitPrice: string;
  goldForm: (typeof GOLD_FORMS)[number]['value'];
  grams: string;
  karat: (typeof KARAT_OPTIONS)[number];
  purchasePricePerGram: string;
  currentPricePerGram: string;
  assetName: string;
  quantity: string;
  purchasePrice: string;
  currentValue: string;
};

const EMPTY_HOLDING_DRAFT: HoldingDraft = {
  ticker: '',
  name: '',
  exchange: 'TASI',
  shares: '',
  avgCost: '',
  currentPrice: '',
  isShariah: true,
  units: '',
  purchasePricePerUnit: '',
  currentUnitPrice: '',
  goldForm: 'bullion_bar',
  grams: '',
  karat: '24K',
  purchasePricePerGram: '',
  currentPricePerGram: '',
  assetName: '',
  quantity: '',
  purchasePrice: '',
  currentValue: '',
};

const SECURITY_TYPES_WITH_ICONS = [
  { value: 'stock' as const, label: { en: 'Stock', ar: 'سهم' }, icon: TrendingUp },
  { value: 'etf' as const, label: { en: 'ETF', ar: 'صندوق ETF' }, icon: LayoutGrid },
  { value: 'gold' as const, label: { en: 'Gold', ar: 'ذهب' }, icon: Gem },
  { value: 'other' as const, label: { en: 'Other', ar: 'أخرى' }, icon: Package },
];

export type HoldingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isArabic: boolean;
  locale: 'ar' | 'en';
  isSignedIn: boolean;
  onAddHolding: (holding: PortfolioHolding) => void;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase();
}

function getLocalizedMarketLabel(item: MarketOption, isArabic: boolean) {
  return isArabic ? item.label.ar : item.label.en;
}

function getHoldingCurrency(exchange: string): string {
  if (exchange === 'TASI' || exchange === 'NOMU') return 'SAR';
  if (exchange === 'ADX' || exchange === 'DFM' || exchange === 'NASDAQ_DUBAI') return 'AED';
  if (exchange === 'QSE') return 'QAR';
  if (exchange === 'BKK') return 'KWD';
  if (exchange === 'BHB') return 'BHD';
  if (exchange === 'MSX') return 'OMR';
  if (exchange === 'EGX') return 'EGP';
  if (exchange === 'ASE') return 'JOD';
  if (exchange === 'LSE' || exchange === 'LME') return 'GBP';
  if (exchange === 'EURONEXT' || exchange === 'XETRA') return 'EUR';
  if (exchange === 'TSE') return 'JPY';
  if (exchange === 'HKEX') return 'HKD';
  if (exchange === 'SSE') return 'CNY';
  return 'USD';
}

// ─── MarketCombobox (sub-component) ──────────────────────────────────────────

type MarketComboboxProps = {
  isArabic: boolean;
  open: boolean;
  value: string;
  query: string;
  onOpenChange: (open: boolean) => void;
  onQueryChange: (value: string) => void;
  onSelect: (option: MarketOption) => void;
  onSuggest: (value: string) => void;
};

function MarketCombobox({
  isArabic,
  open,
  value,
  query,
  onOpenChange,
  onQueryChange,
  onSelect,
  onSuggest,
}: MarketComboboxProps) {
  const normalizedQuery = normalizeSearchValue(query);

  const filteredOptions = useMemo(() => {
    if (!normalizedQuery) {
      return MARKETS_LIST;
    }
    return MARKETS_LIST.filter((option) =>
      [option.value, option.label.en, option.label.ar].some((candidate) =>
        normalizeSearchValue(candidate).includes(normalizedQuery)
      )
    );
  }, [normalizedQuery]);

  const groupedOptions = useMemo<Record<string, MarketOption[]>>(() => {
    const groups: Record<string, MarketOption[]> = {};
    for (const option of filteredOptions) {
      if (!groups[option.country]) {
        groups[option.country] = [];
      }
      groups[option.country].push(option);
    }
    return groups;
  }, [filteredOptions]);

  const suggestionValue = useMemo(() => {
    if (!normalizedQuery) return '';
    const exactMatch = MARKETS_LIST.some((option) =>
      [option.value, option.label.en, option.label.ar].some(
        (candidate) => normalizeSearchValue(candidate) === normalizedQuery
      )
    );
    return exactMatch ? '' : query.trim();
  }, [normalizedQuery, query]);

  const selectedOption = MARKETS_LIST.find((option) => option.value === value);
  const displayValue = selectedOption
    ? getLocalizedMarketLabel(selectedOption, isArabic)
    : (value || (isArabic ? 'ابحث عن السوق...' : 'Search market or exchange...'));

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between font-normal',
            !value && 'text-muted-foreground',
            isArabic && 'text-right'
          )}
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          <span className="truncate">{displayValue}</span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        <Command dir={isArabic ? 'rtl' : 'ltr'} shouldFilter={false}>
          <CommandInput
            dir={isArabic ? 'rtl' : 'ltr'}
            value={query}
            onValueChange={onQueryChange}
            placeholder={isArabic ? 'ابحث عن السوق...' : 'Search market or exchange...'}
            className={isArabic ? 'text-right' : 'text-left'}
          />
          <CommandList>
            <CommandEmpty>
              {isArabic ? 'لا توجد أسواق مطابقة' : 'No matching markets'}
            </CommandEmpty>
            {Object.entries(groupedOptions).map(([country, options]) => (
              <CommandGroup
                key={country}
                heading={
                  isArabic
                    ? (MARKET_GROUP_LABELS[country]?.ar ?? country)
                    : (MARKET_GROUP_LABELS[country]?.en ?? country)
                }
              >
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={`${option.value}-${option.label.en}-${option.label.ar}`}
                    onSelect={() => onSelect(option)}
                  >
                    <Check
                      className={cn(
                        'h-4 w-4 shrink-0',
                        value === option.value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <span className="truncate">{getLocalizedMarketLabel(option, isArabic)}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
            {suggestionValue ? (
              <CommandGroup>
                <CommandItem
                  value={`suggest-${suggestionValue}`}
                  onSelect={() => onSuggest(suggestionValue)}
                >
                  <Plus className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {isArabic
                      ? `+ اقتراح: "${suggestionValue}"`
                      : `+ Suggest: "${suggestionValue}"`}
                  </span>
                </CommandItem>
              </CommandGroup>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ─── HoldingsDialog ───────────────────────────────────────────────────────────

export function HoldingsDialog({
  open,
  onOpenChange,
  isArabic,
  locale,
  isSignedIn,
  onAddHolding,
}: HoldingsDialogProps) {
  const [securityType, setSecurityType] = useState<SecurityType>('stock');
  const [marketOpen, setMarketOpen] = useState(false);
  const [marketQuery, setMarketQuery] = useState('');
  const [newHolding, setNewHolding] = useState<HoldingDraft>(EMPTY_HOLDING_DRAFT);

  const updateHoldingDraft = (updates: Partial<HoldingDraft>) => {
    setNewHolding((current) => ({ ...current, ...updates }));
  };

  const resetDialog = () => {
    setNewHolding(EMPTY_HOLDING_DRAFT);
    setSecurityType('stock');
    setMarketQuery('');
    setMarketOpen(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      resetDialog();
    }
    onOpenChange(next);
  };

  const handleSelectMarket = (option: MarketOption) => {
    updateHoldingDraft({ exchange: option.value });
    setMarketQuery(option.value);
    setMarketOpen(false);
  };

  const handleSuggestMarket = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    updateHoldingDraft({ exchange: trimmed });
    setMarketQuery(trimmed);
    setMarketOpen(false);
    void submitMarketSuggestion(trimmed);
  };

  const submitMarketSuggestion = async (value: string) => {
    try {
      const response = await fetch('/api/suggestions/market-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value, country: '' }),
      });
      if (response.ok) {
        toast({
          title: isArabic
            ? 'تم إرسال الاقتراح للمراجعة، شكراً لمساهمتك 🙏'
            : 'Suggestion submitted for review — thank you 🙏',
        });
      }
    } catch {
      // Best-effort; never block the form.
    }
  };

  const formatHoldingNumberValue = (value: number, digits = 2) =>
    value.toLocaleString(isArabic ? 'ar-SA' : 'en-US', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });

  const stockCurrency = getHoldingCurrency(newHolding.exchange);

  // ETF computed values
  const etfUnitsValue = Number(newHolding.units) || 0;
  const etfPurchasePriceValue = Number(newHolding.purchasePricePerUnit) || 0;
  const etfCurrentPriceValue = Number(newHolding.currentUnitPrice) || 0;
  const etfTotalCost = etfUnitsValue * etfPurchasePriceValue;
  const etfTotalValue = etfUnitsValue * etfCurrentPriceValue;
  const etfGainLoss = etfTotalValue - etfTotalCost;

  // Gold computed values
  const goldGramsValue = Number(newHolding.grams) || 0;
  const goldPurchasePriceValue = Number(newHolding.purchasePricePerGram) || 0;
  const goldCurrentPriceValue = Number(newHolding.currentPricePerGram) || 0;
  const goldTotalCost = goldGramsValue * goldPurchasePriceValue;
  const goldTotalValue = goldGramsValue * goldCurrentPriceValue;
  const goldGainLoss = goldTotalValue - goldTotalCost;

  // Other computed values
  const otherCurrentValue = Number(newHolding.currentValue) || 0;
  const otherPurchaseValue = Number(newHolding.purchasePrice) || 0;
  const otherGainLoss = otherCurrentValue - otherPurchaseValue;

  const handleAddHolding = () => {
    if (!isSignedIn) {
      toast({
        title: isArabic ? 'يتطلب حساباً' : 'Account required',
        description: isArabic
          ? 'يمكن للضيف تصفح المحفظة التجريبية فقط.'
          : 'Guests can browse the demo portfolio only.',
      });
      return;
    }

    const stockShares = Number(newHolding.shares);
    const stockAvgCost = Number(newHolding.avgCost);
    const stockCurrentPrice = Number(newHolding.currentPrice || newHolding.avgCost);
    const etfUnits = Number(newHolding.units);
    const etfPurchasePrice = Number(newHolding.purchasePricePerUnit);
    const etfCurrentPrice = Number(newHolding.currentUnitPrice || newHolding.purchasePricePerUnit);
    const goldGrams = Number(newHolding.grams);
    const goldPurchasePrice = Number(newHolding.purchasePricePerGram);
    const goldCurrentPrice = Number(newHolding.currentPricePerGram || newHolding.purchasePricePerGram);
    const otherQuantity = Number(newHolding.quantity);
    const otherPurchaseP = Number(newHolding.purchasePrice);
    const otherCurrentV = Number(newHolding.currentValue);

    const isValid =
      (securityType === 'stock' &&
        Boolean(newHolding.ticker.trim()) &&
        stockShares > 0 &&
        stockAvgCost > 0 &&
        stockCurrentPrice > 0) ||
      (securityType === 'etf' &&
        Boolean(newHolding.ticker.trim()) &&
        etfUnits > 0 &&
        etfPurchasePrice > 0 &&
        etfCurrentPrice > 0) ||
      (securityType === 'gold' &&
        goldGrams > 0 &&
        goldPurchasePrice > 0 &&
        goldCurrentPrice > 0 &&
        (newHolding.goldForm !== 'etf_gold' || Boolean(newHolding.ticker.trim()))) ||
      (securityType === 'other' &&
        Boolean(newHolding.assetName.trim()) &&
        otherQuantity > 0 &&
        otherPurchaseP > 0 &&
        otherCurrentV > 0);

    if (!isValid) return;

    let holdingPayload: PortfolioHolding;

    if (securityType === 'stock') {
      holdingPayload = {
        id: createOpaqueId('holding'),
        ticker: newHolding.ticker.toUpperCase(),
        name: newHolding.name || newHolding.ticker.toUpperCase(),
        exchange: newHolding.exchange as PortfolioExchange,
        shares: stockShares,
        avgCost: stockAvgCost,
        currentPrice: stockCurrentPrice,
        sector: 'Other',
        isShariah: newHolding.isShariah,
        securityType,
      };
    } else if (securityType === 'etf') {
      holdingPayload = {
        id: createOpaqueId('holding'),
        ticker: newHolding.ticker.toUpperCase(),
        name: newHolding.name || newHolding.ticker.toUpperCase(),
        exchange: newHolding.exchange as PortfolioExchange,
        shares: etfUnits,
        avgCost: etfPurchasePrice,
        currentPrice: etfCurrentPrice,
        sector: 'Funds',
        isShariah: newHolding.isShariah,
        securityType,
        units: etfUnits,
        purchasePricePerUnit: etfPurchasePrice,
        currentUnitPrice: etfCurrentPrice,
      };
    } else if (securityType === 'gold') {
      const goldFormLabel = GOLD_FORMS.find((form) => form.value === newHolding.goldForm)?.label.en ?? 'Gold';
      holdingPayload = {
        id: createOpaqueId('holding'),
        ticker: newHolding.goldForm === 'etf_gold' ? newHolding.ticker.toUpperCase() : '',
        name: newHolding.name || goldFormLabel,
        exchange: newHolding.exchange as PortfolioExchange,
        shares: goldGrams,
        avgCost: goldPurchasePrice,
        currentPrice: goldCurrentPrice,
        sector: 'Precious Metals',
        isShariah: newHolding.isShariah,
        securityType,
        goldForm: newHolding.goldForm as PortfolioHolding['goldForm'],
        grams: goldGrams,
        karat: newHolding.karat as PortfolioHolding['karat'],
        purchasePricePerGram: goldPurchasePrice,
        currentPricePerGram: goldCurrentPrice,
      };
    } else {
      holdingPayload = {
        id: createOpaqueId('holding'),
        ticker: '',
        name: newHolding.assetName,
        exchange: newHolding.exchange as PortfolioExchange,
        shares: Number(newHolding.quantity),
        avgCost: Number(newHolding.purchasePrice) / Number(newHolding.quantity),
        currentPrice: Number(newHolding.currentValue) / Number(newHolding.quantity),
        sector: 'Alternative Assets',
        isShariah: newHolding.isShariah,
        securityType,
        assetName: newHolding.assetName,
      };
    }

    onAddHolding(holdingPayload);
    resetDialog();
    onOpenChange(false);

    toast({
      title: isArabic ? 'تم تحديث المركز' : 'Holding updated',
      description: isArabic
        ? 'إذا كان الرمز موجوداً مسبقاً، تم دمج الكمية وتحديث متوسط التكلفة.'
        : 'If the holding already existed, shares were merged and the average cost was updated.',
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent dir={isArabic ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>{isArabic ? 'إضافة مركز جديد' : 'Add New Holding'}</DialogTitle>
          <DialogDescription>
            {isArabic
              ? 'أضف مركزاً جديداً مع نوع أصل وسوق وبيانات تسعير أدق'
              : 'Add a new holding with a market, asset type, and pricing details'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4" dir={isArabic ? 'rtl' : 'ltr'}>
          {/* Security type pill selector */}
          <div className="space-y-2" dir={isArabic ? 'rtl' : 'ltr'}>
            <Label dir={isArabic ? 'rtl' : 'ltr'}>
              {isArabic ? 'نوع الورقة المالية' : 'Security Type'}
            </Label>
            <div
              dir={isArabic ? 'rtl' : 'ltr'}
              className={cn('flex flex-wrap gap-2', isArabic && 'flex-row-reverse')}
            >
              {SECURITY_TYPES_WITH_ICONS.map((option) => {
                const Icon = option.icon;
                const active = securityType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSecurityType(option.value);
                      // Reset type-specific fields on type change
                      setNewHolding((current) => ({
                        ...EMPTY_HOLDING_DRAFT,
                        exchange: current.exchange,
                        name: current.name,
                        isShariah: current.isShariah,
                      }));
                    }}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors',
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80',
                      isArabic && 'flex-row-reverse'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{isArabic ? option.label.ar : option.label.en}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ticker + Market row */}
          <div className="grid gap-4 md:grid-cols-2" dir={isArabic ? 'rtl' : 'ltr'}>
            {(securityType === 'stock' ||
              securityType === 'etf' ||
              (securityType === 'gold' && newHolding.goldForm === 'etf_gold')) ? (
              <div className="space-y-2" dir={isArabic ? 'rtl' : 'ltr'}>
                <Label dir={isArabic ? 'rtl' : 'ltr'}>
                  {securityType === 'stock'
                    ? (isArabic ? 'رمز السهم' : 'Symbol / Ticker')
                    : (isArabic ? 'رمز الصندوق' : 'ETF Symbol')}
                </Label>
                <Input
                  dir={isArabic ? 'rtl' : 'ltr'}
                  value={newHolding.ticker}
                  onChange={(e) => updateHoldingDraft({ ticker: e.target.value.toUpperCase() })}
                  placeholder={securityType === 'stock' ? '2222.SR' : 'SPY'}
                  className={isArabic ? 'text-right' : 'text-left'}
                />
              </div>
            ) : null}

            <div className="space-y-2" dir={isArabic ? 'rtl' : 'ltr'}>
              <Label dir={isArabic ? 'rtl' : 'ltr'}>{isArabic ? 'السوق' : 'Market'}</Label>
              <MarketCombobox
                isArabic={isArabic}
                open={marketOpen}
                value={newHolding.exchange}
                query={marketQuery}
                onOpenChange={setMarketOpen}
                onQueryChange={(value) => {
                  setMarketQuery(value);
                  updateHoldingDraft({ exchange: value });
                }}
                onSelect={handleSelectMarket}
                onSuggest={handleSuggestMarket}
              />
            </div>
          </div>

          {/* Name / Asset Name */}
          <div className="space-y-2" dir={isArabic ? 'rtl' : 'ltr'}>
            <Label dir={isArabic ? 'rtl' : 'ltr'}>
              {securityType === 'other'
                ? (isArabic ? 'اسم الأصل' : 'Asset Name')
                : (isArabic ? 'الاسم' : 'Name')}
            </Label>
            <Input
              dir={isArabic ? 'rtl' : 'ltr'}
              value={securityType === 'other' ? newHolding.assetName : newHolding.name}
              onChange={(e) =>
                updateHoldingDraft(
                  securityType === 'other'
                    ? { assetName: e.target.value }
                    : { name: e.target.value }
                )
              }
              className={isArabic ? 'text-right' : 'text-left'}
            />
          </div>

          {/* Conditional fields by security type */}
          <AnimatePresence mode="wait">
            {securityType === 'stock' ? (
              <motion.div
                key="stock-fields"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <div className="grid gap-4 md:grid-cols-2" dir={isArabic ? 'rtl' : 'ltr'}>
                  <div className="space-y-2" dir={isArabic ? 'rtl' : 'ltr'}>
                    <Label dir={isArabic ? 'rtl' : 'ltr'}>
                      {isArabic ? 'عدد الأسهم' : 'Number of Shares'}
                    </Label>
                    <Input
                      dir={isArabic ? 'rtl' : 'ltr'}
                      type="number"
                      min="0.0001"
                      step="0.0001"
                      value={newHolding.shares}
                      onChange={(e) => updateHoldingDraft({ shares: e.target.value })}
                      className={isArabic ? 'text-right' : 'text-left'}
                    />
                  </div>
                  <div className="space-y-2" dir={isArabic ? 'rtl' : 'ltr'}>
                    <Label dir={isArabic ? 'rtl' : 'ltr'}>
                      {isArabic ? 'سعر الشراء للسهم' : 'Purchase Price per Share'}
                    </Label>
                    <div className="relative">
                      <Input
                        dir={isArabic ? 'rtl' : 'ltr'}
                        type="number"
                        min="0"
                        step="0.01"
                        value={newHolding.avgCost}
                        onChange={(e) => updateHoldingDraft({ avgCost: e.target.value })}
                        className={cn(isArabic ? 'pl-12 text-right' : 'pr-12 text-left')}
                      />
                      <span className={cn('absolute top-1/2 -translate-y-1/2 text-xs text-muted-foreground', isArabic ? 'left-3' : 'right-3')}>
                        {stockCurrency}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2" dir={isArabic ? 'rtl' : 'ltr'}>
                    <Label dir={isArabic ? 'rtl' : 'ltr'}>
                      {isArabic ? 'السعر الحالي للسهم' : 'Current Price per Share'}
                    </Label>
                    <div className="relative">
                      <Input
                        dir={isArabic ? 'rtl' : 'ltr'}
                        type="number"
                        min="0"
                        step="0.01"
                        value={newHolding.currentPrice}
                        onChange={(e) => updateHoldingDraft({ currentPrice: e.target.value })}
                        className={cn(isArabic ? 'pl-12 text-right' : 'pr-12 text-left')}
                      />
                      <span className={cn('absolute top-1/2 -translate-y-1/2 text-xs text-muted-foreground', isArabic ? 'left-3' : 'right-3')}>
                        {stockCurrency}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}

            {securityType === 'etf' ? (
              <motion.div
                key="etf-fields"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2" dir={isArabic ? 'rtl' : 'ltr'}>
                    <div className="space-y-2" dir={isArabic ? 'rtl' : 'ltr'}>
                      <Label dir={isArabic ? 'rtl' : 'ltr'}>
                        {isArabic ? 'عدد الوحدات' : 'Number of Units'}
                      </Label>
                      <Input
                        dir={isArabic ? 'rtl' : 'ltr'}
                        type="number"
                        min="0.0001"
                        step="0.0001"
                        value={newHolding.units}
                        onChange={(e) => updateHoldingDraft({ units: e.target.value })}
                        className={isArabic ? 'text-right' : 'text-left'}
                      />
                    </div>
                    <div className="space-y-2" dir={isArabic ? 'rtl' : 'ltr'}>
                      <Label dir={isArabic ? 'rtl' : 'ltr'}>
                        {isArabic ? 'سعر الشراء للوحدة' : 'Purchase Price per Unit'}
                      </Label>
                      <div className="relative">
                        <Input
                          dir={isArabic ? 'rtl' : 'ltr'}
                          type="number"
                          min="0"
                          step="0.01"
                          value={newHolding.purchasePricePerUnit}
                          onChange={(e) => updateHoldingDraft({ purchasePricePerUnit: e.target.value })}
                          className={cn(isArabic ? 'pl-12 text-right' : 'pr-12 text-left')}
                        />
                        <span className={cn('absolute top-1/2 -translate-y-1/2 text-xs text-muted-foreground', isArabic ? 'left-3' : 'right-3')}>
                          {stockCurrency}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2" dir={isArabic ? 'rtl' : 'ltr'}>
                      <Label dir={isArabic ? 'rtl' : 'ltr'}>
                        {isArabic ? 'السعر الحالي للوحدة' : 'Current Unit Price'}
                      </Label>
                      <div className="relative">
                        <Input
                          dir={isArabic ? 'rtl' : 'ltr'}
                          type="number"
                          min="0"
                          step="0.01"
                          value={newHolding.currentUnitPrice}
                          onChange={(e) => updateHoldingDraft({ currentUnitPrice: e.target.value })}
                          className={cn(isArabic ? 'pl-12 text-right' : 'pr-12 text-left')}
                        />
                        <span className={cn('absolute top-1/2 -translate-y-1/2 text-xs text-muted-foreground', isArabic ? 'left-3' : 'right-3')}>
                          {stockCurrency}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* ETF computed summary */}
                  <div className="grid gap-3 rounded-xl bg-muted/40 p-4 md:grid-cols-3" dir={isArabic ? 'rtl' : 'ltr'}>
                    <div className={isArabic ? 'text-right' : 'text-left'}>
                      <p className="text-xs text-muted-foreground">
                        {isArabic ? 'القيمة الإجمالية' : 'Total Value'}
                      </p>
                      <p className="tabular-nums font-semibold">
                        {formatCurrency(etfTotalValue, stockCurrency, locale)}
                      </p>
                    </div>
                    <div className={isArabic ? 'text-right' : 'text-left'}>
                      <p className="text-xs text-muted-foreground">
                        {isArabic ? 'إجمالي التكلفة' : 'Total Cost'}
                      </p>
                      <p className="tabular-nums font-semibold">
                        {formatCurrency(etfTotalCost, stockCurrency, locale)}
                      </p>
                    </div>
                    <div className={isArabic ? 'text-right' : 'text-left'}>
                      <p className="text-xs text-muted-foreground">
                        {isArabic ? 'الربح / الخسارة' : 'Gain / Loss'}
                      </p>
                      <p
                        className={cn(
                          'tabular-nums font-semibold',
                          etfGainLoss > 0
                            ? 'text-green-600 dark:text-green-400'
                            : etfGainLoss < 0
                              ? 'text-red-500'
                              : 'text-muted-foreground'
                        )}
                      >
                        {formatCurrency(etfGainLoss, stockCurrency, locale)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}

            {securityType === 'gold' ? (
              <motion.div
                key="gold-fields"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2" dir={isArabic ? 'rtl' : 'ltr'}>
                    <div className="space-y-2" dir={isArabic ? 'rtl' : 'ltr'}>
                      <Label dir={isArabic ? 'rtl' : 'ltr'}>
                        {isArabic ? 'شكل الذهب' : 'Gold Form'}
                      </Label>
                      <Select
                        value={newHolding.goldForm}
                        onValueChange={(value) =>
                          updateHoldingDraft({ goldForm: value as HoldingDraft['goldForm'] })
                        }
                      >
                        <SelectTrigger dir={isArabic ? 'rtl' : 'ltr'}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent dir={isArabic ? 'rtl' : 'ltr'}>
                          {GOLD_FORMS.map((form) => (
                            <SelectItem key={form.value} value={form.value}>
                              {isArabic ? form.label.ar : form.label.en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2" dir={isArabic ? 'rtl' : 'ltr'}>
                      <Label dir={isArabic ? 'rtl' : 'ltr'}>
                        {isArabic ? 'العيار' : 'Karat'}
                      </Label>
                      <Select
                        value={newHolding.karat}
                        onValueChange={(value) =>
                          updateHoldingDraft({ karat: value as HoldingDraft['karat'] })
                        }
                      >
                        <SelectTrigger dir={isArabic ? 'rtl' : 'ltr'}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent dir={isArabic ? 'rtl' : 'ltr'}>
                          {KARAT_OPTIONS.map((karat) => (
                            <SelectItem key={karat} value={karat}>
                              {karat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {newHolding.goldForm === 'etf_gold' ? (
                      <div className="space-y-2 md:col-span-2" dir={isArabic ? 'rtl' : 'ltr'}>
                        <Label dir={isArabic ? 'rtl' : 'ltr'}>
                          {isArabic ? 'رمز الصندوق (اختياري)' : 'ETF Symbol (optional)'}
                        </Label>
                        <Input
                          dir={isArabic ? 'rtl' : 'ltr'}
                          value={newHolding.ticker}
                          onChange={(e) => updateHoldingDraft({ ticker: e.target.value.toUpperCase() })}
                          placeholder="GLD"
                          className={isArabic ? 'text-right' : 'text-left'}
                        />
                      </div>
                    ) : null}
                    <div className="space-y-2" dir={isArabic ? 'rtl' : 'ltr'}>
                      <Label dir={isArabic ? 'rtl' : 'ltr'}>
                        {isArabic ? 'الوزن (جرام)' : 'Weight in grams'}
                      </Label>
                      <Input
                        dir={isArabic ? 'rtl' : 'ltr'}
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={newHolding.grams}
                        onChange={(e) => updateHoldingDraft({ grams: e.target.value })}
                        className={isArabic ? 'text-right' : 'text-left'}
                      />
                    </div>
                    <div className="space-y-2" dir={isArabic ? 'rtl' : 'ltr'}>
                      <Label dir={isArabic ? 'rtl' : 'ltr'}>
                        {isArabic ? 'سعر الشراء للجرام' : 'Purchase Price per Gram'}
                      </Label>
                      <div className="relative">
                        <Input
                          dir={isArabic ? 'rtl' : 'ltr'}
                          type="number"
                          min="0"
                          step="0.01"
                          value={newHolding.purchasePricePerGram}
                          onChange={(e) => updateHoldingDraft({ purchasePricePerGram: e.target.value })}
                          className={cn(isArabic ? 'pl-12 text-right' : 'pr-12 text-left')}
                        />
                        <span className={cn('absolute top-1/2 -translate-y-1/2 text-xs text-muted-foreground', isArabic ? 'left-3' : 'right-3')}>
                          {stockCurrency}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2" dir={isArabic ? 'rtl' : 'ltr'}>
                      <Label dir={isArabic ? 'rtl' : 'ltr'}>
                        {isArabic ? 'السعر الحالي للجرام' : 'Current Price per Gram'}
                      </Label>
                      <div className="relative">
                        <Input
                          dir={isArabic ? 'rtl' : 'ltr'}
                          type="number"
                          min="0"
                          step="0.01"
                          value={newHolding.currentPricePerGram}
                          onChange={(e) => updateHoldingDraft({ currentPricePerGram: e.target.value })}
                          className={cn(isArabic ? 'pl-12 text-right' : 'pr-12 text-left')}
                        />
                        <span className={cn('absolute top-1/2 -translate-y-1/2 text-xs text-muted-foreground', isArabic ? 'left-3' : 'right-3')}>
                          {stockCurrency}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Gold computed summary */}
                  <div className="grid gap-3 rounded-xl bg-muted/40 p-4 md:grid-cols-3" dir={isArabic ? 'rtl' : 'ltr'}>
                    <div className={isArabic ? 'text-right' : 'text-left'}>
                      <p className="text-xs text-muted-foreground">
                        {isArabic ? 'القيمة الإجمالية' : 'Total Value'}
                      </p>
                      <p className="tabular-nums font-semibold">
                        {formatCurrency(goldTotalValue, stockCurrency, locale)}
                      </p>
                    </div>
                    <div className={isArabic ? 'text-right' : 'text-left'}>
                      <p className="text-xs text-muted-foreground">
                        {isArabic ? 'إجمالي التكلفة' : 'Total Cost'}
                      </p>
                      <p className="tabular-nums font-semibold">
                        {formatCurrency(goldTotalCost, stockCurrency, locale)}
                      </p>
                    </div>
                    <div className={isArabic ? 'text-right' : 'text-left'}>
                      <p className="text-xs text-muted-foreground">
                        {isArabic ? 'الربح / الخسارة' : 'Gain / Loss'}
                      </p>
                      <p
                        className={cn(
                          'tabular-nums font-semibold',
                          goldGainLoss > 0
                            ? 'text-green-600 dark:text-green-400'
                            : goldGainLoss < 0
                              ? 'text-red-500'
                              : 'text-muted-foreground'
                        )}
                      >
                        {formatCurrency(goldGainLoss, stockCurrency, locale)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}

            {securityType === 'other' ? (
              <motion.div
                key="other-fields"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2" dir={isArabic ? 'rtl' : 'ltr'}>
                    <div className="space-y-2" dir={isArabic ? 'rtl' : 'ltr'}>
                      <Label dir={isArabic ? 'rtl' : 'ltr'}>
                        {isArabic ? 'الكمية / الوحدات' : 'Quantity / Units'}
                      </Label>
                      <Input
                        dir={isArabic ? 'rtl' : 'ltr'}
                        type="number"
                        min="0"
                        step="0.01"
                        value={newHolding.quantity}
                        onChange={(e) => updateHoldingDraft({ quantity: e.target.value })}
                        className={isArabic ? 'text-right' : 'text-left'}
                      />
                    </div>
                    <div className="space-y-2" dir={isArabic ? 'rtl' : 'ltr'}>
                      <Label dir={isArabic ? 'rtl' : 'ltr'}>
                        {isArabic ? 'سعر الشراء (إجمالي)' : 'Purchase Price total'}
                      </Label>
                      <div className="relative">
                        <Input
                          dir={isArabic ? 'rtl' : 'ltr'}
                          type="number"
                          min="0"
                          step="0.01"
                          value={newHolding.purchasePrice}
                          onChange={(e) => updateHoldingDraft({ purchasePrice: e.target.value })}
                          className={cn(isArabic ? 'pl-12 text-right' : 'pr-12 text-left')}
                        />
                        <span className={cn('absolute top-1/2 -translate-y-1/2 text-xs text-muted-foreground', isArabic ? 'left-3' : 'right-3')}>
                          {stockCurrency}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2" dir={isArabic ? 'rtl' : 'ltr'}>
                      <Label dir={isArabic ? 'rtl' : 'ltr'}>
                        {isArabic ? 'القيمة الحالية' : 'Current Value'}
                      </Label>
                      <div className="relative">
                        <Input
                          dir={isArabic ? 'rtl' : 'ltr'}
                          type="number"
                          min="0"
                          step="0.01"
                          value={newHolding.currentValue}
                          onChange={(e) => updateHoldingDraft({ currentValue: e.target.value })}
                          className={cn(isArabic ? 'pl-12 text-right' : 'pr-12 text-left')}
                        />
                        <span className={cn('absolute top-1/2 -translate-y-1/2 text-xs text-muted-foreground', isArabic ? 'left-3' : 'right-3')}>
                          {stockCurrency}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-muted/40 p-4" dir={isArabic ? 'rtl' : 'ltr'}>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? 'الربح / الخسارة' : 'Gain / Loss'}
                    </p>
                    <p
                      className={cn(
                        'tabular-nums font-semibold',
                        otherGainLoss > 0
                          ? 'text-green-600 dark:text-green-400'
                          : otherGainLoss < 0
                            ? 'text-red-500'
                            : 'text-muted-foreground'
                      )}
                    >
                      {formatCurrency(otherGainLoss, stockCurrency, locale)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Notes / formatting helper */}
          <p className="text-xs text-muted-foreground" dir={isArabic ? 'rtl' : 'ltr'}>
            {isArabic
              ? 'سيتم تحديث متوسط التكلفة تلقائيًا إذا كان الرمز موجوداً مسبقاً.'
              : 'If the ticker already exists, shares and average cost will be merged automatically.'}
          </p>
        </div>

        <DialogFooter dir={isArabic ? 'rtl' : 'ltr'}>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {isArabic ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button onClick={handleAddHolding} disabled={!isSignedIn}>
            {isArabic ? 'إضافة' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
