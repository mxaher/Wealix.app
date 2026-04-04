CREATE TABLE IF NOT EXISTS ceo_decisions (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  context TEXT,
  reasoning TEXT,
  decision TEXT,
  outcome TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ceo_alerts (
  id TEXT PRIMARY KEY,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  source TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL,
  resolved_at TEXT
);

CREATE TABLE IF NOT EXISTS company_state (
  id TEXT PRIMARY KEY,
  total_users INTEGER NOT NULL DEFAULT 0,
  total_aum REAL NOT NULL DEFAULT 0,
  monthly_revenue REAL NOT NULL DEFAULT 0,
  active_subscriptions INTEGER NOT NULL DEFAULT 0,
  critical_issues TEXT NOT NULL DEFAULT '[]',
  last_updated TEXT NOT NULL
);
