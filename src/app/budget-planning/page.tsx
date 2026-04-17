import { Suspense } from 'react';
import { auth } from '@clerk/nextjs/server';
import { BudgetPlanningPage } from '@/components/budget-planning/BudgetPlanningPage';
import {
  loadDailyPlanningSnapshotByDate,
  loadLatestDailyPlanningSnapshot,
} from '@/lib/daily-planning-storage';
import { loadRemoteWorkspace } from '@/lib/remote-user-data';
export { metadata } from '@/app/budget-planning/metadata';

async function getBudgetPlanningSnapshot(userId: string) {
  const snapshotDate = new Date().toISOString().slice(0, 10);
  const todaysSnapshot = await loadDailyPlanningSnapshotByDate(userId, snapshotDate).catch(() => null);
  if (todaysSnapshot) {
    return todaysSnapshot;
  }

  const remote = await loadRemoteWorkspace(userId).catch(() => ({ workspace: null, updatedAt: null }));
  if (!remote.workspace || remote.workspace.appMode !== 'live') {
    return loadLatestDailyPlanningSnapshot(userId).catch(() => null);
  }
  return loadLatestDailyPlanningSnapshot(userId).catch(() => null);
}

export default async function BudgetPlanningRoute() {
  const { userId } = await auth();
  const snapshot = userId ? await getBudgetPlanningSnapshot(userId) : null;

  return (
    <Suspense fallback={null}>
      <BudgetPlanningPage initialSnapshot={snapshot} />
    </Suspense>
  );
}
