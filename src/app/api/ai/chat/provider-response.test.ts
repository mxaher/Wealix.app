import { describe, expect, test } from 'bun:test';
import { extractNvidiaAdvisorText } from './provider-response';

describe('advisor provider response parsing', () => {
  test('returns string content', () => {
    expect(
      extractNvidiaAdvisorText({
        choices: [{ message: { content: '  advisor answer  ' } }]
      })
    ).toBe('advisor answer');
  });

  test('joins segmented content', () => {
    expect(
      extractNvidiaAdvisorText({
        choices: [
          {
            message: {
              content: [
                { type: 'text', text: 'part one' },
                { type: 'text', text: 'part two' }
              ]
            }
          }
        ]
      })
    ).toBe('part one\npart two');
  });

  test('falls back to reasoning content', () => {
    expect(
      extractNvidiaAdvisorText({
        choices: [{ message: { reasoning_content: 'reasoned advisor answer' } }]
      })
    ).toBe('reasoned advisor answer');
  });
});
