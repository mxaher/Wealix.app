import { createOpaqueId } from '@/lib/ids';
import type { DailyPlanningSnapshot } from '@/lib/ai/daily-planning';
import { saveRemoteWorkspace, type RemoteUserWorkspace } from '@/lib/remote-user-data';
import { sendBudgetPlanningMessage } from '@/lib/sentdm';
import { getUserPrimaryEmail } from '@/lib/server-auth';

function appendInAppNotification(workspace: RemoteUserWorkspace) {
  return {
    ...workspace,
    notificationFeed: [
      {
        id: createOpaqueId('notification'),
        title: 'AI analysis ready',
        titleAr: 'التحليل الذكي جاهز',
        description: 'Your latest Budget & Planning analysis is ready to review.',
        descriptionAr: 'أصبح أحدث تحليل ذكي لصفحة الموازنة والتخطيط جاهزاً للمراجعة.',
        read: false,
        href: '/budget-planning',
      },
      ...workspace.notificationFeed,
    ].slice(0, 30),
  };
}

export async function notifyDailyPlanningReady(params: {
  userId: string;
  workspace: RemoteUserWorkspace;
  snapshot: DailyPlanningSnapshot;
}) {
  const updatedWorkspace = appendInAppNotification(params.workspace);
  await saveRemoteWorkspace(params.userId, updatedWorkspace);
  const email = await getUserPrimaryEmail(params.userId).catch(() => null);

  const messagingResult = await sendBudgetPlanningMessage({
    userId: params.userId,
    type: 'planning_update',
    title: params.snapshot.daily_headline.title || 'Budget & Planning update',
    body: params.snapshot.daily_headline.subtitle || 'Your latest AI analysis is ready in Budget & Planning.',
    route: '/budget-planning',
    email,
    phoneNumber: params.workspace.notificationPreferences.phoneNumber,
    whatsappNumber: params.workspace.notificationPreferences.whatsappNumber,
    preferences: {
      ...params.workspace.notificationPreferences,
      sms: false,
      whatsapp: params.workspace.notificationPreferences.whatsapp,
    },
  }).catch((error) => ({
    delivered: false,
    reason: error instanceof Error ? error.message : 'messaging-failed',
    results: [],
  }));

  return {
    workspace: updatedWorkspace,
    messagingResult,
  };
}
