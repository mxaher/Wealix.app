'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Download,
  Eye,
  FileDown,
  FileText,
  Flame,
  PieChart,
  Receipt,
  Sparkles,
  TrendingUp,
  Wallet,
  Briefcase,
} from 'lucide-react';
import { DashboardShell } from '@/components/layout';
import { FeatureGate } from '@/components/shared';
import { useAppStore, formatCurrency } from '@/store/useAppStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

type ReportTier = 'free' | 'core' | 'pro';

interface ReportType {
  id: string;
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  icon: React.ReactNode;
  tier: ReportTier;
}

interface GeneratedReport {
  id: string;
  type: string;
  name: string;
  generatedAt: string;
  size: string;
  periodLabel: string;
  summary: string;
  metrics: Array<{ label: string; value: string }>;
  htmlContent: string;
}

const reportTypes: ReportType[] = [
  {
    id: 'monthly-summary',
    name: { en: 'Monthly Financial Summary', ar: 'الملخص المالي الشهري' },
    description: { en: 'Net worth, cash flow, and monthly review', ar: 'صافي الثروة والتدفق النقدي ومراجعة الشهر' },
    icon: <PieChart className="h-6 w-6" />,
    tier: 'core',
  },
  {
    id: 'portfolio-report',
    name: { en: 'Portfolio Report', ar: 'تقرير المحفظة' },
    description: { en: 'Holdings, allocation, and specialist commentary', ar: 'المراكز والتوزيع وتعليق استثماري متخصص' },
    icon: <Briefcase className="h-6 w-6" />,
    tier: 'pro',
  },
  {
    id: 'net-worth-report',
    name: { en: 'Net Worth Report', ar: 'تقرير صافي الثروة' },
    description: { en: 'Assets, liabilities, and balance snapshot', ar: 'الأصول والالتزامات ولقطة الميزانية الشخصية' },
    icon: <Wallet className="h-6 w-6" />,
    tier: 'core',
  },
  {
    id: 'budget-report',
    name: { en: 'Budget Report', ar: 'تقرير الميزانية' },
    description: { en: 'Spending behavior and category breakdown', ar: 'سلوك الإنفاق وتفصيل الفئات' },
    icon: <Receipt className="h-6 w-6" />,
    tier: 'core',
  },
  {
    id: 'fire-report',
    name: { en: 'FIRE Progress Report', ar: 'تقرير تقدم FIRE' },
    description: { en: 'Savings velocity and FIRE readiness snapshot', ar: 'سرعة الادخار ولقطة الجاهزية لـ FIRE' },
    icon: <Flame className="h-6 w-6" />,
    tier: 'pro',
  },
  {
    id: 'annual-review',
    name: { en: 'Annual Financial Review', ar: 'المراجعة المالية السنوية' },
    description: { en: 'Yearly overview with strategic highlights', ar: 'نظرة سنوية شاملة مع أبرز النقاط الاستراتيجية' },
    icon: <TrendingUp className="h-6 w-6" />,
    tier: 'pro',
  },
];

