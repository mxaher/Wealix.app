import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { requireAuthenticatedUser } from '@/lib/server-auth';
import { createBillingPortalSession, getAppUrl, syncClerkBillingState } from '@/lib/stripe';

export async function POST() {
  const authResult = await requireAuthenticatedUser();
  if (authResult.error || !authResult.userId) {
    return authResult.error ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

  if (!billingState.customerId) {
    return NextResponse.json({ error: 'No Stripe customer was found for this user.' }, { status: 404 });
  }

  const session = await createBillingPortalSession({
    customerId: billingState.customerId,
    returnUrl: `${getAppUrl()}/settings?tab=subscription`,
  });

  return NextResponse.json({ url: session.url });
}
