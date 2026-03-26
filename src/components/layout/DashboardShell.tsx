'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const locale = useAppStore((state) => state.locale);
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed);
  const isMobile = useAppStore((state) => state.isMobile);
  const setIsMobile = useAppStore((state) => state.setIsMobile);
  const isArabic = locale === 'ar';

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsMobile]);

  return (
    <div
      className={cn(
        'min-h-screen bg-background',
        isArabic && 'font-[family-name:var(--font-arabic)]'
      )}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={cn(
          'transition-all duration-200',
          'md:transition-none',
          !isMobile && (
            sidebarCollapsed
              ? isArabic ? 'md:mr-[84px]' : 'md:ml-[84px]'
              : isArabic ? 'md:mr-[280px]' : 'md:ml-[280px]'
          )
        )}
      >
        <Header />

        <main className="p-4 pb-24 md:p-6 md:pb-6 xl:p-8">
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
