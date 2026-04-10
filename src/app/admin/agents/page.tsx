import { AdminAgentsPageClient } from '@/components/admin/AdminAgentsPageClient';
import { AdminPanelShell } from '@/components/admin/AdminPanelShell';
import { requireAdminPanelPageAccess } from '@/lib/admin-panel-auth';

export default async function AdminAgentsPage() {
  await requireAdminPanelPageAccess();

  return (
    <AdminPanelShell
      title="Agent Command Center"
      description="Run company agents from the isolated worker-only admin panel."
    >
      <AdminAgentsPageClient />
    </AdminPanelShell>
  );
}
