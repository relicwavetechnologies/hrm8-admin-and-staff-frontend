import { createNotification } from '@/shared/lib/notificationStorage';
import { Notification } from '@/shared/types/notification';

export type BackgroundCheckNotificationEvent =
  | 'consent_requested'
  | 'consent_given'
  | 'consent_declined'
  | 'consent_expired'
  | 'consent_reminder'
  | 'referee_invited'
  | 'referee_opened'
  | 'referee_completed'
  | 'referee_overdue'
  | 'referee_reminder'
  | 'check_initiated'
  | 'check_completed'
  | 'check_requires_review'
  | 'check_issues_found'
  | 'all_referees_completed'
  | 'check_cancelled';

interface NotificationContext {
  candidateName: string;
  candidateEmail?: string;
  checkId: string;
  jobTitle?: string;
  refereeName?: string;
  checkType?: string;
  recruiterEmail?: string;
  reminderNumber?: number;
}

/**
 * Creates notifications for background check events
 * Sends to recruiters/admins with appropriate priority and category
 */
export function createBackgroundCheckNotification(
  event: BackgroundCheckNotificationEvent,
  context: NotificationContext,
  recipientUserId: string = 'user-1' // Default mock user, should be actual recruiter ID
): Notification {
  const notificationConfig = getNotificationConfig(event, context);

  return createNotification({
    userId: recipientUserId,
    category: 'document', // Background checks fall under document category
    type: notificationConfig.type,
    priority: notificationConfig.priority,
    title: notificationConfig.title,
    message: notificationConfig.message,
    link: notificationConfig.link,
    read: false,
    archived: false,
    actionType: notificationConfig.actionType,
    metadata: {
      event,
      ...context,
    },
  });
}

