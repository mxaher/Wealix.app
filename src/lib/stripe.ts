import { clerkClient } from '@clerk/nextjs/server';

export type BillingTier = 'free' | 'core' | 'pro';
export type BillingInterval = 'month' | 'year' | null;

type StripeCustomer = {
  id: string;
  email: string | null;
  name: string | null;
  metadata?: Record<string, string>;
};

type StripeSubscription = {
  id: string;
  status: string;
  customer: string;
  current_period_end?: number | null;
  items?: {
    data: Array<{
      price?: {
        id: string;
        recurring?: {
          interval?: 'month' | 'year';
        } | null;
      } | null;
    }>;
  };
};

type StripeListResponse<T> = {
  data: T[];
};

type StripePortalSession = {
  url: string;
};

type StripeCheckoutSession = {
  url: string | null;
};

const STRIPE_API_BASE = 'https://api.stripe.com/v1';

type FormEncodable =
  | string
  | number
  | boolean
  | null
  | undefined
  | Record<string, unknown>
  | Array<unknown>;

const LIVE_PRICE_IDS = {
  core: {
    month: process.env.STRIPE_PRICE_CORE_MONTHLY || 'price_1TFzrO9CJF0RWLt5m6LKb4bj',
    year: process.env.STRIPE_PRICE_CORE_ANNUAL || 'price_1TFzrO9CJF0RWLt58onG3mnw',
  },
  pro: {
    month: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_1TFzz29CJF0RWLt5Of3wOWwc',
    year: process.env.STRIPE_PRICE_PRO_ANNUAL || 'price_1TFzz29CJF0RWLt5Kt4UMf3L',
  },
} as const;

export function getAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || 'https://wealix.app').replace(/\/$/, '');
}

function getStripeSecretKey() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured.');
  }

  return secretKey;
}

function flattenFormValue(
  prefix: string,
  value: FormEncodable,
  params: URLSearchParams,
) {
  if (value === undefined || value === null) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      flattenFormValue(`${prefix}[${index}]`, item as never, params);
    });
    return;
  }

  if (typeof value === 'object') {
    Object.entries(value).forEach(([key, nested]) => {
      flattenFormValue(`${prefix}[${key}]`, nested as never, params);
    });
    return;
  }

  params.append(prefix, String(value));
}

function encodeFormBody(payload: Record<string, FormEncodable>) {
  const params = new URLSearchParams();

  Object.entries(payload).forEach(([key, value]) => {
    flattenFormValue(key, value, params);
  });

  return params;
}

async function stripeRequest<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST';
    query?: Record<string, string | number | boolean | undefined>;
    body?: Record<string, FormEncodable>;
  } = {},
): Promise<T> {
  const secretKey = getStripeSecretKey();
  const url = new URL(`${STRIPE_API_BASE}${path}`);

  if (options.query) {
    Object.entries(options.query).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      ...(options.body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    },
    body: options.body ? encodeFormBody(options.body).toString() : undefined,
    cache: 'no-store',
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (data as { error?: { message?: string } } | null)?.error?.message ||
      `Stripe request failed (${response.status})`;
    throw new Error(message);
  }

  return data as T;
}

export function getStripePriceCatalog() {
  return LIVE_PRICE_IDS;
}

export function resolveTierFromPriceId(priceId: string): BillingTier {
  if (priceId === LIVE_PRICE_IDS.core.month || priceId === LIVE_PRICE_IDS.core.year) {
    return 'core';
  }

  if (priceId === LIVE_PRICE_IDS.pro.month || priceId === LIVE_PRICE_IDS.pro.year) {
    return 'pro';
  }

  return 'free';
}

export function resolveIntervalFromPriceId(priceId: string): BillingInterval {
  if (priceId === LIVE_PRICE_IDS.core.month || priceId === LIVE_PRICE_IDS.pro.month) {
    return 'month';
  }

  if (priceId === LIVE_PRICE_IDS.core.year || priceId === LIVE_PRICE_IDS.pro.year) {
    return 'year';
  }

  return null;
}

export function isAllowedStripePriceId(priceId: string) {
  return Object.values(LIVE_PRICE_IDS).some((intervals) => Object.values(intervals).includes(priceId));
}

