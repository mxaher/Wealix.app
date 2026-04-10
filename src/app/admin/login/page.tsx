import type { Metadata } from 'next';
import { requireAdminPanelLoginPageAccess } from '@/lib/admin-panel-auth';

export const metadata: Metadata = {
  title: 'Admin Login | Wealix',
  description: 'Private login for the worker-only Wealix admin panel.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdminPanelLoginPageAccess();
  const params = await searchParams;
  const invalidPassword = params.error === 'invalid_password';

  return (
    <main className="min-h-screen bg-background px-4 py-16 text-foreground">
      <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-5xl gap-10 lg:grid-cols-[1fr_420px] lg:items-center">
        <section className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Worker-only Access</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Sign in to the Wealix admin panel</h1>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            This panel is only reachable through the dedicated worker host and is intentionally hidden from the
            main <code>wealix.app</code> product experience.
          </p>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            Use the password saved in <code>WEALIX_ADMIN_PANEL_PASSWORD</code>.
          </p>
        </section>

        <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm sm:p-8">
          <form action="/api/admin-panel/login" method="post" className="space-y-4">
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-foreground">
                Admin password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoFocus
                placeholder="Enter the saved password"
                className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
              />
            </div>

            {invalidPassword && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                Invalid password. Try again.
              </div>
            )}

            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Enter admin panel
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
