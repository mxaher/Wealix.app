'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

export function LocaleSync() {
  const locale = useAppStore((state) => state.locale);

  useEffect(() => {
    const isArabic = locale === 'ar';
    document.documentElement.lang = isArabic ? 'ar' : 'en';
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
  }, [locale]);

  return null;
}
