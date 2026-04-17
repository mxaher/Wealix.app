import { getOnboardingProfile } from '@/lib/onboarding-profile-storage';
import { deleteCachedValue, getCachedValue, setCachedValue } from '@/lib/runtime-cache';

const CACHE_TTL_SECONDS = 60;

export async function isOnboardingComplete(userId: string): Promise<boolean> {
  const cacheKey = `onboarding:${userId}`;
  const cached = await getCachedValue<boolean>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  const profile = await getOnboardingProfile(userId);
  const isDone = profile?.onboardingDone ?? false;
  await setCachedValue(cacheKey, isDone, CACHE_TTL_SECONDS);

  return isDone;
}

export async function invalidateOnboardingCache(userId: string): Promise<void> {
  await deleteCachedValue(`onboarding:${userId}`);
}
