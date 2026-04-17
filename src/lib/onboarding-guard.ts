import { getBillingState } from '@/lib/billing-state';

export const ONBOARDING_DONE_COOKIE = 'onboarding_done';

/**
 * Returns the post-onboarding redirect target.
 *
 * Decision tree:
 *  1. User has an active subscription / trial → go to /app (full access)
 *  2. User has selected a plan but hasn't activated it yet → go to /settings/billing to complete payment
 *  3. All other cases (free tier, no plan selected, brand-new users) → go to /app
 *
 * NOTE: This function must NEVER return null.  A null return causes
 * OnboardingClient to call router.push(null), which throws a runtime error
 * and triggers the "Something went wrong" error boundary.
 */
export function getOnboardingRedirectTarget(metadata: Record<string, unknown>): string {
  const billingState = getBillingState(metadata);

  if (billingState.hasStandardAccess) {
    return '/app';
  }

  // User picked a plan during onboarding but hasn't paid / activated trial yet
  if (billingState.selectedPlan !== 'none') {
    return '/settings/billing';
  }

  // Free tier or no billing metadata — always safe to go to /app
  return '/app';
}

export function hasCompletedOnboardingCookie(value: string | undefined | null) {
  // Accepts both legacy '1' and new signed '1:<hmac>' format.
  if (!value) return false;
  return value === '1' || value.startsWith('1:');
}

// Bug #006 fix — generate a user-specific HMAC-signed cookie value.
// New cookies are '1:<base64-HMAC-SHA256(userId, CSRF_SECRET)>' so their
// validity is tied to the user — they cannot be copied across accounts.
// Falls back to plain '1' when CSRF_SECRET is not configured.
export async function generateSignedOnboardingCookieValue(userId: string): Promise<string> {
  const secret = process.env.CSRF_SECRET;
  if (!secret) return '1';

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(userId));
  const b64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return `1:${b64}`;
}

// Verify a cookie value against the expected userId.
// Legacy '1' cookies are accepted for backward compatibility.
export async function verifyOnboardingCookieValue(
  value: string | undefined | null,
  userId: string,
): Promise<boolean> {
  if (!value) return false;
  if (value === '1') return true; // legacy — still valid

  const colonIndex = value.indexOf(':');
  if (value.slice(0, colonIndex) !== '1' || colonIndex === -1) return false;
  const signature = value.slice(colonIndex + 1);

  const secret = process.env.CSRF_SECRET;
  if (!secret) return false;

  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    const sigBytes = Uint8Array.from(atob(signature), (c) => c.charCodeAt(0));
    return crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(userId));
  } catch {
    return false;
  }
}

export function getOnboardingDoneCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  };
}
