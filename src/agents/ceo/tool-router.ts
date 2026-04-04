import type { AgentRole, AgentTask, ToolDispatchResult } from './types';

const ROLE_TO_COMPANY_AGENT: Partial<Record<AgentRole, string>> = {
  finance: 'finance-agent',
  growth: 'cmo-agent',
  infrastructure: 'cto-agent',
};

export class ToolRouter {
  async dispatch(tasks: AgentTask[]): Promise<ToolDispatchResult[]> {
    const results: ToolDispatchResult[] = [];

    for (const task of tasks) {
      const remoteAgent = ROLE_TO_COMPANY_AGENT[task.assignedTo];
      if (!remoteAgent || !process.env.COMPANY_OS_URL || !process.env.AGENTS_SECRET_KEY) {
        results.push({
          taskId: task.id,
          assignedTo: task.assignedTo,
          mode: 'queued-local',
          accepted: true,
          note: 'Task recorded locally. Remote company-agent dispatch is not configured for this role yet.',
        });
        continue;
      }

      const response = await fetch(`${process.env.COMPANY_OS_URL.replace(/\/$/, '')}/agents/${remoteAgent}/run`, {
        method: 'POST',
        headers: {
          'x-agent-secret': process.env.AGENTS_SECRET_KEY,
        },
      }).catch(() => null);

      if (!response?.ok) {
        results.push({
          taskId: task.id,
          assignedTo: task.assignedTo,
          mode: 'queued-local',
          accepted: false,
          note: `Remote dispatch to ${remoteAgent} was not accepted. Task is still recorded locally.`,
        });
        continue;
      }

      results.push({
        taskId: task.id,
        assignedTo: task.assignedTo,
        mode: 'remote-trigger',
        accepted: true,
        note: `Triggered ${remoteAgent} in the company worker runtime.`,
      });
    }

    return results;
  }
}
