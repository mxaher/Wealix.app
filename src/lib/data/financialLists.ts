/**
 * Shared financial data lists used across BudgetPlanningPage and portfolio/HoldingsDialog.
 * Import from here — never redefine these arrays inside component functions.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type SavingsOption = {
  value: string;
  label: {
    en: string;
    ar: string;
  };
};

export type BankOption = SavingsOption & {
  country: string;
};

export type MarketOption = {
  value: string;
  label: {
    en: string;
    ar: string;
  };
  country: string;
};

export type SecurityTypeOption = {
  value: 'stock' | 'etf' | 'gold' | 'other';
  label: {
    en: string;
    ar: string;
  };
  iconName: string;
};

export type GoldFormOption = {
  value: string;
  label: {
    en: string;
    ar: string;
  };
};

// ─── Savings Account Names ────────────────────────────────────────────────────

export const SAVINGS_ACCOUNT_NAMES: SavingsOption[] = [
  { value: 'al_rajhi_awaeed', label: { en: 'Al Rajhi — Awaeed Account', ar: 'الراجحي — حساب عوائد' } },
  { value: 'al_rajhi_mudarabah', label: { en: 'Al Rajhi — Mudarabah Account', ar: 'الراجحي — حساب المضاربة' } },
  { value: 'al_rajhi_current', label: { en: 'Al Rajhi — Current Account', ar: 'الراجحي — الحساب الجاري' } },
  { value: 'snb_saver', label: { en: 'SNB — Savings Account', ar: 'البنك الأهلي — حساب التوفير' } },
  { value: 'snb_almujdy', label: { en: 'SNB — Al Mujdy Account', ar: 'البنك الأهلي — حساب المجدي' } },
  { value: 'riyad_hassad', label: { en: 'Riyad Bank — Hassad Account', ar: 'بنك الرياض — حساب الحصاد' } },
  { value: 'riyad_savings', label: { en: 'Riyad Bank — Savings Account', ar: 'بنك الرياض — حساب التوفير' } },
  { value: 'albilad_wefak', label: { en: 'Al Bilad — Wefak Account', ar: 'بنك البلاد — حساب وفاق' } },
  { value: 'albilad_savings', label: { en: 'Al Bilad — Savings Account', ar: 'بنك البلاد — حساب التوفير' } },
  { value: 'alinma_savings', label: { en: 'Alinma Bank — Savings Account', ar: 'بنك الإنماء — حساب التوفير' } },
  { value: 'alinma_tawfeer', label: { en: 'Alinma Bank — Tawfeer Account', ar: 'بنك الإنماء — حساب توفير' } },
  { value: 'samba_savings', label: { en: 'Samba — Savings Account', ar: 'سامبا — حساب التوفير' } },
  { value: 'anb_savings', label: { en: 'ANB — Savings Account', ar: 'البنك العربي الوطني — حساب التوفير' } },
  { value: 'saib_savings', label: { en: 'SAIB — Savings Account', ar: 'البنك السعودي للاستثمار — حساب التوفير' } },
  { value: 'adcb_active_saver', label: { en: 'ADCB — Active Saver', ar: 'أبوظبي التجاري — حساب التوفير' } },
  { value: 'fab_savings', label: { en: 'FAB — Savings Account', ar: 'بنك أبوظبي الأول — حساب التوفير' } },
  { value: 'emirates_nbd_savings', label: { en: 'Emirates NBD — Savings Account', ar: 'الإمارات NBD — حساب التوفير' } },
  { value: 'mashreq_savings', label: { en: 'Mashreq — Savings Account', ar: 'مصرف المشرق — حساب التوفير' } },
  { value: 'qnb_savings', label: { en: 'QNB — Savings Account', ar: 'بنك قطر الوطني — حساب التوفير' } },
  { value: 'qatar_islamic_savings', label: { en: 'Qatar Islamic Bank — Savings', ar: 'بنك قطر الإسلامي — حساب التوفير' } },
  { value: 'nbk_savings', label: { en: 'NBK — Savings Account', ar: 'بنك الكويت الوطني — حساب التوفير' } },
  { value: 'kfh_savings', label: { en: 'KFH — Savings Account', ar: 'بيت التمويل الكويتي — حساب التوفير' } },
  { value: 'ahli_bahrain_savings', label: { en: 'Ahli United — Savings Account', ar: 'الأهلي المتحد — حساب التوفير' } },
  { value: 'arab_bank_savings', label: { en: 'Arab Bank — Savings Account', ar: 'البنك العربي — حساب التوفير' } },
  { value: 'cairo_amman_savings', label: { en: 'Cairo Amman Bank — Savings', ar: 'بنك القاهرة عمان — حساب التوفير' } },
  { value: 'nbe_savings', label: { en: 'NBE — Savings Account', ar: 'البنك الأهلي المصري — حساب التوفير' } },
  { value: 'cib_savings', label: { en: 'CIB — Savings Account', ar: 'البنك التجاري الدولي — حساب التوفير' } },
  { value: 'qnb_egypt_savings', label: { en: 'QNB Egypt — Savings Account', ar: 'QNB مصر — حساب التوفير' } },
  { value: 'banque_misr_savings', label: { en: 'Banque Misr — Savings', ar: 'بنك مصر — حساب التوفير' } },
  { value: 'term_deposit', label: { en: 'Term Deposit (Generic)', ar: 'وديعة لأجل (عام)' } },
  { value: 'other_savings', label: { en: 'Other / Custom', ar: 'حساب آخر / مخصص' } },
];

// ─── Gulf Banks ───────────────────────────────────────────────────────────────

export const GULF_BANKS: BankOption[] = [
  { value: 'Al Rajhi Bank', label: { en: 'Al Rajhi Bank', ar: 'مصرف الراجحي' }, country: 'SA' },
  { value: 'Saudi National Bank (SNB)', label: { en: 'Saudi National Bank (SNB)', ar: 'البنك الأهلي السعودي (SNB)' }, country: 'SA' },
  { value: 'Riyad Bank', label: { en: 'Riyad Bank', ar: 'بنك الرياض' }, country: 'SA' },
  { value: 'Bank AlBilad', label: { en: 'Bank AlBilad', ar: 'بنك البلاد' }, country: 'SA' },
  { value: 'Alinma Bank', label: { en: 'Alinma Bank', ar: 'بنك الإنماء' }, country: 'SA' },
  { value: 'Arab National Bank (ANB)', label: { en: 'Arab National Bank (ANB)', ar: 'البنك العربي الوطني' }, country: 'SA' },
  { value: 'Banque Saudi Fransi', label: { en: 'Banque Saudi Fransi', ar: 'البنك السعودي الفرنسي' }, country: 'SA' },
  { value: 'SAMBA Financial Group', label: { en: 'SAMBA Financial Group', ar: 'مجموعة سامبا المالية' }, country: 'SA' },
  { value: 'Saudi Investment Bank (SAIB)', label: { en: 'Saudi Investment Bank (SAIB)', ar: 'البنك السعودي للاستثمار' }, country: 'SA' },
  { value: 'Gulf International Bank (GIB)', label: { en: 'Gulf International Bank (GIB)', ar: 'بنك الخليج الدولي' }, country: 'SA' },
  { value: 'Emirates NBD', label: { en: 'Emirates NBD', ar: 'الإمارات NBD' }, country: 'AE' },
  { value: 'Abu Dhabi Commercial Bank (ADCB)', label: { en: 'Abu Dhabi Commercial Bank (ADCB)', ar: 'بنك أبوظبي التجاري' }, country: 'AE' },
  { value: 'First Abu Dhabi Bank (FAB)', label: { en: 'First Abu Dhabi Bank (FAB)', ar: 'بنك أبوظبي الأول' }, country: 'AE' },
  { value: 'Dubai Islamic Bank (DIB)', label: { en: 'Dubai Islamic Bank (DIB)', ar: 'بنك دبي الإسلامي' }, country: 'AE' },
  { value: 'Mashreq Bank', label: { en: 'Mashreq Bank', ar: 'مصرف المشرق' }, country: 'AE' },
  { value: 'ENBD Bank', label: { en: 'ENBD Bank', ar: 'بنك الإمارات دبي الوطني' }, country: 'AE' },
  { value: 'Qatar National Bank (QNB)', label: { en: 'Qatar National Bank (QNB)', ar: 'بنك قطر الوطني' }, country: 'QA' },
  { value: 'Qatar Islamic Bank (QIB)', label: { en: 'Qatar Islamic Bank (QIB)', ar: 'بنك قطر الإسلامي' }, country: 'QA' },
  { value: 'Commercial Bank of Qatar', label: { en: 'Commercial Bank of Qatar', ar: 'البنك التجاري القطري' }, country: 'QA' },
  { value: 'National Bank of Kuwait (NBK)', label: { en: 'National Bank of Kuwait (NBK)', ar: 'بنك الكويت الوطني' }, country: 'KW' },
  { value: 'Kuwait Finance House (KFH)', label: { en: 'Kuwait Finance House (KFH)', ar: 'بيت التمويل الكويتي' }, country: 'KW' },
  { value: 'Gulf Bank Kuwait', label: { en: 'Gulf Bank Kuwait', ar: 'بنك الخليج - الكويت' }, country: 'KW' },
  { value: 'Ahli United Bank (Bahrain)', label: { en: 'Ahli United Bank (Bahrain)', ar: 'بنك الأهلي المتحد - البحرين' }, country: 'BH' },
  { value: 'Bank of Bahrain and Kuwait (BBK)', label: { en: 'BBK — Bank of Bahrain and Kuwait', ar: 'بنك البحرين والكويت' }, country: 'BH' },
  { value: 'Bank Muscat', label: { en: 'Bank Muscat', ar: 'بنك مسقط' }, country: 'OM' },
  { value: 'National Bank of Oman (NBO)', label: { en: 'National Bank of Oman (NBO)', ar: 'البنك الوطني العماني' }, country: 'OM' },
  { value: 'Arab Bank (Jordan)', label: { en: 'Arab Bank (Jordan)', ar: 'البنك العربي - الأردن' }, country: 'JO' },
  { value: 'Cairo Amman Bank', label: { en: 'Cairo Amman Bank', ar: 'بنك القاهرة عمان' }, country: 'JO' },
  { value: 'Jordan Ahli Bank', label: { en: 'Jordan Ahli Bank', ar: 'البنك الأهلي الأردني' }, country: 'JO' },
  { value: 'National Bank of Egypt (NBE)', label: { en: 'National Bank of Egypt (NBE)', ar: 'البنك الأهلي المصري' }, country: 'EG' },
  { value: 'Banque Misr', label: { en: 'Banque Misr', ar: 'بنك مصر' }, country: 'EG' },
  { value: 'Commercial International Bank (CIB)', label: { en: 'Commercial International Bank (CIB)', ar: 'البنك التجاري الدولي - CIB' }, country: 'EG' },
  { value: 'QNB Egypt', label: { en: 'QNB Egypt', ar: 'QNB مصر' }, country: 'EG' },
  { value: 'HSBC Egypt', label: { en: 'HSBC Egypt', ar: 'HSBC مصر' }, country: 'EG' },
  { value: 'Arab African International Bank (AAIB)', label: { en: 'AAIB — Arab African International Bank', ar: 'البنك العربي الأفريقي الدولي' }, country: 'EG' },
  { value: 'Other', label: { en: 'Other / Custom Bank', ar: 'بنك آخر / مخصص' }, country: '' },
];

export const BANK_GROUP_LABELS: Record<string, string> = {
  SA: '🇸🇦 السعودية',
  AE: '🇦🇪 الإمارات',
  QA: '🇶🇦 قطر',
  KW: '🇰🇼 الكويت',
  BH: '🇧🇭 البحرين',
  OM: '🇴🇲 عُمان',
  JO: '🇯🇴 الأردن',
  EG: '🇪🇬 مصر',
};

// ─── Markets ──────────────────────────────────────────────────────────────────

export const MARKETS_LIST: MarketOption[] = [
  { value: 'TASI', label: { en: 'TASI — Saudi Stock Exchange', ar: 'تداول — السوق المالية السعودية' }, country: 'SA' },
  { value: 'NOMU', label: { en: 'Nomu — Saudi Parallel Market', ar: 'نمو — السوق الموازية السعودية' }, country: 'SA' },
  { value: 'ADX', label: { en: 'ADX — Abu Dhabi Securities Exchange', ar: 'سوق أبوظبي للأوراق المالية' }, country: 'AE' },
  { value: 'DFM', label: { en: 'DFM — Dubai Financial Market', ar: 'سوق دبي المالي' }, country: 'AE' },
  { value: 'NASDAQ_DUBAI', label: { en: 'Nasdaq Dubai', ar: 'ناسداك دبي' }, country: 'AE' },
  { value: 'QSE', label: { en: 'QSE — Qatar Stock Exchange', ar: 'بورصة قطر' }, country: 'QA' },
  { value: 'BKK', label: { en: 'Boursa Kuwait', ar: 'بورصة الكويت' }, country: 'KW' },
  { value: 'BHB', label: { en: 'Bahrain Bourse', ar: 'بورصة البحرين' }, country: 'BH' },
  { value: 'MSX', label: { en: 'Muscat Stock Exchange', ar: 'بورصة مسقط' }, country: 'OM' },
  { value: 'EGX', label: { en: 'EGX — Egyptian Exchange', ar: 'البورصة المصرية' }, country: 'EG' },
  { value: 'ASE', label: { en: 'ASE — Amman Stock Exchange', ar: 'بورصة عمان' }, country: 'JO' },
  { value: 'NASDAQ', label: { en: 'Nasdaq (US)', ar: 'ناسداك (الولايات المتحدة)' }, country: 'US' },
  { value: 'NYSE', label: { en: 'NYSE — New York Stock Exchange', ar: 'بورصة نيويورك' }, country: 'US' },
  { value: 'AMEX', label: { en: 'NYSE American (AMEX)', ar: 'بورصة أمريكان' }, country: 'US' },
  { value: 'LSE', label: { en: 'LSE — London Stock Exchange', ar: 'بورصة لندن' }, country: 'GB' },
  { value: 'EURONEXT', label: { en: 'Euronext', ar: 'يورونكست' }, country: 'EU' },
  { value: 'XETRA', label: { en: 'Xetra — Frankfurt', ar: 'بورصة فرانكفورت' }, country: 'DE' },
  { value: 'TSE', label: { en: 'TSE — Tokyo Stock Exchange', ar: 'بورصة طوكيو' }, country: 'JP' },
  { value: 'HKEX', label: { en: 'HKEX — Hong Kong', ar: 'بورصة هونغ كونغ' }, country: 'HK' },
  { value: 'SSE', label: { en: 'SSE — Shanghai', ar: 'بورصة شنغهاي' }, country: 'CN' },
  { value: 'COMEX', label: { en: 'COMEX — Commodities (Gold/Silver)', ar: 'كوميكس — السلع (ذهب / فضة)' }, country: 'GLOBAL' },
  { value: 'LME', label: { en: 'LME — London Metals Exchange', ar: 'بورصة المعادن لندن' }, country: 'GB' },
  { value: 'CRYPTO', label: { en: 'Crypto Markets (Global)', ar: 'أسواق العملات الرقمية' }, country: 'GLOBAL' },
  { value: 'OTC', label: { en: 'OTC / Over The Counter', ar: 'خارج البورصة (OTC)' }, country: 'GLOBAL' },
];

export const MARKET_GROUP_LABELS: Record<string, { en: string; ar: string }> = {
  SA: { en: 'Saudi Arabia', ar: 'السعودية' },
  AE: { en: 'United Arab Emirates', ar: 'الإمارات' },
  QA: { en: 'Qatar', ar: 'قطر' },
  KW: { en: 'Kuwait', ar: 'الكويت' },
  BH: { en: 'Bahrain', ar: 'البحرين' },
  OM: { en: 'Oman', ar: 'عُمان' },
  EG: { en: 'Egypt', ar: 'مصر' },
  JO: { en: 'Jordan', ar: 'الأردن' },
  US: { en: 'United States', ar: 'الولايات المتحدة' },
  GB: { en: 'United Kingdom', ar: 'المملكة المتحدة' },
  EU: { en: 'Europe', ar: 'أوروبا' },
  DE: { en: 'Germany', ar: 'ألمانيا' },
  JP: { en: 'Japan', ar: 'اليابان' },
  HK: { en: 'Hong Kong', ar: 'هونغ كونغ' },
  CN: { en: 'China', ar: 'الصين' },
  GLOBAL: { en: 'Global', ar: 'عالمي' },
};

// ─── Security Types ───────────────────────────────────────────────────────────

export const SECURITY_TYPES: SecurityTypeOption[] = [
  { value: 'stock', label: { en: 'Stock', ar: 'سهم' }, iconName: 'TrendingUp' },
  { value: 'etf', label: { en: 'ETF', ar: 'صندوق ETF' }, iconName: 'LayoutGrid' },
  { value: 'gold', label: { en: 'Gold', ar: 'ذهب' }, iconName: 'Gem' },
  { value: 'other', label: { en: 'Other', ar: 'أخرى' }, iconName: 'Package' },
];

// ─── Gold Forms ───────────────────────────────────────────────────────────────

export const GOLD_FORMS: GoldFormOption[] = [
  { value: 'bullion_bar', label: { en: 'Bullion Bar', ar: 'سبيكة ذهب' } },
  { value: 'coin', label: { en: 'Gold Coin', ar: 'عملة ذهبية' } },
  { value: 'jewelry', label: { en: 'Jewelry', ar: 'مجوهرات' } },
  { value: 'etf_gold', label: { en: 'Gold ETF', ar: 'صندوق ذهب ETF' } },
  { value: 'digital_gold', label: { en: 'Digital Gold', ar: 'ذهب رقمي' } },
];

export const KARAT_OPTIONS = ['24K', '22K', '21K', '18K', '14K'] as const;
export type KaratOption = (typeof KARAT_OPTIONS)[number];
