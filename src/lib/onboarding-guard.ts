import { getBillingState } from '@/lib/billing-state';

export function getOnboardingRedirectTarget(metadata: Record<string, unknown>) {
  const billingState = getBillingState(metadata);

  if (billingState.hasStandardAccess) {
    return '/app';
  }

  if (billingState.selectedPlan !== 'none') {
    return '/settings/billing';
  }

  return null;
}
