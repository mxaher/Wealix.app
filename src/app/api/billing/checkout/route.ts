import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { requireAuthenticatedUser } from '@/lib/server-auth';
import {
  createBillingPortalSession,
  createSubscriptionCheckoutSession,
  getAppUrl,
  isAllowedStripePriceId,
  resolveOrCreateStripeCustomer,
  syncClerkBillingState,
} from '@/lib/stripe';

export async function POST(request: NextRequest) {
  const authResult = await requireAuthenticatedUser();
  if (authResult.error || !authResult.userId) {
    return authResult.error ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const priceId = typeof body?.priceId === 'string' ? body.priceId : null;

  if (!priceId || !isAllowedStripePriceId(priceId)) {
    return NextResponse.json({ error: 'Invalid price selection.' }, { status: 400 });
  }

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(authResult.userId);
  const email = clerkUser.primaryEmailAddress?.emailAddress;

  if (!email) {
    return NextResponse.json({ error: 'A primary email is required for billing.' }, { status: 400 });
  }

  const billingState = await syncClerkBillingState({
    clerkUserId: authResult.userId,
    email,
    name: clerkUser.fullName || clerkUser.firstName || null,
  });

  if (billingState.hasActiveSubscription) {
    const portal = await createBillingPortalSession({
      customerId: billingState.customerId,
      returnUrl: `${getAppUrl()}/settings?tab=subscription`,
    });

    return NextResponse.json({ url: portal.url, mode: 'portal' });
  }

  const customer = await resolveOrCreateStripeCustomer({
    clerkUserId: authResult.userId,
    email,
    name: clerkUser.fullName || clerkUser.firstName || null,
  });

  const session = await createSubscriptionCheckoutSession({
    customerId: customer.id,
    clerkUserId: authResult.userId,
    priceId,
    successUrl: `${getAppUrl()}/settings?tab=subscription&billing=success`,
    cancelUrl: `${getAppUrl()}/settings?tab=subscription&billing=canceled`,
  });

  if (!session.url) {
    return NextResponse.json({ error: 'Could not create a checkout session.' }, { status: 500 });
  }

  return NextResponse.json({ url: session.url, mode: 'checkout' });
}
