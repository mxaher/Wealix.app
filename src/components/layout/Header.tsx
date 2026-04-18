'use client';

import Link from 'next/link';
import { Bell, Moon, Sun, Globe, Settings, PanelLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WealixLogo } from '@/components/shared/WealixLogo';
import { useRuntimeUser } from '@/hooks/useRuntimeUser';

export function Header() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { isSignedIn, user } = useRuntimeUser();
  const locale = useAppStore((state) => state.locale);
  const setLocale = useAppStore((state) => state.setLocale);
  const notificationFeed = useAppStore((state) => state.notificationFeed);
  const markAllNotificationsRead = useAppStore((state) => state.markAllNotificationsRead);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const unreadCount = notificationFeed.filter((item) => !item.read).length;

  const isArabic = locale === 'ar';
  const userInitial =
    user?.fullName?.trim()?.[0] ||
    user?.firstName?.trim()?.[0] ||
    user?.primaryEmailAddress?.emailAddress?.[0] ||
    'W';

  return (
    <header className="glass sticky top-0 z-30 flex h-14 items-center border-b border-border px-4 md:px-6">
      {/* Left: sidebar toggle + mobile logo */}
      <div className={`flex items-center gap-3 ${isArabic ? 'flex-row-reverse' : ''}`}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
          onClick={toggleSidebar}
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
        {/* Logo visible only on mobile (sidebar hidden) */}
        <div className="md:hidden">
          <WealixLogo compact />
        </div>
      </div>

      <div className="flex-1" />

      {/* Right: actions — 24px gaps */}
      <div className={`flex items-center gap-6 ${isArabic ? 'flex-row-reverse' : ''}`}>
        {/* Language toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocale(isArabic ? 'en' : 'ar')}
          className="hidden h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground sm:flex"
          title={isArabic ? 'Switch to English' : 'التبديل إلى العربية'}
        >
          <Globe className="h-4 w-4" />
        </Button>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
          title={isArabic ? 'تبديل الوضع' : 'Toggle theme'}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-white">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80" align={isArabic ? 'start' : 'end'}>
            <DropdownMenuLabel className="flex items-center justify-between gap-2">
              <span>{isArabic ? 'الإشعارات' : 'Notifications'}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-xs"
                onClick={() => {
                  markAllNotificationsRead();
                  router.push('/settings?tab=preferences');
                }}
              >
                {isArabic ? 'عرض الكل' : 'View all'}
              </Button>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notificationFeed.map((item) => (
              <DropdownMenuItem key={item.id} asChild>
                <Link
                  href={item.href}
                  className="flex flex-col items-start gap-1"
                  onClick={() => markAllNotificationsRead()}
                >
                  <span className="font-medium">
                    {isArabic ? item.titleAr : item.title}
                  </span>
                  <span className="whitespace-normal text-xs text-muted-foreground">
                    {isArabic ? item.descriptionAr : item.description}
                  </span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
          asChild
        >
          <Link href="/settings?tab=profile" title={isArabic ? 'الإعدادات' : 'Settings'}>
            <Settings className="h-4 w-4" />
          </Link>
        </Button>

        {/* Avatar / auth */}
        {!isSignedIn ? (
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="h-8 rounded-lg text-sm">
              <Link href="/sign-in">{isArabic ? 'دخول' : 'Sign in'}</Link>
            </Button>
            <Button asChild size="sm" className="btn-primary h-8">
              <Link href="/sign-up">{isArabic ? 'إنشاء حساب' : 'Sign up'}</Link>
            </Button>
          </div>
        ) : (
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="wealix-avatar-frame h-8 w-8 rounded-full"
          >
            <Link href="/settings?tab=profile" aria-label={isArabic ? 'الملف الشخصي' : 'Profile'}>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {userInitial.toUpperCase()}
              </span>
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}
