import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://wealix.app';

export const metadata: Metadata = {
  title: 'Budget & Planning for Saudi Arabia & MENA — Wealix',
  description:
    'A unified budget and planning workspace with daily AI digest, recurring obligations, cash-flow forecast, and notification-ready actions.',
  alternates: { canonical: `${siteUrl}/budget-planning` },
  openGraph: {
    title: 'Wealix Budget & Planning',
    description: 'Budget control, planning forecast, and daily financial digest in one page.',
    url: `${siteUrl}/budget-planning`,
    type: 'website',
  },
};
