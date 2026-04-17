import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateSignedOnboardingCookieValue, getOnboardingDoneCookieOptions, ONBOARDING_DONE_COOKIE } from '@/lib/onboarding-guard';

/**
 * GET /api/onboarding/backfill-cookie
 *
 * Sets the onboarding_done cookie for users who completed onboarding before
 * the cookie-based middleware gate was introduced.
 * Redirects to /app after setting the cookie.
 *
 * This is a Route Handler (not a Server Component), so cookies CAN be set here.
 */
export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL || 'https://wealix.app'));
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://wealix.app';
  const response = NextResponse.redirect(new URL('/app', appUrl));

  // Bug #006 fix: use HMAC-signed cookie value and shared options helper.
  response.cookies.set(ONBOARDING_DONE_COOKIE, await generateSignedOnboardingCookieValue(userId), getOnboardingDoneCookieOptions());

  return response;
}
