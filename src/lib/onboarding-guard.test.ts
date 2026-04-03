import { describe, expect, test } from 'bun:test';
import { getOnboardingRedirectTarget } from '@/lib/onboarding-guard';

describe('getOnboardingRedirectTarget', () => {
  test('redirects active or trial-enabled users to app', () => {
    const target = getOnboardingRedirectTarget({
      subscriptionTier: 'pro',
      subscriptionStatus: 'trialing',
      trialActive: true,
      trialStatus: 'active',
      trialPlan: 'pro',
      trialEnd: new Date(Date.now() + 86_400_000).toISOString(),
    });

    expect(target).toBe('/app');
  });

  test('redirects users with a selected plan but no standard access to billing', () => {
    const target = getOnboardingRedirectTarget({
      plan: 'pro',
      subscriptionTier: 'pro',
      subscriptionStatus: 'inactive',
      paymentAdded: false,
      trialStatus: 'expired',
    });

    expect(target).toBe('/settings/billing');
  });

  test('allows fresh users to stay on onboarding', () => {
    expect(getOnboardingRedirectTarget({})).toBeNull();
  });
});
