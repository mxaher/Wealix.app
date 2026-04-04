import { getPublicAppEnv } from '@/lib/env';
import type { Alert, CompanyMetric, CompanyState, DecisionLog } from './types';

type ReasoningResult = {
  reasoning: string;
  decisions: string[];
  nextActions: string[];
};

export class ReasoningEngine {
  async reason(input: {
    currentState: CompanyState;
    recentDecisions: DecisionLog[];
    activeAlerts: Alert[];
    metrics: CompanyMetric[];
    userQuery?: string;
  }): Promise<ReasoningResult> {
    const response = await fetch(`${getPublicAppEnv().NEXT_PUBLIC_APP_URL}/api/internal/ai/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-agent-secret': process.env.AGENTS_SECRET_KEY || '',
      },
      body: JSON.stringify({
        response_format: 'json',
        prompt: buildReasoningPrompt(input),
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`CEO reasoning request failed: ${response.status} ${body}`);
    }

    const payload = await response.json().catch(() => null) as { content?: string } | null;
    const content = payload?.content;
    if (!content) {
      throw new Error('CEO reasoning response was empty.');
    }

    const parsed = JSON.parse(content) as Partial<ReasoningResult>;
    return {
      reasoning: parsed.reasoning || 'No reasoning returned.',
      decisions: Array.isArray(parsed.decisions) ? parsed.decisions.filter(Boolean) : [],
      nextActions: Array.isArray(parsed.nextActions) ? parsed.nextActions.filter(Boolean) : [],
    };
  }
}

function buildReasoningPrompt(input: {
  currentState: CompanyState;
  recentDecisions: DecisionLog[];
  activeAlerts: Alert[];
  metrics: CompanyMetric[];
  userQuery?: string;
}) {
  return `
You are the CEO Agent of Wealix, a fintech wealth platform.
Your job is to think like a real executive and produce structured output only.

Reasoning framework:
1. Assess the company state and detect anomalies.
2. Prioritize the highest business-impact issues.
3. Decide concrete actions.
4. Delegate actions to specialist agents.
5. Define the next operator-facing actions.

Rules:
- Be specific and grounded in the provided data.
- If something is uncertain, say that clearly.
- Distinguish between immediate actions and strategic follow-up.
- Return valid JSON only.

Current company state:
- Total users: ${input.currentState.totalUsers}
- Total AUM: ${input.currentState.totalAUM}
- Monthly revenue: ${input.currentState.monthlyRevenue}
- Active subscriptions: ${input.currentState.activeSubscriptions}
- Critical issues: ${input.currentState.criticalIssues.length ? input.currentState.criticalIssues.join(', ') : 'None'}
- Last updated: ${input.currentState.lastUpdated.toISOString()}

Active alerts:
${input.activeAlerts.length ? input.activeAlerts.map((alert) => `- [${alert.severity}] ${alert.source}: ${alert.message}`).join('\n') : 'No active alerts.'}

Metrics:
${input.metrics.length ? input.metrics.map((metric) => `- ${metric.name}: ${metric.value} (${metric.trend})`).join('\n') : 'No metrics supplied.'}

Recent decisions:
${input.recentDecisions.length ? input.recentDecisions.slice(0, 5).map((decision) => `- ${decision.timestamp.toISOString()}: ${decision.decision}`).join('\n') : 'No recent decisions.'}

${input.userQuery ? `Operator query:\n${input.userQuery}` : ''}

Return JSON:
{
  "reasoning": "string",
  "decisions": ["string"],
  "nextActions": ["string"]
}`.trim();
}
