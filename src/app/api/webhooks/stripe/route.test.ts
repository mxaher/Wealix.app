import { describe, expect, test } from 'bun:test';
import { getMissingStripeSignatureResponse, markWebhookEventProcessed } from '@/lib/stripe-webhook';

describe('stripe webhook helpers', () => {
  test('returns a 400 response when the stripe signature header is missing', async () => {
    const response = getMissingStripeSignatureResponse(null);

    expect(response).not.toBeNull();
    expect(response?.status).toBe(400);
    expect(await response?.json()).toEqual({ error: 'Missing stripe-signature header' });
  });

  test('marks duplicate webhook events when replayed', async () => {
    const seen = new Set<string>();
    const db = {
      prepare(query: string) {
        if (query.includes('SELECT event_id')) {
          return {
            bind(eventId: string) {
              return {
                async first<T>() {
                  return (seen.has(eventId) ? ({ event_id: eventId } as T) : null);
                },
                async run() {
                  return {};
                },
              };
            },
            async run() {
              return {};
            },
          };
        }

        return {
          bind(eventId: string) {
            return {
              async first<T>() {
                return null as T | null;
              },
              async run() {
                seen.add(eventId);
                return {};
              },
            };
          },
          async run() {
            return {};
          },
        };
      },
    };

    const first = await markWebhookEventProcessed('evt_123', db as never);
    const second = await markWebhookEventProcessed('evt_123', db as never);

    expect(first.duplicate).toBe(false);
    expect(second.duplicate).toBe(true);
  });
});
