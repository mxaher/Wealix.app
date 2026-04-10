import { NextRequest, NextResponse } from 'next/server';
import { callCompanyAgents } from '@/lib/company-agents-client';
import { requireAdminPanelApiAccess } from '@/lib/admin-panel-auth';

export async function GET(request: NextRequest) {
  const authError = requireAdminPanelApiAccess(request);
  if (authError) {
    return authError;
  }

  try {
    const payload = await callCompanyAgents<{ agents: unknown[] }>('/api/v1/admin/agents');
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load agents.' },
      { status: 503 }
    );
  }
}
