const MAX_MESSAGE_LENGTH = 4000;

const INJECTION_PATTERNS = [
  /\bsystem\s*:/i,
  /\bignore\s+(all\s+)?(previous|prior)\s+instructions?/i,
  /\bdisregard\s+(all\s+)?(previous|prior)\s+instructions?/i,
  /\byou\s+are\s+now\b/i,
  /\boverride\s+the\s+system\b/i,
  /\breveal\s+the\s+system\s+prompt\b/i,
  /\bdeveloper\s*:/i,
  /\bassistant\s*:/i,
];

export function sanitizeUserMessage(input: string) {
  const trimmed = input.slice(0, MAX_MESSAGE_LENGTH);
  let sanitized = trimmed;
  let detected = false;

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      detected = true;
      sanitized = sanitized.replace(pattern, '[filtered]');
    }
  }

  sanitized = sanitized.replace(/<{2,}|>{2,}|```[\s\S]*?```/g, '[filtered]');

  return {
    sanitized: sanitized.trim(),
    detected,
    truncated: input.length > MAX_MESSAGE_LENGTH,
  };
}

export function logAiAuditEvent(params: {
  userId: string;
  original: string;
  detected: boolean;
  truncated: boolean;
}) {
  console.warn('[wealix-ai-audit]', {
    userId: params.userId,
    timestamp: new Date().toISOString(),
    detectedPromptInjection: params.detected,
    truncated: params.truncated,
    originalInput: params.original,
  });
}
