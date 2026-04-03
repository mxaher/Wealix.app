import { getD1Database, type D1LikeDatabase } from '@/lib/d1';

type LogInvestmentDecisionParams = {
  clerkUserId: string;
  investmentName: string;
  investmentType: string;
  price: number;
  payloadJson: string;
  decisionJson: string;
};

async function ensureDecisionsLogTable(db: D1LikeDatabase) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS decisions_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clerk_user_id TEXT NOT NULL,
      investment_name TEXT NOT NULL,
      investment_type TEXT NOT NULL,
      price REAL NOT NULL,
      payload_json TEXT NOT NULL,
      decision_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
}

export async function logInvestmentDecision(params: LogInvestmentDecisionParams) {
  const db = getD1Database();
  if (!db) {
    return;
  }

  await ensureDecisionsLogTable(db);
  await db.prepare(`
    INSERT INTO decisions_log (
      clerk_user_id,
      investment_name,
      investment_type,
      price,
      payload_json,
      decision_json
    ) VALUES (?, ?, ?, ?, ?, ?)
  `)
    .bind(
      params.clerkUserId,
      params.investmentName,
      params.investmentType,
      params.price,
      params.payloadJson,
      params.decisionJson
    )
    .run();
}
