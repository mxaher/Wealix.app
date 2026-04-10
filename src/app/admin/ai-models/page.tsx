import { AdminAIModelsPageClient } from '@/components/admin/AdminAIModelsPageClient';
import { AdminPanelShell } from '@/components/admin/AdminPanelShell';
import { requireAdminPanelPageAccess } from '@/lib/admin-panel-auth';

export default async function AdminAIModelsPage() {
  await requireAdminPanelPageAccess();

  return (
    <AdminPanelShell
      title="AI Models"
      description="Manage provider availability and defaults from the isolated admin worker."
    >
      <AdminAIModelsPageClient />
    </AdminPanelShell>
  );
}
