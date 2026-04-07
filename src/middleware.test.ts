import { describe, expect, test } from 'bun:test';
import { NextRequest } from 'next/server';
import { buildContentSecurityPolicy, buildCookieDomains, getHandshakeKid, handleStaleHandshake } from '@/middleware';

describe('middleware helpers', () => {
  test('builds a CSP without unsafe script directives', () => {
    const policy = buildContentSecurityPolicy('nonce-value');
    const scriptDirective = policy.split(';').find((directive) => directive.trim().startsWith('script-src'));

    expect(policy).toContain("'nonce-nonce-value'");
    expect(scriptDirective).toBeDefined();
    expect(scriptDirective).not.toContain("'strict-dynamic'");
    expect(scriptDirective).not.toContain("'unsafe-inline'");
    expect(scriptDirective).not.toContain("'unsafe-eval'");
  });

  test('extracts handshake kid from a jwt header', () => {
    const header = Buffer.from(JSON.stringify({ kid: 'ins_live_123' })).toString('base64url');
    const token = `${header}.payload.signature`;

    expect(getHandshakeKid(token)).toBe('ins_live_123');
  });

  test('redirects and strips stale handshake params', () => {
    const invalidHeader = Buffer.from(JSON.stringify({ kid: 'ins_dev_123' })).toString('base64url');
    const token = `${invalidHeader}.payload.signature`;
    const request = new NextRequest(`https://app.wealix.app/advisor?__clerk_handshake=${token}&__clerk_db_jwt=1&__clerk_redirect_count=2`);

    const response = handleStaleHandshake(request);

    expect(response?.status).toBe(302);
    expect(response?.headers.get('location')).toBe('https://app.wealix.app/advisor');
  });

  test('normalizes stale-handshake redirects to an allowed host', () => {
    const invalidHeader = Buffer.from(JSON.stringify({ kid: 'ins_dev_123' })).toString('base64url');
    const token = `${invalidHeader}.payload.signature`;
    const request = new NextRequest(`https://evil.example/advisor?__clerk_handshake=${token}`);

    const response = handleStaleHandshake(request);

    expect(response?.status).toBe(302);
    expect(response?.headers.get('location')).toBe('https://wealix.app/advisor');
  });

  test('clears cookies across nested parent domains', () => {
    expect(buildCookieDomains('app.api.wealix.app')).toEqual([
      'app.api.wealix.app',
      '.api.wealix.app',
      '.wealix.app',
    ]);
  });
});
