import { type NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { CEOAgent } from '@/agents/ceo/ceo-agent';
import type { Alert, CompanyMetric } from '@/agents/ceo/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allowed = await isOperatorUser(userId, sessionClaims);
    if (!allowed) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = (await req.json().catch(() => null)) as {
      metrics?: CompanyMetric[];
      alerts?: Alert[];
      query?: string;
    } | null;

    const agent = new CEOAgent(userId);
    const response = await agent.execute({
      metrics: Array.isArray(body?.metrics) ? body?.metrics : [],
      incomingAlerts: Array.isArray(body?.alerts) ? body?.alerts : [],
      userQuery: body?.query,
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('[ceo-agent] execution failed', error);
    return NextResponse.json({ error: 'Agent execution failed' }, { status: 500 });
  }
}

async function isOperatorUser(
  userId: string,
  sessionClaims: Awaited<ReturnType<typeof auth>>['sessionClaims']
) {
  const sessionMetadata = (sessionClaims?.publicMetadata ?? {}) as Record<string, unknown>;
  const sessionRole = typeof sessionMetadata.role === 'string' ? sessionMetadata.role.toLowerCase() : '';
  if (sessionRole === 'admin' || sessionRole === 'operator' || sessionRole === 'founder') {
    return true;
  }

  const allowedEmails = (process.env.CEO_ALLOWED_EMAILS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const mergedMetadata = {
    ...(user.publicMetadata as Record<string, unknown>),
    ...(user.privateMetadata as Record<string, unknown>),
  };
  const role = typeof mergedMetadata.role === 'string' ? mergedMetadata.role.toLowerCase() : '';
  if (role === 'admin' || role === 'operator' || role === 'founder') {
    return true;
  }

  const primaryEmail = user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)?.emailAddress?.toLowerCase();
  return Boolean(primaryEmail && allowedEmails.includes(primaryEmail));
}
