import { NextResponse } from 'next/server';

type D1LikeDatabase = {
  prepare: (query: string) => {
    bind: (...values: unknown[]) => {
      first: <T = unknown>() => Promise<T | null>;
      run: () => Promise<unknown>;
    };
    run: () => Promise<unknown>;
  };
};

export async function markWebhookEventProcessed(eventId: string, db: D1LikeDatabase | null) {
  if (!db) {
    return { duplicate: false };
  }

  const existing = await db
    .prepare('SELECT event_id FROM stripe_webhook_events WHERE event_id = ? LIMIT 1')
    .bind(eventId)
    .first<{ event_id: string }>();

  if (existing?.event_id) {
    return { duplicate: true };
  }

  await db
    .prepare('INSERT INTO stripe_webhook_events (event_id) VALUES (?)')
    .bind(eventId)
    .run();

  return { duplicate: false };
}

export function getMissingStripeSignatureResponse(signature: string | null) {
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  return null;
}
