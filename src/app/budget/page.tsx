'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { FinancialSettings } from '@/lib/financial-settings';
import { useRuntimeUser } from '@/hooks/useRuntimeUser';
import { useFinancialSettingsStore } from '@/store/useFinancialSettingsStore';

export default function BudgetPage() {
  const router = useRouter();
  const { user } = useRuntimeUser();
  const replaceFinancialSettings = useFinancialSettingsStore((state) => state.replaceData);

  useEffect(() => {
    let cancelled = false;

    async function getFinancialSettings(userId: string) {
      try {
        const response = await fetch('/api/v1/user/financial-settings', {
          method: 'GET',
          cache: 'no-store',
        });
        const payload = await response.json().catch(() => null) as
          | { settings?: FinancialSettings }
          | null;

        if (!cancelled && response.ok && payload?.settings) {
          replaceFinancialSettings(payload.settings, { broadcast: false, syncStatus: 'saved' });
        }
      } finally {
        if (!cancelled) {
          router.replace('/budget-planning?section=budget');
        }
      }
    }

    if (user?.id) {
      void getFinancialSettings(user.id);
      return () => {
        cancelled = true;
      };
    }

    router.replace('/budget-planning?section=budget');

    return () => {
      cancelled = true;
    };
  }, [replaceFinancialSettings, router, user?.id]);

  return null;
}
