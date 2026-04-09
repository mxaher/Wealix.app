import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import OnboardingClient from '@/app/onboarding/OnboardingClient';

export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/');
  }

  const dbUser = await db.user.findUnique({
    where: { id: userId },
    select: { onboardingDone: true },
  });

  // Already completed onboarding — go to app
  // (This handles direct navigation to /onboarding for existing users)
  if (dbUser?.onboardingDone) {
    redirect('/app');
  }

  return <OnboardingClient />;
}
