import { createHmac, timingSafeEqual } from 'node:crypto';
import { getSentDmEnv } from '@/lib/env';

function decodeWebhookSecret(secret: string) {
  const normalized = secret.startsWith('whsec_') ? secret.slice('whsec_'.length) : secret;
  return Buffer.from(normalized, 'base64');
}

export function verifySentDmWebhookSignature({
  payload,
  signature,
  webhookId,
  timestamp,
}: {
  payload: string;
  signature: string | null;
  webhookId: string | null;
  timestamp: string | null;
}) {
  if (!signature || !webhookId || !timestamp) {
    return false;
  }

  const [version, providedSignature] = signature.split(',');
  if (version !== 'v1' || !providedSignature) {
    return false;
  }

  const parsedTimestamp = Number(timestamp);
  if (!Number.isFinite(parsedTimestamp)) {
    return false;
  }

  const ageInSeconds = Math.abs(Math.floor(Date.now() / 1000) - parsedTimestamp);
  if (ageInSeconds > 300) {
    return false;
  }

  const signedPayload = `${webhookId}.${timestamp}.${payload}`;
  const expected = createHmac('sha256', decodeWebhookSecret(getSentDmEnv().SENTDM_WEBHOOK_SIGNING_SECRET))
    .update(signedPayload)
    .digest('base64');

  const left = Buffer.from(providedSignature, 'utf8');
  const right = Buffer.from(expected, 'utf8');

  return left.length === right.length && timingSafeEqual(left, right);
}
