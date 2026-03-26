import { DashboardShell } from '@/components/layout';
import { SectionLoadingState } from '@/components/shared';

export default function Loading() {
  return (
    <DashboardShell>
      <SectionLoadingState />
    </DashboardShell>
  );
}
