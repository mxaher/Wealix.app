import { db } from '@/lib/db';
import type { Alert, CompanyState, DecisionLog } from './types';
import { v4 as uuid } from 'uuid';

type DecisionRow = {
  timestamp: string;
  context: string;
  reasoning: string;
  decision: string;
  outcome: string | null;
};

type AlertRow = {
  id: string;
  severity: Alert['severity'];
  source: Alert['source'];
  message: string;
  created_at: string;
  resolved_at: string | null;
};

type CompanyStateRow = {
  total_users: number | null;
  total_aum: number | null;
  monthly_revenue: number | null;
  active_subscriptions: number | null;
  critical_issues: string | null;
  last_updated: string | null;
};

export class MemoryEngine {
  private sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  async rememberDecision(log: DecisionLog): Promise<void> {
    await ensureCeoTables();
    await db.$executeRawUnsafe(
      `INSERT INTO ceo_decisions (id, session_id, timestamp, context, reasoning, decision, outcome, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      uuid(),
      this.sessionId,
      log.timestamp.toISOString(),
      log.context,
      log.reasoning,
      log.decision,
      log.outcome ?? null,
      new Date().toISOString()
    );
  }

  async recallRecentDecisions(limit = 10): Promise<DecisionLog[]> {
    await ensureCeoTables();
    const rows = await db.$queryRawUnsafe<DecisionRow[]>(
      `SELECT timestamp, context, reasoning, decision, outcome
       FROM ceo_decisions
       WHERE session_id = ?
       ORDER BY timestamp DESC
       LIMIT ?`,
      this.sessionId,
      limit
    );

    return rows.map((row) => ({
      timestamp: new Date(row.timestamp),
      context: row.context,
      reasoning: row.reasoning,
      decision: row.decision,
      outcome: row.outcome ?? undefined,
    }));
  }

  async loadCompanyState(): Promise<CompanyState> {
    await ensureCeoTables();
    const rows = await db.$queryRawUnsafe<CompanyStateRow[]>(
      `SELECT total_users, total_aum, monthly_revenue, active_subscriptions, critical_issues, last_updated
       FROM company_state
       ORDER BY last_updated DESC
       LIMIT 1`
    );

    const row = rows[0];
    if (!row) {
      const fallback = await buildFallbackCompanyState();
      await this.upsertCompanyState(fallback);
      return fallback;
    }

    return {
      totalUsers: Number(row.total_users ?? 0),
      totalAUM: Number(row.total_aum ?? 0),
      monthlyRevenue: Number(row.monthly_revenue ?? 0),
      activeSubscriptions: Number(row.active_subscriptions ?? 0),
      criticalIssues: parseCriticalIssues(row.critical_issues),
      lastUpdated: row.last_updated ? new Date(row.last_updated) : new Date(),
    };
  }

  async upsertCompanyState(state: CompanyState): Promise<void> {
    await ensureCeoTables();
    await db.$executeRawUnsafe(`DELETE FROM company_state`);
    await db.$executeRawUnsafe(
      `INSERT INTO company_state (
        id, total_users, total_aum, monthly_revenue, active_subscriptions, critical_issues, last_updated
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      `state-${this.sessionId}`,
      state.totalUsers,
      state.totalAUM,
      state.monthlyRevenue,
      state.activeSubscriptions,
      JSON.stringify(state.criticalIssues),
      state.lastUpdated.toISOString()
    );
  }

  async persistAlert(alert: Alert): Promise<void> {
    await ensureCeoTables();
    await db.$executeRawUnsafe(
      `INSERT OR REPLACE INTO ceo_alerts (id, severity, source, message, created_at, resolved_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      alert.id,
      alert.severity,
      alert.source,
      alert.message,
      alert.createdAt.toISOString(),
      alert.resolvedAt ? alert.resolvedAt.toISOString() : null
    );
  }

  async getActiveAlerts(): Promise<Alert[]> {
    await ensureCeoTables();
    const rows = await db.$queryRawUnsafe<AlertRow[]>(
      `SELECT id, severity, source, message, created_at, resolved_at
       FROM ceo_alerts
       WHERE resolved_at IS NULL
       ORDER BY created_at DESC`
    );

    return rows.map((row) => ({
      id: row.id,
      severity: row.severity,
      source: row.source,
      message: row.message,
      createdAt: new Date(row.created_at),
      resolvedAt: row.resolved_at ? new Date(row.resolved_at) : undefined,
    }));
  }

  async resolveAlert(alertId: string): Promise<void> {
    await ensureCeoTables();
    await db.$executeRawUnsafe(
      `UPDATE ceo_alerts SET resolved_at = ? WHERE id = ?`,
      new Date().toISOString(),
      alertId
    );
  }
}

async function ensureCeoTables() {
  await db.$executeRawUnsafe(
    `CREATE TABLE IF NOT EXISTS ceo_decisions (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      context TEXT,
      reasoning TEXT,
      decision TEXT,
      outcome TEXT,
      created_at TEXT NOT NULL
    )`
  );

  await db.$executeRawUnsafe(
    `CREATE TABLE IF NOT EXISTS ceo_alerts (
      id TEXT PRIMARY KEY,
      severity TEXT NOT NULL,
      source TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL,
      resolved_at TEXT
    )`
  );

  await db.$executeRawUnsafe(
    `CREATE TABLE IF NOT EXISTS company_state (
      id TEXT PRIMARY KEY,
      total_users INTEGER NOT NULL DEFAULT 0,
      total_aum REAL NOT NULL DEFAULT 0,
      monthly_revenue REAL NOT NULL DEFAULT 0,
      active_subscriptions INTEGER NOT NULL DEFAULT 0,
      critical_issues TEXT NOT NULL DEFAULT '[]',
      last_updated TEXT NOT NULL
    )`
  );
}

async function buildFallbackCompanyState(): Promise<CompanyState> {
  const [totalUsers, subscriptions] = await Promise.all([
    db.user.count(),
    db.$queryRawUnsafe<Array<{ count: number }>>(
      `SELECT COUNT(*) as count FROM "User" WHERE subscriptionTier IN ('core', 'pro')`
    ),
  ]);

  return {
    totalUsers,
    totalAUM: 0,
    monthlyRevenue: 0,
    activeSubscriptions: Number(subscriptions[0]?.count ?? 0),
    criticalIssues: [],
    lastUpdated: new Date(),
  };
}

function parseCriticalIssues(raw: string | null) {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}
