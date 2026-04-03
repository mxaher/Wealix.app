import { NextResponse } from "next/server";
import { buildRateLimitHeaders, enforceRateLimit } from '@/lib/rate-limit';
import { requireAuthenticatedUser } from '@/lib/server-auth';

export async function GET() {
  try {
    const authResult = await requireAuthenticatedUser();
    if (authResult.error) {
      return authResult.error;
    }

    const rateLimit = await enforceRateLimit(`api-root:${authResult.userId}`, 120, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', code: 'RATE_LIMITED' },
        { status: 429, headers: buildRateLimitHeaders(rateLimit) }
      );
    }

    return NextResponse.json({ message: "Hello, world!" }, { headers: buildRateLimitHeaders(rateLimit) });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Unexpected API failure',
      },
      { status: 500 }
    );
  }
}
