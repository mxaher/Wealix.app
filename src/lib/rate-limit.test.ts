import { beforeEach, describe, expect, test } from 'bun:test';
import { enforceRateLimit, resetInMemoryRateLimitState } from '@/lib/rate-limit';

describe('enforceRateLimit', () => {
  beforeEach(() => {
    resetInMemoryRateLimitState();
  });

  test('enforces the in-memory fallback when D1 is unavailable', async () => {
    const first = await enforceRateLimit('test-key', 2, 60_000);
    const second = await enforceRateLimit('test-key', 2, 60_000);
    const third = await enforceRateLimit('test-key', 2, 60_000);

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(0);
    expect(third.allowed).toBe(false);
    expect(third.remaining).toBe(0);
  });
});
