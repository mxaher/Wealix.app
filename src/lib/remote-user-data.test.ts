import { describe, expect, test } from 'bun:test';
import { saveRemoteWorkspace } from './remote-user-data';

describe('saveRemoteWorkspace', () => {
  test('rejects demo payloads before they can overwrite the live workspace', async () => {
    await expect(
      saveRemoteWorkspace('user_demo', {
        appMode: 'demo',
        startPage: 'dashboard',
        notificationPreferences: {
          email: true,
          push: true,
          priceAlerts: true,
          budgetAlerts: true,
          weeklyDigest: false,
        },
        notificationFeed: [],
        incomeEntries: [],
        expenseEntries: [],
        receiptScans: [],
        portfolioHoldings: [],
        portfolioAnalysisHistory: [],
        investmentDecisionHistory: [],
        assets: [],
        liabilities: [],
        budgetLimits: [],
      })
    ).rejects.toThrow('Refusing to persist non-live workspace data.');
  });
});
