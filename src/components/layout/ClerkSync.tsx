'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useAppStore } from '@/store/useAppStore';

export function ClerkSync() {
  const { isLoaded, isSignedIn, user } = useUser();
  const syncClerkUser = useAppStore((state) => state.syncClerkUser);
  const clearClerkUser = useAppStore((state) => state.clearClerkUser);
  const setAppMode = useAppStore((state) => state.setAppMode);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (isSignedIn && user) {
      syncClerkUser({
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress || '',
        name: user.fullName || user.firstName || null,
        avatarUrl: user.imageUrl || null,
      });
      setAppMode('live');
      return;
    }

    clearClerkUser();
  }, [clearClerkUser, isLoaded, isSignedIn, setAppMode, syncClerkUser, user]);

  return null;
}
