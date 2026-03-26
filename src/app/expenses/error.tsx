'use client';

import { DashboardShell } from '@/components/layout';
import { SectionErrorState } from '@/components/shared';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <DashboardShell>
      <SectionErrorState error={error} reset={reset} />
    </DashboardShell>
  );
}
