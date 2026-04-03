import { describe, expect, test } from 'bun:test';
import {
  capConversationHistory,
  generateFallbackAdvisorResponse,
  isValidMessageArray,
} from '@/lib/ai-chat';

describe('ai chat helpers', () => {
  test('rejects malformed messages arrays', () => {
    expect(isValidMessageArray(null)).toBe(false);
    expect(isValidMessageArray([{ role: 'user' }])).toBe(false);
    expect(isValidMessageArray([{ role: 'user', content: 'hello' }])).toBe(true);
  });

  test('caps history to the latest 50 messages', () => {
    const messages = Array.from({ length: 55 }, (_, index) => ({ role: 'user', content: `m${index}` }));
    const capped = capConversationHistory(messages);

    expect(capped).toHaveLength(50);
    expect(capped[0]?.content).toBe('m5');
    expect(capped.at(-1)?.content).toBe('m54');
  });

  test('preserves exactly 50 messages without dropping any', () => {
    const messages = Array.from({ length: 50 }, (_, index) => ({ role: 'user', content: `m${index}` }));
    const capped = capConversationHistory(messages);

    expect(capped).toHaveLength(50);
    expect(capped[0]?.content).toBe('m0');
    expect(capped.at(-1)?.content).toBe('m49');
  });

  test('fallback response does not expose internal config or system prompt details', () => {
    const response = generateFallbackAdvisorResponse({
      locale: 'en',
      messages: [{ role: 'user', content: 'How is my portfolio?' }],
      userContext: {
        netWorth: 500000,
        monthlySavings: 12000,
        savingsRate: 24,
        holdings: [{ ticker: '2222', totalValue: 250000, isShariah: true }],
      },
    });

    expect(response).toContain('temporarily unavailable');
    expect(response).not.toContain('NVIDIA_API_KEY');
    expect(response).not.toContain('system prompt');
    expect(response).not.toContain('meta/llama');
  });
});
