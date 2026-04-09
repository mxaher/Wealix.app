import { describe, expect, mock, test } from 'bun:test';
import { sendBudgetPlanningMessage, type BudgetPlanningMessage } from '@/lib/sentdm';

const baseMessage: BudgetPlanningMessage = {
  userId: 'user_123',
  type: 'planning_update',
  title: 'Budget & Planning update',
  body: 'Your latest AI analysis is ready.',
  route: '/budget-planning',
  email: 'user@example.com',
  phoneNumber: '+966500000000',
  whatsappNumber: '+966500000001',
  preferences: {
    email: true,
    push: false,
    sms: false,
    whatsapp: false,
    priceAlerts: false,
    budgetAlerts: true,
    planningUpdates: true,
    statusChanges: false,
    reminders: false,
    weeklyDigest: false,
    preferredChannel: 'email',
    phoneNumber: '+966500000000',
    useSamePhoneNumberForWhatsApp: false,
    whatsappNumber: '+966500000001',
  },
};

describe('sendBudgetPlanningMessage', () => {
  test('sends email notifications through the injected email transport', async () => {
    const sendEmail = mock(async (target: { channel: string; to: string }) => ({
      channel: target.channel,
      to: target.to,
      payload: { delivered: [target.to] },
    }));

    const result = await sendBudgetPlanningMessage(baseMessage, { sendEmail });

    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ channel: 'email', to: 'user@example.com' }),
      baseMessage
    );
    expect(result.delivered).toBe(true);
    expect(result.results).toHaveLength(1);
  });

  test('returns no-supported-channel when email is the only enabled channel but no email transport is configured', async () => {
    const result = await sendBudgetPlanningMessage({
      ...baseMessage,
      preferences: {
        ...baseMessage.preferences,
        sms: false,
        whatsapp: false,
      },
    });

    expect(result).toEqual({
      delivered: false,
      reason: 'no-supported-channel',
      results: [],
    });
  });

  test('does not dispatch when the notification type is disabled in user preferences', async () => {
    const sendEmail = mock(async () => ({ ok: true }));
    const result = await sendBudgetPlanningMessage(
      {
        ...baseMessage,
        preferences: {
          ...baseMessage.preferences,
          planningUpdates: false,
        },
      },
      { sendEmail }
    );

    expect(sendEmail).not.toHaveBeenCalled();
    expect(result).toEqual({
      delivered: false,
      reason: 'notification-type-disabled',
      results: [],
    });
  });
});
