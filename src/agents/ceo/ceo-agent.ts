import { v4 as uuid } from 'uuid';
import { DecisionEngine } from './decision-engine';
import { MemoryEngine } from './memory-engine';
import { ReasoningEngine } from './reasoning-engine';
import { ToolRouter } from './tool-router';
import type { Alert, CEOResponse, CompanyMetric } from './types';

export class CEOAgent {
  private memory: MemoryEngine;
  private reasoning: ReasoningEngine;
  private decisions: DecisionEngine;
  private router: ToolRouter;
  private sessionId: string;

  constructor(sessionId?: string) {
    this.sessionId = sessionId ?? uuid();
    this.memory = new MemoryEngine(this.sessionId);
    this.reasoning = new ReasoningEngine();
    this.decisions = new DecisionEngine();
    this.router = new ToolRouter();
  }

  async execute(params: {
    metrics?: CompanyMetric[];
    incomingAlerts?: Alert[];
    userQuery?: string;
  }): Promise<CEOResponse> {
    const [companyState, recentDecisions, activeAlerts] = await Promise.all([
      this.memory.loadCompanyState(),
      this.memory.recallRecentDecisions(10),
      this.memory.getActiveAlerts(),
    ]);

    const allAlerts = [...activeAlerts, ...(params.incomingAlerts ?? [])];

    for (const alert of params.incomingAlerts ?? []) {
      await this.memory.persistAlert(alert);
    }

    const reasoningResult = await this.reasoning.reason({
      currentState: companyState,
      recentDecisions,
      activeAlerts: allAlerts,
      metrics: params.metrics ?? [],
      userQuery: params.userQuery,
    });

    const tasks = this.decisions.createTasks(
      reasoningResult.decisions,
      companyState,
      allAlerts
    );

    await this.memory.rememberDecision({
      timestamp: new Date(),
      context: params.userQuery ?? 'Autonomous CEO cycle',
      reasoning: reasoningResult.reasoning,
      decision: reasoningResult.decisions.join(' | '),
    });

    await this.router.dispatch(tasks);

    return {
      summary: reasoningResult.reasoning,
      decisions: reasoningResult.decisions,
      tasksDispatched: tasks,
      alerts: allAlerts,
      nextActions: reasoningResult.nextActions,
    };
  }
}
