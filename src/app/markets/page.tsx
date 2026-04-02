import type { Metadata } from 'next';
import { MarketsPageClient } from './MarketsPageClient';
import { markets } from './data';

export const metadata: Metadata = {
  title: 'Markets — Investment Tracking by Region | Wealix',
  description:
    'Wealix supports investors across MENA and global markets. Find the right investment tracking setup for your market — Saudi Arabia, UAE, Egypt, and beyond.',
  alternates: { canonical: 'https://wealix.app/markets' },
};

export default function MarketsPage() {
  return <MarketsPageClient markets={markets} />;
}
