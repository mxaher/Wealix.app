'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout';
import { DashboardSkeleton } from '@/components/shared';
import { getStartPageHref } from '@/lib/start-page';
import { useAppStore } from '@/store/useAppStore';

export default function AppEntryPage() {
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
