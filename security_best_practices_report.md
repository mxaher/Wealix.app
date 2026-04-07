# Security Best Practices Report

## Executive Summary

The April 7, 2026 Barrion scan for `wealix.app` reported four medium-severity findings and one low-severity finding. After reviewing the app and deployment code, two of those findings were directly fixable in this repo and have been patched: `X-Powered-By` disclosure and the CSP `strict-dynamic` configuration that was conflicting with Clerk-hosted scripts. The remaining findings are either defense-in-depth enhancements that carry meaningful compatibility risk, or scanner observations that need validation against the live deployment after the current fixes ship.

## Medium Severity

### SEC-001: `X-Powered-By` framework disclosure

Impact: An attacker learns the app framework immediately, which slightly improves fingerprinting and exploit targeting.

- Status: Fixed
- Evidence: [`next.config.ts:7`](/Users/mohammedzaher/projects/Wealixapp%20v2/next.config.ts#L7)
- Details: Barrion observed `x-powered-by: Next.js`. The app was not explicitly disabling this framework header.
- Remediation: Added `poweredByHeader: false` in [`next.config.ts:7`](/Users/mohammedzaher/projects/Wealixapp%20v2/next.config.ts#L7).

### SEC-002: CSP script policy conflicted with Clerk script loading

Impact: A malformed or internally inconsistent CSP reduces confidence in script execution controls and was already producing blocked-script console errors on live pages.

- Status: Fixed
- Evidence before fix: [`src/middleware.ts:110`](/Users/mohammedzaher/projects/Wealixapp%20v2/src/middleware.ts#L110)
- Details: The policy used `script-src 'nonce-...' 'strict-dynamic'` together with host allowlists for Clerk, Cloudflare, and Google origins. In CSP Level 3, `strict-dynamic` causes host-based allowlists to be ignored, which matches the scan’s reported Clerk script violations.
- Remediation: Removed `'strict-dynamic'` from the script policy in [`src/middleware.ts:110`](/Users/mohammedzaher/projects/Wealixapp%20v2/src/middleware.ts#L110), preserving nonce-based inline protection without disabling the explicit external allowlist.

### SEC-003: Trusted Types not enforced

Impact: DOM-based XSS sinks remain protected only by current coding practices and CSP, not by Trusted Types enforcement.

- Status: Not fixed in this pass
- Evidence: [`src/middleware.ts:107`](/Users/mohammedzaher/projects/Wealixapp%20v2/src/middleware.ts#L107)
- Details: The CSP does not include `require-trusted-types-for 'script'` or a `trusted-types` directive. Barrion flagged this as a medium-severity hardening gap.
- Rationale for deferral: Enforcing Trusted Types can break React, Clerk, third-party widgets, and markdown rendering flows unless every sink is audited and compatible policies are introduced deliberately. This is a worthwhile hardening project, but it is not a safe one-line fix.
- Recommended next step: Trial a `Content-Security-Policy-Report-Only` header with Trusted Types on a staging environment first, then inventory violations before any enforcement change.

### SEC-004: CSP bypass detection warning

Impact: If the live CSP still diverges from the repo version or browsers interpret the policy unexpectedly, script injection defenses may be weaker than intended.

- Status: Needs re-scan after current CSP fix
- Evidence: [`src/middleware.ts:107`](/Users/mohammedzaher/projects/Wealixapp%20v2/src/middleware.ts#L107)
- Details: Barrion reported data/blob bypass concerns, but the repo’s `script-src` does not explicitly allow `data:` or `blob:`. This makes the finding look partially heuristic and likely entangled with the invalid `strict-dynamic` combination that was also reported.
- Recommended next step: Re-run the live scan after deployment. If the finding persists, capture the exact production CSP header and reproduce the claim with a browser test rather than relying on the scanner summary alone.

## Low Severity

### SEC-005: CSP console errors on live pages

- Status: Likely fixed by SEC-002, pending deployment and re-scan
- Evidence before fix: [`src/middleware.ts:110`](/Users/mohammedzaher/projects/Wealixapp%20v2/src/middleware.ts#L110)
- Details: The report showed blocked Clerk scripts and a blocked inline script due to the current CSP behavior. These errors are consistent with the `strict-dynamic` issue above.
- Remediation: Same fix as SEC-002. Validate in browser devtools after deployment.

## Informational / Out Of Scope For Repo Changes

- Barrion’s “Requires upgrade” items for DNS security, email domain security, OCSP stapling, open ports, and subdomain takeover are infrastructure checks, not application-code findings in this repo.
- CORS and anti-CSRF “Requires upgrade” entries were not reported as active failures in the scan summary. They should not be treated as confirmed vulnerabilities without endpoint-specific evidence.

## Validation

- Build verification should be run after the header changes.
- The highest-value follow-up is a fresh live scan after deployment to confirm that the CSP and server-disclosure findings have cleared.
