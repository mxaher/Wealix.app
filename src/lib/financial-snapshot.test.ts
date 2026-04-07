import { describe, expect, test } from 'bun:test';
import {
  buildFinancialSnapshotFromClientContext,
  getDecisionCheckContext,
  getFireMetrics,
  getLockedSavings,
  getMonthlyExpenses,
  getMonthlyIncome,
  getNetMonthlySurplus,
  getNetWorth,
} from '@/lib/financial-snapshot';

const baseContext = {
  snapshotDate: '2026-04-07T08:00:00.000Z',
  currency: 'SAR',
  version: 12,
  holdings: [
    {
      id: 'holding-1',
      ticker: '2222',
      name: 'Saudi Aramco',
      exchange: 'TASI' as const,
      shares: 100,
      avgCost: 30,
      currentPrice: 35,
      sector: 'Energy',
      isShariah: true,
    },
  ],
  assets: [
    {
      id: 'asset-cash',
      name: 'Checking',
      category: 'cash' as const,
      value: 20000,
      currency: 'SAR',
    },
  ],
  liabilities: [
    {
      id: 'liability-1',
      name: 'Card',
      category: 'credit_card' as const,
      balance: 8000,
      currency: 'SAR',
    },
  ],
  incomeEntries: [
    {
      id: 'income-1',
      amount: 20000,
      currency: 'SAR',
      source: 'salary' as const,
      sourceName: 'Salary',
      frequency: 'monthly' as const,
      date: '2026-04-01',
      isRecurring: true,
    },
  ],
  expenseEntries: [
    {
      id: 'expense-1',
      amount: 6000,
      currency: 'SAR',
      category: 'Housing' as const,
      description: 'Rent',
      date: '2026-04-02',
      paymentMethod: 'Transfer' as const,
    },
    {
      id: 'expense-2',
      amount: 3000,
      currency: 'SAR',
      category: 'Food' as const,
      description: 'Groceries',
      date: '2026-04-05',
      paymentMethod: 'Card' as const,
    },
  ],
  budgetLimits: [
    {
      id: 'budget-1',
      category: 'housing',
      limit: 7000,
      color: '#123456',
    },
  ],
  recurringObligations: [
    {
      id: 'ob-1',
      title: 'School fees',
      category: 'Education',
      amount: 12000,
      currency: 'SAR',
      dueDay: 15,
      startDate: '2026-05-01',
      frequency: 'monthly' as const,
      status: 'upcoming' as const,
    },
  ],
  oneTimeExpenses: [
    {
      id: 'one-1',
      title: 'Iqama renewal',
      amount: 4000,
      currency: 'SAR',
      dueDate: '2026-06-10',
      category: 'Other',
      priority: 'high' as const,
      status: 'planned' as const,
    },
  ],
  savingsAccounts: [
    {
      id: 'save-1',
      name: 'Awaeed Reserve',
      type: 'awaeed' as const,
      provider: 'Bank',
      principal: 25000,
      currentBalance: 25500,
      annualProfitRate: 4,
      termMonths: 12,
      openedAt: '2026-01-01',
      maturityDate: '2027-01-01',
      profitPayoutMethod: 'at_maturity' as const,
      status: 'active' as const,
    },
    {
      id: 'save-2',
      name: 'Current Account',
      type: 'current' as const,
      provider: 'Bank',
      principal: 10000,
      currentBalance: 10000,
      annualProfitRate: 0,
      termMonths: 0,
      openedAt: '2026-01-01',
      maturityDate: '2026-01-01',
      profitPayoutMethod: 'monthly' as const,
      status: 'active' as const,
    },
  ],
};

describe('financial snapshot', () => {
  test('includes savings accounts in layered net worth totals', () => {
    const snapshot = buildFinancialSnapshotFromClientContext(baseContext);

    expect(snapshot.netWorth.liquid).toBe(30000);
    expect(snapshot.netWorth.locked).toBe(25500);
    expect(snapshot.netWorth.investments).toBe(3500);
    expect(snapshot.netWorth.net).toBe(51000);
    expect(getLockedSavings(snapshot)).toBe(25500);
  });

  test('derives FIRE metrics from canonical snapshot values', () => {
    const snapshot = buildFinancialSnapshotFromClientContext(baseContext);
    const fire = getFireMetrics(snapshot);

    expect(fire.annualExpenses).toBe(108000);
    expect(fire.annualSavings).toBe(132000);
    expect(fire.currentInvestableAssets).toBe(29000);
    expect(fire.fireNumber).toBe(2700000);
    expect(fire.progressPct).toBeCloseTo(1.07, 2);
  });

  test('selectors match the canonical snapshot math', () => {
    const snapshot = buildFinancialSnapshotFromClientContext(baseContext);

    expect(getMonthlyIncome(snapshot)).toBe(20000);
    expect(getMonthlyExpenses(snapshot)).toBe(9000);
    expect(getNetMonthlySurplus(snapshot)).toBe(11000);
    expect(getNetWorth(snapshot)).toBe(51000);
  });

  test('decision context always carries obligations, one-time expenses, savings, and forecast', () => {
    const snapshot = buildFinancialSnapshotFromClientContext(baseContext);
    const context = getDecisionCheckContext(snapshot);

    expect(context.obligations.pending.length).toBeGreaterThan(0);
    expect(context.oneTimeExpenses).toHaveLength(1);
    expect(context.savings.savingsAccounts).toHaveLength(2);
    expect(context.forecast.monthlyRows.length).toBe(12);
    expect(context.liquidity.liquidCash).toBe(30000);
  });
});
