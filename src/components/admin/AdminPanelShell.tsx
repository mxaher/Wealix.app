import type { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type AdminPanelShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

const navItems = [
  { href: '/admin/agents', label: 'Agents' },
  { href: '/admin/ai-models', label: 'AI Models' },
  { href: '/admin/operator-help', label: 'Operator Help' },
] as const;

export function AdminPanelShell({ title, description, children }: AdminPanelShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Wealix Admin Panel
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {navItems.map((item) => (
              <Button key={item.href} asChild size="sm" variant="outline">
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
            <form action="/api/admin-panel/logout" method="post">
              <Button type="submit" size="sm">Logout</Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
