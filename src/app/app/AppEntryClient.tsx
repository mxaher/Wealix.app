'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout';
import { DashboardSkeleton } from '@/components/shared';
import { getStartPageHref } from '@/lib/start-page';
import { useAppStore } from '@/store/useAppStore';

/**
 * Client component that handles navigation to the user's start page.
 * Only rendered after the Server Component in page.tsx confirms onboarding is complete.
 */
export default function AppEntryClient() {
  const router = useRouter();
  const startPage = useAppStore((state) => state.startPage);

  useEffect(() => {
    router.replace(getStartPageHref(startPage));
  }, [router, startPage]);

  return (
    <DashboardShell>
      <DashboardSkeleton />
    </DashboardShell>
  );
}
