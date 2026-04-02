'use client';

import type { Metadata } from 'next';
import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Markets — Investment Tracking by Region | Wealix',
  description:
    'Wealix supports investors across MENA and global markets. Find the right investment tracking setup for your market — Saudi Arabia, UAE, Egypt, and beyond.',
  alternates: { canonical: 'https://wealix.app/markets' },
};

const markets = [
  {
    slug: 'saudi-arabia',
    name: 'Saudi Arabia',
    nameAr: 'المملكة العربية السعودية',
    description: 'Tadawul, nomu, local funds, and international investments from the Kingdom.',
    descriptionAr: 'تداول، نمو، الصناديق المحلية، والاستثمارات الدولية من المملكة.',
    flag: '🇸🇦',
  },
  {
    slug: 'uae',
    name: 'United Arab Emirates',
    nameAr: 'الإمارات العربية المتحدة',
    description: 'DFM, ADX, and multi-currency wealth management for UAE-based investors.',
    descriptionAr: 'سوق دبي المالي، سوق أبوظبي للأوراق المالية، وإدارة الثروات متعددة العملات للمستثمرين في الإمارات.',
    flag: '🇦🇪',
  },
  {
    slug: 'global',
    name: 'Global Investors',
    nameAr: 'المستثمرون العالميون',
    description: 'US equities, ETFs, crypto, and multi-asset portfolios tracked from anywhere.',
    descriptionAr: 'الأسهم الأمريكية، صناديق الاستثمار المتداولة، الكريبتو، والمحافظ متعددة الأصول المتبعة من أي مكان.',
    flag: '🌍',
  },
];

export default function MarketsPage() {
  const locale = useAppStore((state) => state.locale);
  const isArabic = locale === 'ar';

  return (
    <main className="min-h-screen bg-background">
      <section className="max-w-3xl mx-auto px-4 py-20">
        <Link
          href="/app"
          className="text-sm text-muted-foreground hover:text-primary mb-8 inline-flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {isArabic ? 'العودة إلى الرئيسية' : 'Back to Home'}
        </Link>
        <h1 className="text-4xl font-bold text-foreground mb-4">
          {isArabic ? 'الأسواق التي ندعمها' : 'Markets We Support'}
        </h1>
        <p className="text-lg text-muted-foreground mb-10">
          {isArabic
            ? 'تم بناء Wealix للمستثمرين في جميع أنحاء منطقة الشرق الأوسط وشمال أفريقيا والعالم. ابحث عن سوقك لترى كيف ندعمه.'
            : 'Wealix is built for investors across the MENA region and globally. Find your market to see how we support it.'}
        </p>
        <div className="grid gap-4">
          {markets.map((m) => (
            <Link
              key={m.slug}
              href={`/markets/${m.slug}`}
              className="flex items-start gap-4 border border-border rounded-xl p-5 hover:border-primary/50 transition-colors"
            >
              <span className="text-3xl">{m.flag}</span>
              <div>
                <p className="font-semibold text-foreground">{isArabic ? m.nameAr : m.name}</p>
                <p className="text-sm text-muted-foreground">{isArabic ? m.descriptionAr : m.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