function getNotificationConfig(
  event: BackgroundCheckNotificationEvent,
  context: NotificationContext
) {
  const { candidateName, refereeName, checkType, jobTitle } = context;

  switch (event) {
    case 'consent_given':
      return {
        type: 'success' as const,
        priority: 'medium' as const,
        title: `✓ Consent Approved - ${candidateName}`,
        message: `${candidateName} has approved the background check consent. Checks are now in progress.`,
        link: `/background-checks/${context.checkId}`,
        actionType: 'view' as const,
      };

    case 'consent_declined':
      return {
        type: 'warning' as const,
        priority: 'high' as const,
        title: `✗ Consent Declined - ${candidateName}`,
        message: `${candidateName} has declined the background check consent. Please review and contact candidate.`,
        link: `/background-checks/${context.checkId}`,
        actionType: 'review' as const,
      };

    case 'consent_expired':
      return {
        type: 'warning' as const,
        priority: 'medium' as const,
        title: `⏰ Consent Expired - ${candidateName}`,
        message: `Background check consent for ${candidateName} has expired. Resend consent request to proceed.`,
        link: `/background-checks/${context.checkId}`,
        actionType: 'review' as const,
      };

    case 'consent_reminder':
      return {
        type: 'info' as const,
        priority: 'low' as const,
        title: `📧 Consent Reminder Sent - ${candidateName}`,
        message: `Reminder #${context.reminderNumber || 1} sent to ${candidateName} for pending consent.`,
        link: `/background-checks/${context.checkId}`,
        actionType: 'view' as const,
      };

    case 'referee_completed':
      return {
        type: 'success' as const,
        priority: 'medium' as const,
        title: `✓ Reference Completed - ${candidateName}`,
        message: `${refereeName || 'A referee'} has completed their reference check for ${candidateName}.`,
        link: `/background-checks/${context.checkId}`,
        actionType: 'view' as const,
      };

    case 'referee_overdue':
      return {
        type: 'warning' as const,
        priority: 'medium' as const,
        title: `⏰ Overdue Reference - ${candidateName}`,
        message: `Reference check from ${refereeName || 'a referee'} for ${candidateName} is overdue. Consider sending a reminder.`,
        link: `/background-checks/${context.checkId}`,
        actionType: 'review' as const,
      };

    case 'referee_reminder':
      return {
        type: 'info' as const,
        priority: 'low' as const,
        title: `📧 Referee Reminder Sent`,
        message: `Reminder #${context.reminderNumber || 1} sent to ${refereeName || 'referee'} for ${candidateName}.`,
        link: `/background-checks/${context.checkId}`,
        actionType: 'view' as const,
      };

    case 'all_referees_completed':
      return {
        type: 'success' as const,
        priority: 'high' as const,
        title: `✓ All References Complete - ${candidateName}`,
        message: `All referees have completed their responses for ${candidateName}. Review the feedback.`,
        link: `/background-checks/${context.checkId}`,
        actionType: 'review' as const,
      };

    case 'check_completed':
      return {
        type: 'success' as const,
        priority: 'high' as const,
        title: `✓ Check Complete - ${candidateName}`,
        message: `Background check for ${candidateName} has been completed. ${checkType ? `(${checkType})` : ''}`,
        link: `/background-checks/${context.checkId}`,
        actionType: 'review' as const,
      };

    case 'check_requires_review':
      return {
        type: 'warning' as const,
        priority: 'high' as const,
        title: `⚠ Review Required - ${candidateName}`,
        message: `Background check for ${candidateName} requires your review before proceeding.`,
        link: `/background-checks/${context.checkId}`,
        actionType: 'review' as const,
      };

    case 'check_issues_found':
      return {
        type: 'error' as const,
        priority: 'critical' as const,
        title: `⚠ Issues Found - ${candidateName}`,
        message: `Background check for ${candidateName} has identified issues that require immediate attention.`,
        link: `/background-checks/${context.checkId}`,
        actionType: 'review' as const,
      };

    case 'check_initiated':
      return {
        type: 'info' as const,
        priority: 'low' as const,
        title: `Background Check Started - ${candidateName}`,
        message: `Background check process has been initiated for ${candidateName}${jobTitle ? ` (${jobTitle})` : ''}.`,
        link: `/background-checks/${context.checkId}`,
        actionType: 'view' as const,
      };

    case 'consent_requested':
      return {
        type: 'info' as const,
        priority: 'low' as const,
        title: `Consent Requested - ${candidateName}`,
        message: `Background check consent has been sent to ${candidateName}. Awaiting response.`,
        link: `/background-checks/${context.checkId}`,
        actionType: 'view' as const,
      };

    case 'referee_invited':
      return {
        type: 'info' as const,
        priority: 'low' as const,
        title: `Reference Invited - ${candidateName}`,
        message: `Reference check invitation sent to ${refereeName || 'referee'} for ${candidateName}.`,
        link: `/background-checks/${context.checkId}`,
        actionType: 'view' as const,
      };

    case 'referee_opened':
      return {
        type: 'info' as const,
        priority: 'low' as const,
        title: `Reference Opened - ${candidateName}`,
        message: `${refereeName || 'A referee'} has opened the reference check form for ${candidateName}.`,
        link: `/background-checks/${context.checkId}`,
        actionType: 'view' as const,
      };

    case 'check_cancelled':
      return {
        type: 'warning' as const,
        priority: 'medium' as const,
        title: `Check Cancelled - ${candidateName}`,
        message: `Background check for ${candidateName} has been cancelled.`,
        link: `/background-checks/${context.checkId}`,
        actionType: 'view' as const,
      };

    default:
      return {
        type: 'info' as const,
        priority: 'low' as const,
        title: `Background Check Update - ${candidateName}`,
        message: `There's an update on the background check for ${candidateName}.`,
        link: `/background-checks/${context.checkId}`,
        actionType: 'view' as const,
      };
  }
}

/**
 * Bulk notification for multiple events
 */
export function createBulkNotifications(
  events: Array<{ event: BackgroundCheckNotificationEvent; context: NotificationContext }>,
  recipientUserId?: string
): Notification[] {
  return events.map(({ event, context }) =>
    createBackgroundCheckNotification(event, context, recipientUserId)
  );
}
