import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getBillingState } from '@/lib/billing-state';
import { getPublicAppEnv } from '@/lib/env';
import { buildRateLimitHeaders, enforceRateLimit } from '@/lib/rate-limit';
import { getStripe } from '@/lib/stripe';
import { getPriceId } from '@/lib/stripe-billing';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rateLimit = await enforceRateLimit(`billing-checkout:${userId}`, 20, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', code: 'RATE_LIMITED' },
        { status: 429, headers: buildRateLimitHeaders(rateLimit) }
      );
    }

    const stripe = getStripe();
    const appUrl = getPublicAppEnv().NEXT_PUBLIC_APP_URL;

    const body = (await req.json().catch(() => null)) as { plan?: string; cycle?: string } | null;
    const plan = body?.plan;
    const cycle = body?.cycle;

    if (plan !== 'core' && plan !== 'pro') {
      return NextResponse.json(
        { error: 'Invalid plan. Must be "core" or "pro".' },
        { status: 400, headers: buildRateLimitHeaders(rateLimit) }
      );
    }
    if (cycle !== 'monthly' && cycle !== 'annual') {
      return NextResponse.json(
        { error: 'Invalid cycle. Must be "monthly" or "annual".' },
        { status: 400, headers: buildRateLimitHeaders(rateLimit) }
      );
    }

    const priceId = getPriceId(plan, cycle);
    if (!priceId) {
      return NextResponse.json(
        { error: 'Billing configuration unavailable.', code: 'BILLING_CONFIG_UNAVAILABLE' },
        { status: 503, headers: buildRateLimitHeaders(rateLimit) }
      );
    }

    const metadata = (sessionClaims?.publicMetadata ?? {}) as Record<string, unknown>;
    const billingState  = getBillingState(metadata);

    const stripeCustomerId =
      typeof metadata?.stripeCustomerId === 'string' ? metadata.stripeCustomerId : undefined;

    const existingSubId =
      typeof metadata?.stripeSubscriptionId === 'string' ? metadata.stripeSubscriptionId : undefined;

    // ── If user already has an active trialing subscription in Stripe, update it
    // instead of creating a duplicate checkout. This handles the case where the
    // trial was started without a payment method and the user is now paying.
    if (existingSubId) {
      try {
        const existingSub = await stripe.subscriptions.retrieve(existingSubId, {
          expand: ['default_payment_method'],
        });

        if (existingSub.status === 'trialing' || existingSub.status === 'active') {
          const currentItem = existingSub.items.data[0];
          const currentPriceId = currentItem?.price.id ?? null;
          const hasDefaultPaymentMethod = Boolean(existingSub.default_payment_method);

          if (currentPriceId === priceId) {
            return NextResponse.json({
              updated: true,
              plan,
              cycle,
              subscriptionId: existingSub.id,
            }, { headers: buildRateLimitHeaders(rateLimit) });
          }

          if (currentItem && hasDefaultPaymentMethod) {
            const updatedSubscription = await stripe.subscriptions.update(existingSub.id, {
              items: [
                {
                  id: currentItem.id,
                  price: priceId,
                  quantity: currentItem.quantity ?? 1,
                },
              ],
              proration_behavior: 'always_invoice',
              metadata: {
                ...existingSub.metadata,
                clerkUserId: userId,
                plan,
                cycle,
              },
            });

            return NextResponse.json({
              updated: true,
              plan,
              cycle,
              subscriptionId: updatedSubscription.id,
            }, { headers: buildRateLimitHeaders(rateLimit) });
          }

          // Create a SetupIntent checkout to collect payment method and
          // attach it to the existing subscription before completing a plan switch.
          const setupSession = await stripe.checkout.sessions.create({
            mode: 'setup',
            ...(stripeCustomerId ? { customer: stripeCustomerId } : {}),
            setup_intent_data: {
              metadata: { clerkUserId: userId, plan, cycle, subscriptionId: existingSubId },
            },
            success_url: `${appUrl}/settings/billing?success=true&plan=${plan}&setup=true&sub=${existingSubId}`,
            cancel_url:  `${appUrl}/settings/billing?canceled=true`,
            client_reference_id: userId,
            metadata: { clerkUserId: userId, plan, cycle, subscriptionId: existingSubId },
          });

          if (setupSession.url) {
            return NextResponse.json({ url: setupSession.url }, { headers: buildRateLimitHeaders(rateLimit) });
          }
        }
      } catch {
        // Subscription not found or expired — fall through to create new checkout
      }
    }

    // ── Standard subscription checkout (no existing sub, or existing sub is gone)
    // Always collect payment method upfront — no free trial for checkout flow.
    // Trial credit is preserved via trial_end if there are remaining days.
    const trialEnd = billingState.trialEndsAt
      ? Math.floor(new Date(billingState.trialEndsAt).getTime() / 1000)
      : null;
    const nowUnix = Math.floor(Date.now() / 1000);
    const hasRemainingTrial = trialEnd && trialEnd > nowUnix;

    const session = await stripe.checkout.sessions.create({
      ...(stripeCustomerId ? { customer: stripeCustomerId } : {}),
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/settings/billing?success=true&plan=${plan}`,
      cancel_url:  `${appUrl}/settings/billing?canceled=true`,
      allow_promotion_codes: true,
      client_reference_id: userId,
      // Always collect payment method immediately — no free pass
      payment_method_collection: 'always',
      subscription_data: {
        // Preserve remaining trial days if they exist, otherwise charge immediately
        ...(hasRemainingTrial ? { trial_end: trialEnd } : {}),
        // Ensure payment method becomes default on subscription
        trial_settings: hasRemainingTrial
          ? { end_behavior: { missing_payment_method: 'cancel' } }
          : undefined,
        metadata: { clerkUserId: userId, plan, cycle },
      },
      metadata: { clerkUserId: userId, plan, cycle },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: 'Unable to start checkout.', code: 'CHECKOUT_UNAVAILABLE' },
        { status: 502, headers: buildRateLimitHeaders(rateLimit) }
      );
    }

    return NextResponse.json({ url: session.url }, { headers: buildRateLimitHeaders(rateLimit) });
  } catch (error) {
    console.error('[billing/checkout] failed', error);
    return NextResponse.json(
      { error: 'Unable to start Stripe checkout.', code: 'CHECKOUT_FAILED' },
      { status: 502 }
    );
  }
}
