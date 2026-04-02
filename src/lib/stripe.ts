import Stripe from 'stripe';
import { getRequiredEnv } from '@/lib/env';

let cachedStripe: Stripe | null = null;

export function getStripe() {
  if (cachedStripe) {
    return cachedStripe;
  }

  const secretKey = getRequiredEnv('STRIPE_SECRET_KEY');

  cachedStripe = new Stripe(secretKey, {
    apiVersion: '2025-02-24.acacia',
    httpClient: Stripe.createFetchHttpClient(),
    timeout: 8000,
    maxNetworkRetries: 2,
  });

  return cachedStripe;
}