export async function resolveOrCreateStripeCustomer(user: {
  clerkUserId: string;
  email: string;
  name?: string | null;
}) {
  const customers = await stripeRequest<StripeListResponse<StripeCustomer>>('/customers', {
    query: {
      email: user.email,
      limit: 10,
    },
  });

  const existing =
    customers.data.find((customer) => customer.metadata?.clerk_user_id === user.clerkUserId) ||
    customers.data[0];

  if (existing) {
    const metadata = {
      ...(existing.metadata || {}),
      clerk_user_id: user.clerkUserId,
    };

    const updated = await stripeRequest<StripeCustomer>(`/customers/${existing.id}`, {
      method: 'POST',
      body: {
        email: user.email,
        name: user.name || undefined,
        metadata,
      },
    });

    return updated;
  }

  return stripeRequest<StripeCustomer>('/customers', {
    method: 'POST',
    body: {
      email: user.email,
      name: user.name || undefined,
      metadata: {
        clerk_user_id: user.clerkUserId,
      },
    },
  });
}

export async function listCustomerSubscriptions(customerId: string) {
  const response = await stripeRequest<StripeListResponse<StripeSubscription>>('/subscriptions', {
    query: {
      customer: customerId,
      status: 'all',
      limit: 20,
    },
  });

  return response.data;
}

export function pickPrimarySubscription(subscriptions: StripeSubscription[]) {
  const priority = ['active', 'trialing', 'past_due', 'unpaid', 'incomplete', 'canceled', 'incomplete_expired'];

  return [...subscriptions].sort((a, b) => {
    const aPriority = priority.indexOf(a.status);
    const bPriority = priority.indexOf(b.status);
    return (aPriority === -1 ? 999 : aPriority) - (bPriority === -1 ? 999 : bPriority);
  })[0] ?? null;
}

export async function createSubscriptionCheckoutSession(input: {
  customerId: string;
  clerkUserId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  return stripeRequest<StripeCheckoutSession>('/checkout/sessions', {
    method: 'POST',
    body: {
      mode: 'subscription',
      customer: input.customerId,
      client_reference_id: input.clerkUserId,
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      allow_promotion_codes: true,
      line_items: [
        {
          price: input.priceId,
          quantity: 1,
        },
      ],
      metadata: {
        clerk_user_id: input.clerkUserId,
      },
      subscription_data: {
        metadata: {
          clerk_user_id: input.clerkUserId,
        },
      },
    },
  });
}

export async function createBillingPortalSession(input: {
  customerId: string;
  returnUrl: string;
}) {
  return stripeRequest<StripePortalSession>('/billing_portal/sessions', {
    method: 'POST',
    body: {
      customer: input.customerId,
      return_url: input.returnUrl,
    },
  });
}

export async function syncClerkBillingState(input: {
  clerkUserId: string;
  email: string;
  name?: string | null;
}) {
  const customer = await resolveOrCreateStripeCustomer(input);
  const subscriptions = await listCustomerSubscriptions(customer.id);
  const subscription = pickPrimarySubscription(subscriptions);
  const priceId = subscription?.items?.data?.[0]?.price?.id ?? null;
  const interval =
    subscription?.items?.data?.[0]?.price?.recurring?.interval ||
    (priceId ? resolveIntervalFromPriceId(priceId) : null);

  const tier =
    subscription && ['active', 'trialing', 'past_due', 'unpaid'].includes(subscription.status) && priceId
      ? resolveTierFromPriceId(priceId)
      : 'free';

  const currentPeriodEnd =
    typeof subscription?.current_period_end === 'number'
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null;

  const client = await clerkClient();
  const user = await client.users.getUser(input.clerkUserId);

  await client.users.updateUserMetadata(input.clerkUserId, {
    publicMetadata: {
      ...(user.publicMetadata || {}),
      subscriptionTier: tier,
      billingInterval: interval,
      stripeSubscriptionStatus: subscription?.status || null,
    },
    privateMetadata: {
      ...(user.privateMetadata || {}),
      stripeCustomerId: customer.id,
      stripeSubscriptionId: subscription?.id || null,
      stripePriceId: priceId,
      stripeCurrentPeriodEnd: currentPeriodEnd,
    },
  });

  return {
    customerId: customer.id,
    subscriptionId: subscription?.id || null,
    subscriptionStatus: subscription?.status || null,
    currentPeriodEnd,
    priceId,
    tier,
    interval: interval ?? null,
    hasActiveSubscription: Boolean(subscription && ['active', 'trialing', 'past_due', 'unpaid'].includes(subscription.status)),
  };
}
