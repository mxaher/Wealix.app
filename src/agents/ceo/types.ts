export type AgentRole =
  | 'ceo'
  | 'finance'
  | 'portfolio'
  | 'market'
  | 'risk'
  | 'growth'
  | 'infrastructure';

export type DecisionPriority = 'critical' | 'high' | 'medium' | 'low';

export type CompanyMetric = {
  name: string;
  value: number | string;
  trend: 'up' | 'down' | 'stable';
  threshold?: { warning: number; critical: number };
};

export type AgentTask = {
  id: string;
  assignedTo: AgentRole;
  instruction: string;
  context: Record<string, unknown>;
  priority: DecisionPriority;
  deadline?: Date;
  status: 'pending' | 'running' | 'done' | 'failed';
  result?: unknown;
};

export type CompanyState = {
  totalUsers: number;
  totalAUM: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  criticalIssues: string[];
  lastUpdated: Date;
};

export type DecisionLog = {
  timestamp: Date;
  context: string;
  reasoning: string;
  decision: string;
  outcome?: string;
};

export type Alert = {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  source: AgentRole;
  message: string;
  createdAt: Date;
  resolvedAt?: Date;
};

export type CEOMemory = {
  sessionId: string;
  companyState: CompanyState;
  decisions: DecisionLog[];
  activeAlerts: Alert[];
  agentStatuses: Record<AgentRole, 'healthy' | 'degraded' | 'down'>;
};

export type CEOResponse = {
  summary: string;
  decisions: string[];
  tasksDispatched: AgentTask[];
  alerts: Alert[];
  nextActions: string[];
};

export type ToolDispatchResult = {
  taskId: string;
  assignedTo: AgentRole;
  mode: 'remote-trigger' | 'queued-local';
  accepted: boolean;
  note: string;
};
