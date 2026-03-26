import { auth, clerkClient } from '@clerk/nextjs/server';
import type { SubscriptionTier } from '@/store/useAppStore';

export async function requireAuthenticatedUser() {
  const { userId } = await auth();

  if (!userId) {
    return {
      userId: null,
      error: Response.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 }),
    };
  }

  return { userId, error: null };
}

export async function getUserSubscriptionTier(userId: string): Promise<SubscriptionTier> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const tier = user.publicMetadata?.subscriptionTier ?? user.privateMetadata?.subscriptionTier;
  return tier === 'core' || tier === 'pro' ? tier : 'free';
}

export async function requireProUser() {
  const authResult = await requireAuthenticatedUser();
  if (authResult.error || !authResult.userId) {
    return {
      userId: null,
      tier: 'free' as const,
      error: authResult.error,
    };
  }

  const tier = await getUserSubscriptionTier(authResult.userId);
  if (tier !== 'pro') {
    return {
      userId: authResult.userId,
      tier,
      error: Response.json(
        { error: 'Pro subscription required', code: 'PRO_REQUIRED' },
        { status: 403 }
      ),
    };
  }

  return {
    userId: authResult.userId,
    tier,
    error: null,
  };
}
