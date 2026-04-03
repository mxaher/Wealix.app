import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { getBillingState } from '@/lib/billing-state';
import { buildRateLimitHeaders, enforceRateLimit } from '@/lib/rate-limit';
import { requireAuthenticatedUser } from '@/lib/server-auth';

const TRIAL_DURATION_MS = 14 * 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuthenticatedUser();
    if (!authResult.userId) {
      return authResult.error ?? NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const rateLimit = await enforceRateLimit(`billing-trial:${authResult.userId}`, 12, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', code: 'RATE_LIMITED' },
        { status: 429, headers: buildRateLimitHeaders(rateLimit) }
      );
    }

    const body = (await request.json().catch(() => ({}))) as { plan?: string };
    const chosenPlan: 'core' | 'pro' = body.plan === 'core' ? 'core' : 'pro';

    const client = await clerkClient();
    const user = await client.users.getUser(authResult.userId);
    
    // Use a combined metadata object for safety
    const currentMetadata = {
      ...(user.publicMetadata as any),
      ...(user.privateMetadata as any)
    };
    
    const billingState = getBillingState(currentMetadata);

    // If user already has access, just return current state
    if (billingState.hasStandardAccess) {
      return NextResponse.json({
        effectiveTier: billingState.selectedPlan,
        trialActive: billingState.trialActive,
        trialEnd: billingState.trialEndsAt,
        paymentAdded: billingState.paymentAdded,
        initialized: false,
      }, { headers: buildRateLimitHeaders(rateLimit) });
    }

    // Check if trial was already used and expired
    if (currentMetadata.trialStatus === 'expired') {
      return NextResponse.json(
        {
          error: 'Trial already used. Please add a payment method to continue.',
          code: 'TRIAL_ALREADY_USED',
          effectiveTier: 'none',
        },
        { status: 409, headers: buildRateLimitHeaders(rateLimit) }
      );
    }

    const trialEnd = new Date(Date.now() + TRIAL_DURATION_MS).toISOString();

    // Update Clerk metadata with all necessary fields for getBillingState to return hasStandardAccess = true
    await client.users.updateUserMetadata(authResult.userId, {
      publicMetadata: {
        plan: chosenPlan,
        subscriptionTier: chosenPlan,
        subscriptionStatus: 'trialing',
        trialActive: true,
        trialStatus: 'active',
        trialPlan: chosenPlan,
        trialEnd: trialEnd,
        trialEndsAt: trialEnd,
        paymentAdded: false,
      },
    });

    return NextResponse.json({
      effectiveTier: chosenPlan,
      trialActive: true,
      trialEnd,
      paymentAdded: false,
      initialized: true,
    }, { headers: buildRateLimitHeaders(rateLimit) });
  } catch (error) {
    console.error('[billing/trial] failed', error);
    return NextResponse.json(
      {
        error: 'Failed to initialize trial.',
        code: 'TRIAL_INIT_FAILED',
      },
      { status: 500 }
    );
  }
}
