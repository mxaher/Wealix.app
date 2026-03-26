'use client';

import Link from 'next/link';
import { Bell, Search, Moon, Sun, Globe, Settings, PanelLeft } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const searchItems = [
  { href: '/app', en: 'Dashboard', ar: 'لوحة التحكم', keywords: ['home', 'dashboard', 'overview', 'summary'] },
  { href: '/income', en: 'Income', ar: 'الدخل', keywords: ['salary', 'earning', 'revenue', 'income'] },
  { href: '/expenses', en: 'Expenses', ar: 'المصروفات', keywords: ['expense', 'receipt', 'spending', 'cost'] },
  { href: '/portfolio', en: 'Portfolio', ar: 'المحفظة', keywords: ['portfolio', 'stocks', 'holdings', 'investments'] },
  { href: '/net-worth', en: 'Net Worth', ar: 'صافي الثروة', keywords: ['net worth', 'assets', 'liabilities', 'wealth'] },
  { href: '/budget', en: 'Budget', ar: 'الميزانية', keywords: ['budget', 'plan', 'limits', 'cash flow'] },
  { href: '/reports', en: 'Reports', ar: 'التقارير', keywords: ['reports', 'summary', 'export', 'review'] },
  { href: '/advisor', en: 'AI Advisor', ar: 'المستشار المالي', keywords: ['advisor', 'ai', 'analysis', 'recommendation'] },
  { href: '/settings', en: 'Settings', ar: 'الإعدادات', keywords: ['settings', 'profile', 'preferences', 'subscription'] },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const locale = useAppStore((state) => state.locale);
  const setLocale = useAppStore((state) => state.setLocale);
  const notificationFeed = useAppStore((state) => state.notificationFeed);
  const markAllNotificationsRead = useAppStore((state) => state.markAllNotificationsRead);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const unreadCount = notificationFeed.filter((item) => !item.read).length;
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const isArabic = locale === 'ar';

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return searchItems.filter((item) => item.href !== pathname).slice(0, 5);
    }

    return searchItems
      .filter((item) => {
        const haystack = [item.en, item.ar, ...item.keywords].join(' ').toLowerCase();
        return haystack.includes(normalized);
      })
      .slice(0, 6);
  }, [pathname, query]);

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLanguageToggle = () => {
    setLocale(isArabic ? 'en' : 'ar');
  };

  const navigateFromSearch = (href: string) => {
    setQuery('');
    setSearchOpen(false);
    router.push(href);
  };

  return (
    <header className="glass sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/70 px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button variant="ghost" size="icon" className="hidden rounded-xl md:inline-flex" onClick={toggleSidebar}>
          <PanelLeft className="h-4 w-4" />
        </Button>
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-foreground">
            {isArabic ? 'مساحة Wealix' : 'Wealix Workspace'}
          </p>
          <p className="text-xs text-muted-foreground">
            {isArabic ? 'نظام تشغيل الثروة الشخصية' : 'Personal Wealth Operating System'}
          </p>
        </div>
      </div>

      <div className="mx-4 hidden max-w-md flex-1 lg:block">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={isArabic ? 'بحث...' : 'Search...'}
            className="h-10 rounded-xl border-border bg-secondary/60 pl-9 shadow-none"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => {
              window.setTimeout(() => setSearchOpen(false), 120);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && filteredItems[0]) {
                navigateFromSearch(filteredItems[0].href);
              }
            }}
          />
          {searchOpen && (
            <div className="absolute top-12 z-50 w-full overflow-hidden rounded-2xl border border-border bg-card shadow-card-hover">
              <div className="border-b border-border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {isArabic ? 'نتائج البحث' : 'Search Results'}
              </div>
              <div className="max-h-80 overflow-auto p-2">
                {filteredItems.length > 0 ? filteredItems.map((item) => (
                  <button
                    key={item.href}
                    type="button"
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-colors hover:bg-secondary"
                    onMouseDown={() => navigateFromSearch(item.href)}
                  >
                    <span className="font-medium text-foreground">{isArabic ? item.ar : item.en}</span>
                    <span className="text-xs text-muted-foreground">{item.href}</span>
                  </button>
                )) : (
                  <div className="px-3 py-4 text-sm text-muted-foreground">
                    {isArabic ? 'لا توجد نتائج مطابقة.' : 'No matching pages found.'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLanguageToggle}
          className="hidden rounded-xl sm:flex"
          title={isArabic ? 'Switch to English' : 'التبديل إلى العربية'}
        >
          <Globe className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleThemeToggle}
          className="rounded-xl"
          title={isArabic ? 'تبديل الوضع' : 'Toggle theme'}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-xl">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center">
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
                  <span className="text-xs text-muted-foreground whitespace-normal">
                    {isArabic ? item.descriptionAr : item.description}
                  </span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="rounded-xl" asChild>
          <Link href="/settings?tab=profile" title={isArabic ? 'الإعدادات' : 'Settings'}>
            <Settings className="w-4 h-4" />
          </Link>
        </Button>

        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-1 py-1 shadow-sm">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm" className="rounded-full">{isArabic ? 'دخول' : 'Sign in'}</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm" className="btn-primary rounded-full">{isArabic ? 'إنشاء حساب' : 'Sign up'}</Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full [&_.cl-userButtonBox]:h-9 [&_.cl-userButtonBox]:w-9 [&_.cl-avatarBox]:h-9 [&_.cl-avatarBox]:w-9">
              <UserButton />
            </div>
          </Show>
        </div>
      </div>
    </header>
  );
}