function downloadReportFile(report: GeneratedReport) {
  const blob = new Blob([report.htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${report.name.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}.html`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const { locale, appMode, incomeEntries, expenseEntries, portfolioHoldings, user } = useAppStore();
  const isArabic = locale === 'ar';
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [generating, setGenerating] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);

  const totalIncome = incomeEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalExpenses = expenseEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const portfolioValue = portfolioHoldings.reduce((sum, item) => sum + item.shares * item.currentPrice, 0);
  const investedCost = portfolioHoldings.reduce((sum, item) => sum + item.shares * item.avgCost, 0);
  const netWorth = Math.max(totalIncome + portfolioValue - totalExpenses, 0);
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  const periodLabel = useMemo(() => {
    if (selectedPeriod === 'month') {
      return new Date(Number(selectedYear), Number(selectedMonth) - 1, 1).toLocaleDateString(
        isArabic ? 'ar-SA' : 'en-US',
        { month: 'long', year: 'numeric' }
      );
    }

    if (selectedPeriod === 'quarter') {
      const quarter = Math.ceil(Number(selectedMonth) / 3);
      return isArabic ? `الربع ${quarter} ${selectedYear}` : `Q${quarter} ${selectedYear}`;
    }

    return selectedYear;
  }, [isArabic, selectedMonth, selectedPeriod, selectedYear]);

  const demoReport = useMemo(
    () =>
      buildReport({
        locale,
        userName: user?.name || 'Demo User',
        reportType: reportTypes[0],
        periodLabel,
        totals: { totalIncome, totalExpenses, portfolioValue, investedCost, netWorth, savingsRate },
        holdingsCount: portfolioHoldings.length,
      }),
    [investedCost, locale, netWorth, periodLabel, portfolioHoldings.length, portfolioValue, savingsRate, totalExpenses, totalIncome, user?.name]
  );

  const visibleReports = appMode === 'demo' && generatedReports.length === 0 ? [demoReport] : generatedReports;
  const selectedReport = visibleReports.find((report) => report.id === selectedReportId) ?? visibleReports[0] ?? null;

  const handleGenerateReport = async (reportTypeId: string) => {
    const reportType = reportTypes.find((report) => report.id === reportTypeId);
    if (!reportType) {
      return;
    }

    setGenerating(reportTypeId);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const report = buildReport({
      locale,
      userName: user?.name || (isArabic ? 'مستخدم Wealix' : 'Wealix User'),
      reportType,
      periodLabel,
      totals: { totalIncome, totalExpenses, portfolioValue, investedCost, netWorth, savingsRate },
      holdingsCount: portfolioHoldings.length,
    });

    setGeneratedReports((current) => [report, ...current.filter((item) => item.type !== report.type)]);
    setSelectedReportId(report.id);
    setPreviewOpen(true);
    setGenerating(null);
  };

  const handleDownload = (report: GeneratedReport) => {
    downloadReportFile(report);
    toast({
      title: isArabic ? 'تم تنزيل التقرير' : 'Report downloaded',
      description: isArabic
        ? 'تم تنزيل نسخة HTML قابلة للطباعة من التقرير.'
        : 'A printable HTML copy of the report was downloaded.',
    });
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <FileText className="h-6 w-6" />
              {isArabic ? 'التقارير' : 'Reports'}
            </h1>
            <p className="text-muted-foreground">
              {isArabic
                ? 'أنشئ التقرير، راجعه، ثم نزّل نفس التقرير الذي اخترته.'
                : 'Generate a report, review that exact report, and download the same file.'}
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{isArabic ? 'الفترة:' : 'Period:'}</span>
              </div>

              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">{isArabic ? 'شهري' : 'Monthly'}</SelectItem>
                  <SelectItem value="quarter">{isArabic ? 'ربع سنوي' : 'Quarterly'}</SelectItem>
                  <SelectItem value="year">{isArabic ? 'سنوي' : 'Annual'}</SelectItem>
                </SelectContent>
              </Select>

              {selectedPeriod !== 'year' && (
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, index) => {
                      const month = String(index + 1).padStart(2, '0');
                      return (
                        <SelectItem key={month} value={month}>
                          {new Date(2024, index, 1).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', { month: 'long' })}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}

              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2].map((offset) => {
                    const year = String(new Date().getFullYear() - offset);
                    return (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reportTypes.map((report) => {
            const isGenerating = generating === report.id;
            const feature = report.tier === 'pro' ? 'reports.full' : 'reports.basic';

            return (
              <motion.div key={report.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <Card className={`h-full ${report.tier === 'pro' ? 'border-gold/30 bg-gradient-to-br from-gold/5 to-transparent' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`rounded-lg p-2 ${report.tier === 'pro' ? 'bg-gold/20 text-gold' : 'bg-muted text-muted-foreground'}`}>
                        {report.icon}
                      </div>
                      {report.tier === 'pro' && (
                        <Badge className="bg-gold text-navy-dark">
                          <Sparkles className="mr-1 h-3 w-3" />
                          PRO
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="mt-3 text-lg">{report.name[isArabic ? 'ar' : 'en']}</CardTitle>
                    <CardDescription>{report.description[isArabic ? 'ar' : 'en']}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FeatureGate feature={feature}>
                      <Button className="w-full" variant={report.tier === 'pro' ? 'default' : 'outline'} onClick={() => handleGenerateReport(report.id)} disabled={isGenerating}>
                        {isGenerating ? (
                          <>
                            <FileDown className="mr-2 h-4 w-4 animate-pulse" />
                            {isArabic ? 'جاري الإنشاء...' : 'Generating...'}
                          </>
                        ) : (
                          <>
                            <FileText className="mr-2 h-4 w-4" />
                            {isArabic ? 'إنشاء التقرير' : 'Generate Report'}
                          </>
                        )}
                      </Button>
                    </FeatureGate>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? 'التقارير المُنشأة' : 'Generated Reports'}</CardTitle>
            <CardDescription>
              {isArabic
                ? 'زر المعاينة يفتح التقرير المحدد نفسه، وزر التنزيل ينزّل نفس النسخة.'
                : 'Review opens the specific generated report, and Download downloads that same file.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {visibleReports.length === 0 ? (
              <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                {isArabic ? 'لا توجد تقارير منشأة بعد.' : 'No generated reports yet.'}
              </div>
            ) : (
              <div className="space-y-3">
                {visibleReports.map((report) => {
                  const reportType = reportTypes.find((item) => item.id === report.type);
                  return (
                    <div key={report.id} className="flex flex-col gap-4 rounded-xl border p-4 md:flex-row md:items-center">
                      <div className={`rounded-lg p-2 ${reportType?.tier === 'pro' ? 'bg-gold/20 text-gold' : 'bg-muted text-muted-foreground'}`}>
                        {reportType?.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{report.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {report.generatedAt}
                          {' • '}
                          {report.size}
                          {' • '}
                          {report.periodLabel}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => {
                            setSelectedReportId(report.id);
                            setPreviewOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          {isArabic ? 'مراجعة' : 'Review'}
                        </Button>
                        <Button size="sm" className="gap-2" onClick={() => handleDownload(report)}>
                          <Download className="h-4 w-4" />
                          {isArabic ? 'تنزيل' : 'Download'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedReport?.name || (isArabic ? 'معاينة التقرير' : 'Report Preview')}</DialogTitle>
              <DialogDescription>{selectedReport?.summary}</DialogDescription>
            </DialogHeader>
            {selectedReport && (
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {selectedReport.metrics.map((metric) => (
                    <div key={metric.label} className="rounded-xl border bg-muted/40 p-4">
                      <div className="text-sm text-muted-foreground">{metric.label}</div>
                      <div className="mt-1 text-xl font-semibold">{metric.value}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border p-4">
                  <div className="mb-2 text-sm font-medium">{isArabic ? 'محتوى التقرير' : 'Report Content'}</div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>{selectedReport.summary}</p>
                    <p>{isArabic ? 'يتم تنزيل هذه النسخة كملف HTML قابل للطباعة والمشاركة.' : 'This exact version is downloaded as a printable HTML file.'}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              {selectedReport && (
                <Button className="gap-2" onClick={() => handleDownload(selectedReport)}>
                  <Download className="h-4 w-4" />
                  {isArabic ? 'تنزيل هذا التقرير' : 'Download This Report'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardShell>
  );
}

function buildReport({
  locale,
  userName,
  reportType,
  periodLabel,
  totals,
  holdingsCount,
}: {
  locale: 'ar' | 'en';
  userName: string;
  reportType: ReportType;
  periodLabel: string;
  totals: {
    totalIncome: number;
    totalExpenses: number;
    portfolioValue: number;
    investedCost: number;
    netWorth: number;
    savingsRate: number;
  };
  holdingsCount: number;
}): GeneratedReport {
  const isArabic = locale === 'ar';
  const generatedAt = new Date().toISOString().slice(0, 10);
  const metrics = buildMetrics(locale, totals, holdingsCount);
  const summary = buildSummary(reportType.id, locale, totals, holdingsCount, periodLabel);
  const name = `${periodLabel} ${reportType.name[isArabic ? 'ar' : 'en']}`;
  const htmlContent = `<!DOCTYPE html>
<html lang="${isArabic ? 'ar' : 'en'}" dir="${isArabic ? 'rtl' : 'ltr'}">
  <head>
    <meta charset="UTF-8" />
    <title>${name}</title>
    <style>
      body { font-family: ${isArabic ? 'Tajawal, Arial, sans-serif' : 'Arial, sans-serif'}; padding: 40px; color: #14213d; background: #f8fafc; }
      .sheet { max-width: 860px; margin: 0 auto; background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 32px; }
      h1 { margin: 0 0 4px; }
      p { line-height: 1.7; }
      .muted { color: #64748b; }
      .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin: 24px 0; }
      .metric { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; background: #fafafa; }
      .label { color: #64748b; font-size: 14px; margin-bottom: 8px; }
      .value { font-size: 22px; font-weight: 700; }
    </style>
  </head>
  <body>
    <div class="sheet">
      <p class="muted">Wealix App</p>
      <h1>${name}</h1>
      <p class="muted">${userName} • ${generatedAt}</p>
      <p>${summary}</p>
      <div class="grid">
        ${metrics
          .map(
            (metric) => `
            <div class="metric">
              <div class="label">${metric.label}</div>
              <div class="value">${metric.value}</div>
            </div>
          `
          )
          .join('')}
      </div>
    </div>
  </body>
</html>`;

  return {
    id: `${reportType.id}-${Date.now()}`,
    type: reportType.id,
    name,
    generatedAt,
    size: `${(htmlContent.length / 1024).toFixed(0)} KB`,
    periodLabel,
    summary,
    metrics,
    htmlContent,
  };
}

function buildMetrics(
  locale: 'ar' | 'en',
  totals: {
    totalIncome: number;
    totalExpenses: number;
    portfolioValue: number;
    investedCost: number;
    netWorth: number;
    savingsRate: number;
  },
  holdingsCount: number
) {
  const isArabic = locale === 'ar';
  return [
    { label: isArabic ? 'صافي الثروة' : 'Net Worth', value: formatCurrency(totals.netWorth, 'SAR', locale) },
    { label: isArabic ? 'الدخل' : 'Income', value: formatCurrency(totals.totalIncome, 'SAR', locale) },
    { label: isArabic ? 'المصروفات' : 'Expenses', value: formatCurrency(totals.totalExpenses, 'SAR', locale) },
    { label: isArabic ? 'قيمة المحفظة' : 'Portfolio Value', value: formatCurrency(totals.portfolioValue, 'SAR', locale) },
    { label: isArabic ? 'عدد المراكز' : 'Holdings Count', value: String(holdingsCount) },
    { label: isArabic ? 'معدل الادخار' : 'Savings Rate', value: `${totals.savingsRate.toFixed(1)}%` },
  ];
}

function buildSummary(
  reportTypeId: string,
  locale: 'ar' | 'en',
  totals: {
    totalIncome: number;
    totalExpenses: number;
    portfolioValue: number;
    investedCost: number;
    netWorth: number;
    savingsRate: number;
  },
  holdingsCount: number,
  periodLabel: string
) {
  const isArabic = locale === 'ar';
  const portfolioPnL = totals.portfolioValue - totals.investedCost;

  switch (reportTypeId) {
    case 'portfolio-report':
      return isArabic
        ? `يغطي هذا التقرير محفظة ${periodLabel}. لديك ${holdingsCount} مركزاً بقيمة إجمالية ${formatCurrency(totals.portfolioValue, 'SAR', locale)} مع ربح أو خسارة غير محققة قدرها ${formatCurrency(portfolioPnL, 'SAR', locale)}.`
        : `This report covers the ${periodLabel} portfolio snapshot. You currently hold ${holdingsCount} positions worth ${formatCurrency(totals.portfolioValue, 'SAR', locale)} with an unrealized result of ${formatCurrency(portfolioPnL, 'SAR', locale)}.`;
    case 'budget-report':
      return isArabic
        ? `يراجع هذا التقرير إنفاق ${periodLabel}. بلغ إجمالي المصروفات ${formatCurrency(totals.totalExpenses, 'SAR', locale)} مقابل دخل ${formatCurrency(totals.totalIncome, 'SAR', locale)} مع معدل ادخار ${totals.savingsRate.toFixed(1)}%.`
        : `This report reviews ${periodLabel} spending. Total expenses reached ${formatCurrency(totals.totalExpenses, 'SAR', locale)} against income of ${formatCurrency(totals.totalIncome, 'SAR', locale)}, producing a savings rate of ${totals.savingsRate.toFixed(1)}%.`;
    case 'net-worth-report':
      return isArabic
        ? `يعرض هذا التقرير لقطة صافي الثروة خلال ${periodLabel}. صافي الثروة الحالي ${formatCurrency(totals.netWorth, 'SAR', locale)} مع اعتماد واضح على المحفظة الاستثمارية والتدفق النقدي.`
        : `This report presents the ${periodLabel} net worth snapshot. Current net worth stands at ${formatCurrency(totals.netWorth, 'SAR', locale)} with meaningful contribution from portfolio value and cash flow.`;
    case 'fire-report':
      return isArabic
        ? `يعرض هذا التقرير تقدّم FIRE خلال ${periodLabel}. كلما ارتفع معدل الادخار فوق ${totals.savingsRate.toFixed(1)}% تحسنت سرعة الوصول إلى الاستقلال المالي.`
        : `This report highlights FIRE progress for ${periodLabel}. As the savings rate moves above ${totals.savingsRate.toFixed(1)}%, the path to financial independence becomes stronger.`;
    case 'annual-review':
      return isArabic
        ? `هذه مراجعة سنوية مختصرة لنتائج ${periodLabel} تشمل صافي الثروة والدخل والمصروفات وأداء المحفظة لتحديد أهم نقاط القوة والتحسين.`
        : `This is a concise annual review for ${periodLabel}, covering net worth, income, expenses, and portfolio performance to identify the main strengths and improvement areas.`;
    default:
      return isArabic
        ? `يلخص هذا التقرير المالي فترة ${periodLabel}. صافي الثروة الحالي ${formatCurrency(totals.netWorth, 'SAR', locale)} والدخل ${formatCurrency(totals.totalIncome, 'SAR', locale)} مقابل مصروفات ${formatCurrency(totals.totalExpenses, 'SAR', locale)}.`
        : `This financial summary covers ${periodLabel}. Current net worth is ${formatCurrency(totals.netWorth, 'SAR', locale)}, with income of ${formatCurrency(totals.totalIncome, 'SAR', locale)} versus expenses of ${formatCurrency(totals.totalExpenses, 'SAR', locale)}.`;
  }
}
