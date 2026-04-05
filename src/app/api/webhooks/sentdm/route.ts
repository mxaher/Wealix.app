import { NextRequest, NextResponse } from 'next/server';
import { verifySentDmWebhookSignature } from '@/lib/sentdm-webhook';

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const isValid = verifySentDmWebhookSignature({
    payload: rawBody,
    signature: request.headers.get('x-webhook-signature'),
    webhookId: request.headers.get('x-webhook-id'),
    timestamp: request.headers.get('x-webhook-timestamp'),
  });

  if (!isValid) {
    return NextResponse.json({ ok: false, error: 'Invalid signature' }, { status: 401 });
  }

  const event = rawBody ? JSON.parse(rawBody) : null;

  console.info('[sentdm-webhook] received', {
    eventType: request.headers.get('x-webhook-event-type'),
    eventId: typeof event?.id === 'string' ? event.id : null,
    status: event?.status ?? null,
  });

  return NextResponse.json({ ok: true });
}
