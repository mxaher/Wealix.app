import type {
  AppMode,
  AssetEntry,
  BudgetLimit,
  ExpenseEntry,
  IncomeEntry,
  LiabilityEntry,
  NotificationItem,
  NotificationPreferences,
  PortfolioAnalysisRecord,
  PortfolioHolding,
  ReceiptScanResult,
} from '@/store/useAppStore';

export type RemoteUserWorkspace = {
  appMode: AppMode;
  notificationPreferences: NotificationPreferences;
  notificationFeed: NotificationItem[];
  incomeEntries: IncomeEntry[];
  expenseEntries: ExpenseEntry[];
  receiptScans: ReceiptScanResult[];
  portfolioHoldings: PortfolioHolding[];
  portfolioAnalysisHistory: PortfolioAnalysisRecord[];
  assets: AssetEntry[];
  liabilities: LiabilityEntry[];
  budgetLimits: BudgetLimit[];
};

type SupabaseRow = {
  workspace_json?: RemoteUserWorkspace | null;
};

function getSupabaseUrl() {
  return (
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_PROJECT_URL ||
    ''
  ).replace(/\/$/, '');
}

function getSupabaseServiceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

function getSupabaseHeaders() {
  const key = getSupabaseServiceKey();

  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
}

export function isSupabasePersistenceConfigured() {
  return Boolean(getSupabaseUrl() && getSupabaseServiceKey());
}

async function supabaseRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = getSupabaseUrl();
  const serviceKey = getSupabaseServiceKey();

  if (!baseUrl || !serviceKey) {
    throw new Error('Supabase persistence is not configured.');
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      ...getSupabaseHeaders(),
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });

  const text = await response.text();
  const json = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const details = json?.message || json?.error_description || json?.error || response.statusText;
    throw new Error(`Supabase persistence request failed: ${details}`);
  }

  return json as T;
}

export async function loadRemoteWorkspace(clerkUserId: string) {
  const encodedUserId = encodeURIComponent(clerkUserId);
  const rows = await supabaseRequest<SupabaseRow[]>(
    `/rest/v1/user_app_profiles?clerk_user_id=eq.${encodedUserId}&select=workspace_json&limit=1`
  );

  return rows[0]?.workspace_json ?? null;
}

export async function saveRemoteWorkspace(clerkUserId: string, workspace: RemoteUserWorkspace) {
  const rows = await supabaseRequest<Array<{ workspace_json?: RemoteUserWorkspace | null }>>(
    '/rest/v1/user_app_profiles?on_conflict=clerk_user_id',
    {
      method: 'POST',
      headers: {
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify([
        {
          clerk_user_id: clerkUserId,
          workspace_json: workspace,
        },
      ]),
    }
  );

  return rows[0]?.workspace_json ?? workspace;
}
