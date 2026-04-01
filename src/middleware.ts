import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';

// ─── Route matchers ────────────────────────────────────────────────────────────
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/privacy(.*)',
  '/terms(.*)',
  '/api/webhooks/stripe(.*)',
]);
const isProtectedApiRoute = createRouteMatcher(['/api(.*)']);
const isAppRoute = createRouteMatcher([
  '/app(.*)',
  '/settings(.*)',
  '/advisor(.*)',
  '/budget(.*)',
  '/expenses(.*)',
  '/income(.*)',
  '/portfolio(.*)',
  '/reports(.*)',
  '/net-worth(.*)',
  '/fire(.*)',
  '/retirement(.*)',
  '/onboarding(.*)'
]);

// ─── Clerk instance guard ──────────────────────────────────────────────────────
// Live instance: ins_3BXeeFpYvNEqGtajEpFP4w8d1q0  (production)
// Dev  instance: ins_3BTweREnZ4qiEVQJoQqgMRn5Bfg  (local dev — must never reach prod)
const VALID_KID = 'ins_3BXeeFpYvNEqGtajEpFP4w8d1q0';

function getHandshakeKid(token: string): string | null {
  try {
    const seg = token.split('.')[0];
    // restore base64url padding
    const padded = seg + '==='.slice(0, (4 - (seg.length & 3)) & 3);
    const header = JSON.parse(atob(padded.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof header?.kid === 'string' ? header.kid : null;
  } catch {
    return null;
  }
}

const CLERK_COOKIES = [
  '__session',
  '__client_uat',
  '__clerk_db_jwt',
  '__clerk_handshake',
  '__clerk_redirect_count',
];

function nukeCookies(response: NextResponse, hostname: string) {
  // Clear for exact hostname AND parent domain (covers subdomains)
  const domains = [hostname, hostname.replace(/^[^.]+\./, '.')];
  for (const name of CLERK_COOKIES) {
    for (const domain of domains) {
      response.cookies.set(name, '', {
        maxAge: 0,
        path: '/',
        domain,
        sameSite: 'lax',
        secure: true,
        httpOnly: true,
      });
    }
  }
}

// ─── Raw pre-Clerk interceptor ─────────────────────────────────────────────────
// This function runs BEFORE clerkMiddleware so a stale dev-instance handshake
// never reaches Clerk's verification logic (which would throw a 500).
function handleStaleHandshake(req: NextRequest): NextResponse | null {
  const handshake = req.nextUrl.searchParams.get('__clerk_handshake');
  if (!handshake) return null;

  const kid = getHandshakeKid(handshake);

  // If kid is missing OR belongs to the dev instance → purge and redirect clean
  if (!kid || kid !== VALID_KID) {
    const cleanUrl = req.nextUrl.clone();
    cleanUrl.searchParams.delete('__clerk_handshake');
    cleanUrl.searchParams.delete('__clerk_db_jwt');
    cleanUrl.searchParams.delete('__clerk_redirect_count');

    const res = NextResponse.redirect(cleanUrl, { status: 302 });
    nukeCookies(res, req.nextUrl.hostname);
    return res;
  }

  return null; // valid handshake — let Clerk handle it normally
}

// ─── Main middleware export ────────────────────────────────────────────────────
export default function middleware(req: NextRequest) {
  // 1. Block scanner bots before anything else
  const { pathname } = req.nextUrl;
  const blockedPaths = ['/wp-admin', '/wp-login', '/xmlrpc', '/.env', '/.git', '/admin', '/phpmyadmin'];
  if (blockedPaths.some((p) => pathname.startsWith(p))) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // 2. Intercept stale / dev-instance handshakes BEFORE Clerk runs
  const staleResponse = handleStaleHandshake(req);
  if (staleResponse) return staleResponse;

  // 3. Hand off to Clerk for all remaining requests
  return clerkMiddleware(async (auth, request) => {
    if (isPublicRoute(request)) return;

    if (isProtectedApiRoute(request)) {
      await auth.protect();
      return;
    }

    if (isAppRoute(request)) {
      await auth.protect();
    }
  })(req, {} as any);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|fonts|icons|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico).*)',
    '/(api|trpc)(.*)',
  ],
};
