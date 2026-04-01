import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

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

// Clerk instance ID derived from the current NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.
// pk_live_Y2xlcmsud2VhbGl4LmFwcCQ  →  base64("clerk.wealix.app$")  →  ins_3BXeeFpYvNEqGtajEpFP4w8d1q0
// Any handshake token carrying a different kid belongs to a stale/old instance and must be rejected.
const VALID_CLERK_INSTANCE_ID = 'ins_3BXeeFpYvNEqGtajEpFP4w8d1q0';

function extractKidFromHandshake(handshake: string): string | null {
  try {
    // __clerk_handshake is a JWT — kid lives in the header (first segment)
    const header = handshake.split('.')[0];
    // Add padding if needed
    const padded = header + '=='.slice(0, (4 - (header.length % 4)) % 4);
    const decoded = JSON.parse(atob(padded));
    return decoded?.kid ?? null;
  } catch {
    return null;
  }
}

export default clerkMiddleware(async (auth, req) => {
  const { pathname, searchParams } = req.nextUrl;

  // 1. Security: Block scanner paths
  const blockedPaths = ['/wp-admin', '/wp-login', '/xmlrpc', '/.env', '/.git', '/admin', '/phpmyadmin'];
  if (blockedPaths.some((p) => pathname.startsWith(p))) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // 2. Detect stale Clerk handshake from a different instance and clear all session state
  const handshakeToken = searchParams.get('__clerk_handshake');
  if (handshakeToken) {
    const kid = extractKidFromHandshake(handshakeToken);
    if (kid && kid !== VALID_CLERK_INSTANCE_ID) {
      // Strip the stale handshake param and redirect cleanly
      const cleanUrl = req.nextUrl.clone();
      cleanUrl.searchParams.delete('__clerk_handshake');
      cleanUrl.searchParams.delete('__clerk_db_jwt');
      const response = NextResponse.redirect(cleanUrl);
      // Nuke all Clerk cookies so the browser starts a fresh auth handshake
      const cookiesToClear = ['__session', '__client_uat', '__clerk_db_jwt', '__clerk_handshake'];
      for (const name of cookiesToClear) {
        response.cookies.set(name, '', {
          maxAge: 0,
          path: '/',
          domain: req.nextUrl.hostname,
          sameSite: 'lax',
          secure: true,
        });
      }
      return response;
    }
  }

  // 3. Allow public routes through without auth
  if (isPublicRoute(req)) return;

  // 4. Protected API
  if (isProtectedApiRoute(req)) {
    await auth.protect();
    return;
  }

  // 5. Protect App Routes
  if (isAppRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|fonts|icons|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico).*)',
    '/(api|trpc)(.*)',
  ],
};
