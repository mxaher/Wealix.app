import { auth, clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import OnboardingClient from '@/app/onboarding/OnboardingClient';
import { getOnboardingRedirectTarget } from '@/lib/onboarding-guard';

export default async function OnboardingPage() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect('/');
  }

  const sessionMetadata = (sessionClaims?.publicMetadata ?? {}) as Record<string, unknown>;
  let redirectTarget = getOnboardingRedirectTarget(sessionMetadata);

  if (!redirectTarget) {
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const mergedMetadata = {
      ...(user.publicMetadata as Record<string, unknown>),
      ...(user.privateMetadata as Record<string, unknown>),
    };
    redirectTarget = getOnboardingRedirectTarget(mergedMetadata);
  }

  if (redirectTarget) {
    redirect(redirectTarget);
  }

  return <OnboardingClient />;
}
