import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import OnboardingClient from '@/app/onboarding/OnboardingClient';
import {
  getOnboardingDoneCookieOptions,
  hasCompletedOnboardingCookie,
  ONBOARDING_DONE_COOKIE,
} from '@/lib/onboarding-guard';
import { getOnboardingProfile, isOnboardingProfileStorageConfigured } from '@/lib/onboarding-profile-storage';

export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/');
  }

  const cookieStore = await cookies();
  const onboardingDoneCookie = cookieStore.get(ONBOARDING_DONE_COOKIE)?.value;

  if (hasCompletedOnboardingCookie(onboardingDoneCookie)) {
    redirect('/app');
  }

  if (isOnboardingProfileStorageConfigured()) {
    try {
      const onboardingProfile = await getOnboardingProfile(userId);

      // Already completed onboarding — go back to app
      if (onboardingProfile?.onboardingDone) {
        cookieStore.set(ONBOARDING_DONE_COOKIE, '1', getOnboardingDoneCookieOptions());
        redirect('/app');
      }
    } catch (error) {
      console.error('[app/onboarding/page] onboarding lookup failed, rendering onboarding client', error);
    }
  }

  return <OnboardingClient />;
}
