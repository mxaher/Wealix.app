import { type NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { getPublicEnv } from '@/lib/env';
import stripe from '@/lib/stripe';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function POST(_req: NextRequest) {
  let userId: string | null = null;
  let customerId: string | undefined;

  try {
    const authResult = await auth();
    userId = authResult.userId;
    const sessionClaims = authResult.sessionClaims;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appUrl = getPublicEnv().NEXT_PUBLIC_APP_URL;

    customerId =
      typeof (sessionClaims?.publicMetadata as Record<string, unknown> | undefined)?.stripeCustomerId === 'string'
        ? ((sessionClaims?.publicMetadata as Record<string, unknown>).stripeCustomerId as string)
        : undefined;

    if (!customerId) {
      const clerk = await clerkClient();
      const user = await clerk.users.getUser(userId);
      customerId =
        (user.privateMetadata?.stripeCustomerId as string | undefined) ||
        (user.publicMetadata?.stripeCustomerId as string | undefined);
    }

    if (!customerId) {
      return NextResponse.json(
        { error: 'No Stripe customer found. Please add a payment method first.' },
        { status: 404 }
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/settings/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[billing/portal] failed', {
      userId,
      hasCustomerId: Boolean(customerId),
      error: error instanceof Error ? error.message : error,
    });

    return NextResponse.json(
      {
        error: error instanceof Error
          ? `Unable to open Stripe billing portal: ${error.message}`
          : 'Unable to open Stripe billing portal.',
      },
      { status: 502 }
    );
  }
}
