# Wealix Audit Fix Todo

This checklist is based on the audit report and a direct repo pass over:

- `next.config.ts`
- `src/middleware.ts`
- `src/lib/rate-limit.ts`
- `src/lib/ai-safety.ts`
- `src/app/api/ai/chat/route.ts`
- `src/app/api/internal/ai/agents/route.ts`
- `src/app/api/webhooks/stripe/route.ts`
- selected `src/app/api/**/route.ts` files

## P0 - Fix Immediately

- [ ] Remove `'unsafe-inline'` and `'unsafe-eval'` from `script-src` in [next.config.ts](/Users/mohammedzaher/projects/Wealixapp%20v2/next.config.ts).
- [ ] Replace the current static CSP with a nonce-based CSP for Next.js scripts, or move to a `strict-dynamic` approach if it fits the deployment model.
- [ ] Validate all Clerk, analytics, and Cloudflare challenge flows after the CSP change so auth and telemetry do not regress.

- [ ] Stop trusting client-supplied `userContext` in [src/app/api/ai/chat/route.ts](/Users/mohammedzaher/projects/Wealixapp%20v2/src/app/api/ai/chat/route.ts).
- [ ] Rebuild advisor context on the server from the authenticated user's stored data instead of accepting financial values from the request body.
- [ ] Treat client `userContext` only as optional UI hints, or remove it from the public contract entirely.

## P1 - High Priority Security / Reliability

- [ ] Persist AI audit events instead of only calling `console.warn` in [src/lib/ai-safety.ts](/Users/mohammedzaher/projects/Wealixapp%20v2/src/lib/ai-safety.ts).
- [ ] Add a D1 audit table and store at least `userId`, timestamp, detection flags, route, and a redacted input sample.
- [ ] Define retention and redaction rules so logging does not create a new privacy problem.

- [ ] Add automated tests. No test files were found in the repo.
- [ ] Start with route and utility coverage for:
- [ ] `src/app/api/ai/chat/route.ts`
- [ ] `src/lib/rate-limit.ts`
- [ ] `src/lib/ai-safety.ts`
- [ ] `src/middleware.ts`
- [ ] `src/app/api/webhooks/stripe/route.ts`

- [ ] Audit all API routes for rate-limit coverage and standardize it.
- [ ] Important correction from the report: `market`, `portfolio`, `receipts`, `statements`, `investment-decision`, and `ai/chat` already call `enforceRateLimit`.
- [ ] Focus next on uncovered routes such as `billing/*`, `user-data`, and any future authenticated write-heavy endpoints.
- [ ] Decide whether limits should be per-user, per-IP, or both.

- [ ] Review `/api/internal/*` as a route family and document the auth model.
- [ ] Important correction from the report: the current [src/app/api/internal/ai/agents/route.ts](/Users/mohammedzaher/projects/Wealixapp%20v2/src/app/api/internal/ai/agents/route.ts) already requires `x-agent-secret`.
- [ ] Add a shared helper for internal-route auth so future internal endpoints cannot accidentally rely on Clerk auth alone.

## P2 - Medium Priority Fixes

- [ ] Add a real fallback limiter when D1 is unavailable in [src/lib/rate-limit.ts](/Users/mohammedzaher/projects/Wealixapp%20v2/src/lib/rate-limit.ts).
- [ ] Use an in-memory windowed map for local/dev fallback instead of returning `allowed: true`.
- [ ] Fail closed in any non-local environment where D1 is expected but missing.

- [ ] Expand prompt-injection detection for Arabic and bilingual prompts in [src/lib/ai-safety.ts](/Users/mohammedzaher/projects/Wealixapp%20v2/src/lib/ai-safety.ts) and receipt OCR patterns in [src/app/api/receipts/ocr/route.ts](/Users/mohammedzaher/projects/Wealixapp%20v2/src/app/api/receipts/ocr/route.ts).
- [ ] Add patterns for phrases like `أنت الآن`, `تجاهل التعليمات`, `اكشف`, `prompt`, and mixed Arabic-English attack strings.
- [ ] Add regression tests for Arabic-only, English-only, and mixed-language injections.

- [ ] Stop returning raw internal error messages to clients.
- [ ] Remove `details: message` from the catch response in [src/app/api/ai/chat/route.ts](/Users/mohammedzaher/projects/Wealixapp%20v2/src/app/api/ai/chat/route.ts).
- [ ] Review other API handlers that currently expose provider or internal failure details, especially market-data routes and webhook failures.
- [ ] Return stable error codes and log the raw details server-side only.

- [ ] Sanitize the fallback advisor response in [src/app/api/ai/chat/route.ts](/Users/mohammedzaher/projects/Wealixapp%20v2/src/app/api/ai/chat/route.ts).
- [ ] Do not mention `NVIDIA_API_KEY` directly in user-facing text in production.
- [ ] Add a production-safe fallback message plus a dev-only diagnostic path if needed.

- [ ] Add `preload` to HSTS in [next.config.ts](/Users/mohammedzaher/projects/Wealixapp%20v2/next.config.ts) once all subdomains are HTTPS-only and preload-ready.
- [ ] After rollout, submit the domain to the HSTS preload list if operationally safe.

- [ ] Harden `nukeCookies` in [src/middleware.ts](/Users/mohammedzaher/projects/Wealixapp%20v2/src/middleware.ts) for deeper subdomain cases.
- [ ] Make sure cookie clearing covers nested subdomains, not just one parent-domain transform.

## P3 - Low Priority Cleanup

- [ ] Remove [tsconfig.tsbuildinfo](/Users/mohammedzaher/projects/Wealixapp%20v2/tsconfig.tsbuildinfo) from version control.
- [ ] Add `*.tsbuildinfo` or `tsconfig.tsbuildinfo` to [.gitignore](/Users/mohammedzaher/projects/Wealixapp%20v2/.gitignore).

- [ ] Replace live-looking identifiers in [.env.example](/Users/mohammedzaher/projects/Wealixapp%20v2/.env.example) with obvious placeholders where practical.
- [ ] At minimum, document which values are intentionally public and which must never be committed.

## Test Plan To Add

- [ ] `middleware` rejects blocked scanner paths and strips stale `__clerk_handshake` values.
- [ ] `enforceRateLimit` enforces limits with D1 present and with fallback storage active.
- [ ] `sanitizeUserMessage` detects Arabic and mixed-language injection attempts.
- [ ] `POST /api/ai/chat` rejects malformed `messages`, caps history correctly, and never leaks raw error strings.
- [ ] `POST /api/ai/chat` ignores forged client financial context once server-side context loading is implemented.
- [ ] `POST /api/webhooks/stripe` rejects bad signatures and handles replay-safe processing paths.
- [ ] onboarding/auth flows prevent users from replaying onboarding in an invalid state.

## Suggested Order

1. CSP hardening
2. Server-side AI context sourcing
3. Durable AI audit logging
4. Test harness plus high-risk route tests
5. Rate-limit fallback and uncovered-route audit
6. Error sanitization and fallback-message cleanup
7. HSTS, cookie cleanup, and repo hygiene
