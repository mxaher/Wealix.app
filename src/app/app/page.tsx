import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { hasCompletedOnboardingCookie, ONBOARDING_DONE_COOKIE } from '@/lib/onboarding-guard';
import { getOnboardingProfile, isOnboardingProfileStorageConfigured } from '@/lib/onboarding-profile-storage';
import AppEntryClient from './AppEntryClient';

/**
 * Server Component entry point for /app.
 * Checks if the authenticated user has completed onboarding.
 * If not, redirects to /onboarding.
 * If yes, renders the client shell which then navigates to the correct page.
 */
export default async function AppEntryPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/');
  }

  const cookieStore = await cookies();
  const onboardingDoneCookie = cookieStore.get(ONBOARDING_DONE_COOKIE)?.value;
  const hasOnboardingCookie = hasCompletedOnboardingCookie(onboardingDoneCookie);

  if (hasOnboardingCookie) {
    return <AppEntryClient />;
  }

  if (isOnboardingProfileStorageConfigured()) {
    try {
      const onboardingProfile = await getOnboardingProfile(userId);

      // New user or incomplete onboarding — send to wizard
      if (!onboardingProfile?.onboardingDone) {
        redirect('/onboarding');
      }
    } catch (error) {
      console.error('[app/app/page] onboarding lookup failed, trusting middleware cookie gate', error);
    }
  } else {
    redirect('/onboarding');
  }

  // Onboarding complete — render the client entry shell
  return <AppEntryClient />;
}
