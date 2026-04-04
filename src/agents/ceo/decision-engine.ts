import { v4 as uuid } from 'uuid';
import type { AgentRole, AgentTask, CompanyState, Alert, DecisionPriority } from './types';

export class DecisionEngine {
  createTasks(decisions: string[], companyState: CompanyState, activeAlerts: Alert[]): AgentTask[] {
    const tasks: AgentTask[] = [];

    for (const alert of activeAlerts.filter((item) => item.severity === 'critical')) {
      tasks.push({
        id: uuid(),
        assignedTo: alert.source,
        instruction: `CRITICAL ALERT RESPONSE: ${alert.message}. Investigate, isolate root cause, and report back with a resolution plan within 30 minutes.`,
        context: { alertId: alert.id, severity: alert.severity },
        priority: 'critical',
        deadline: new Date(Date.now() + 30 * 60 * 1000),
        status: 'pending',
      });
    }

    for (const decision of decisions) {
      tasks.push({
        id: uuid(),
        assignedTo: this.inferTargetAgent(decision),
        instruction: decision,
        context: {
          totalUsers: companyState.totalUsers,
          monthlyRevenue: companyState.monthlyRevenue,
          activeSubscriptions: companyState.activeSubscriptions,
        },
        priority: this.inferPriority(decision, companyState),
        status: 'pending',
      });
    }

    return tasks;
  }

  private inferTargetAgent(decision: string): AgentRole {
    const lower = decision.toLowerCase();
    if (lower.includes('portfolio') || lower.includes('rebalanc')) return 'portfolio';
    if (lower.includes('market') || lower.includes('price') || lower.includes('stock')) return 'market';
    if (lower.includes('risk') || lower.includes('volatility') || lower.includes('exposure')) return 'risk';
    if (lower.includes('revenue') || lower.includes('billing') || lower.includes('subscription') || lower.includes('pricing')) return 'finance';
    if (lower.includes('infra') || lower.includes('latency') || lower.includes('deploy') || lower.includes('incident')) return 'infrastructure';
    if (lower.includes('user') || lower.includes('growth') || lower.includes('retention') || lower.includes('seo') || lower.includes('campaign')) return 'growth';
    return 'finance';
  }

  private inferPriority(decision: string, state: CompanyState): DecisionPriority {
    const lower = decision.toLowerCase();
    if (lower.includes('critical') || lower.includes('urgent') || state.criticalIssues.length > 0) {
      return 'critical';
    }
    if (lower.includes('immediately') || lower.includes('asap') || lower.includes('today')) {
      return 'high';
    }
    if (lower.includes('this week') || lower.includes('soon')) {
      return 'medium';
    }
    return 'low';
  }
}
