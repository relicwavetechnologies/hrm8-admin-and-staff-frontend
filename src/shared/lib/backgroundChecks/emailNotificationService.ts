import { BackgroundCheckNotificationEvent } from './notificationService';

interface EmailNotificationContext {
  candidateName: string;
  candidateEmail?: string;
  recruiterName?: string;
  recruiterEmail?: string;
  checkId: string;
  jobTitle?: string;
  refereeName?: string;
  refereeEmail?: string;
  checkType?: string;
  consentLink?: string;
  referenceLink?: string;
  reportLink?: string;
  reminderNumber?: number;
  questionnaireLink?: string;
}

/**
 * Generates email notification templates for background check events
 * In production, this would integrate with Resend or similar email service
 */
export function sendBackgroundCheckEmail(
  event: BackgroundCheckNotificationEvent,
  context: EmailNotificationContext
): void {
  const emailConfig = getEmailConfig(event, context);
  
  // Mock email sending - log to console
  console.log('📧 Email Notification:', {
    to: emailConfig.to,
    subject: emailConfig.subject,
    body: emailConfig.body,
    event,
    timestamp: new Date().toISOString(),
  });

  // In production, replace with actual email service:
  /*
  await fetch(`${SUPABASE_URL}/functions/v1/send-notification-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      to: emailConfig.to,
      subject: emailConfig.subject,
      html: emailConfig.body,
      type: 'background-check',
      data: context,
    }),
  });
  */
}

function getEmailConfig(
  event: BackgroundCheckNotificationEvent,
  context: EmailNotificationContext
) {
  const {
    candidateName,
    candidateEmail,
    recruiterName = 'Recruiter',
    recruiterEmail,
    refereeName,
    refereeEmail,
    jobTitle,
    consentLink,
    referenceLink,
    reportLink,
  } = context;

  switch (event) {
    case 'consent_requested':
      return {
        to: candidateEmail,
        subject: `Background Check Consent Required - ${jobTitle || 'Position'}`,
        body: `
          <h2>Background Check Consent Required</h2>
          <p>Dear ${candidateName},</p>
          <p>As part of your application for ${jobTitle || 'the position'}, we require your consent to proceed with background verification checks.</p>
          <p>Please review and provide your consent by clicking the link below:</p>
          <p><a href="${consentLink}" style="padding: 12px 24px; background: #0066cc; color: white; text-decoration: none; border-radius: 6px; display: inline-block;">Review and Provide Consent</a></p>
          <p>This link will expire in 7 days.</p>
          <p>If you have any questions, please contact ${recruiterName} at ${recruiterEmail}.</p>
          <br/>
          <p>Best regards,<br/>HRM8 Team</p>
        `,
      };

    case 'consent_given':
      return {
        to: recruiterEmail,
        subject: `✓ Consent Approved - ${candidateName}`,
        body: `
          <h2>Background Check Consent Approved</h2>
          <p>Dear ${recruiterName},</p>
          <p>${candidateName} has approved the background check consent.</p>
          <p>The following checks are now in progress:</p>
          <p><a href="${reportLink}" style="padding: 12px 24px; background: #0066cc; color: white; text-decoration: none; border-radius: 6px; display: inline-block;">View Background Check Status</a></p>
          <br/>
          <p>Best regards,<br/>HRM8 Team</p>
        `,
      };

    case 'consent_declined':
      return {
        to: recruiterEmail,
        subject: `✗ Consent Declined - ${candidateName}`,
        body: `
          <h2>Background Check Consent Declined</h2>
          <p>Dear ${recruiterName},</p>
          <p>${candidateName} has declined the background check consent.</p>
          <p>Please review the situation and contact the candidate if necessary.</p>
          <p><a href="${reportLink}" style="padding: 12px 24px; background: #0066cc; color: white; text-decoration: none; border-radius: 6px; display: inline-block;">View Details</a></p>
          <br/>
          <p>Best regards,<br/>HRM8 Team</p>
        `,
      };

    case 'referee_invited':
      return {
        to: refereeEmail!,
        subject: `Reference Check Request for ${candidateName}`,
        body: `
          <h2>Reference Check Request</h2>
          <p>Dear ${refereeName},</p>
          <p>${candidateName} has listed you as a professional reference for a position they've applied for.</p>
          <p>We would greatly appreciate it if you could complete a brief reference questionnaire about your professional experience with ${candidateName}.</p>
          <p><a href="${referenceLink}" style="padding: 12px 24px; background: #0066cc; color: white; text-decoration: none; border-radius: 6px; display: inline-block;">Complete Reference Check</a></p>
          <p>The questionnaire should take approximately 5-10 minutes to complete. This link will expire in 14 days.</p>
          <p>Your feedback is confidential and will only be used for employment verification purposes.</p>
          <br/>
          <p>Thank you for your time,<br/>HRM8 Team</p>
        `,
      };

    case 'referee_completed':
      return {
        to: recruiterEmail,
        subject: `✓ Reference Completed - ${candidateName}`,
        body: `
          <h2>Reference Check Completed</h2>
          <p>Dear ${recruiterName},</p>
          <p>${refereeName || 'A referee'} has completed their reference check for ${candidateName}.</p>
          <p><a href="${reportLink}" style="padding: 12px 24px; background: #0066cc; color: white; text-decoration: none; border-radius: 6px; display: inline-block;">View Reference Response</a></p>
          <br/>
          <p>Best regards,<br/>HRM8 Team</p>
        `,
      };

    case 'all_referees_completed':
      return {
        to: recruiterEmail,
        subject: `✓ All References Complete - ${candidateName}`,
        body: `
          <h2>All Reference Checks Completed</h2>
          <p>Dear ${recruiterName},</p>
          <p>All referees have completed their responses for ${candidateName}.</p>
          <p>You can now review all feedback and proceed with your hiring decision.</p>
          <p><a href="${reportLink}" style="padding: 12px 24px; background: #0066cc; color: white; text-decoration: none; border-radius: 6px; display: inline-block;">Review All References</a></p>
          <br/>
          <p>Best regards,<br/>HRM8 Team</p>
        `,
      };

    case 'check_completed':
      return {
        to: recruiterEmail,
        subject: `✓ Background Check Complete - ${candidateName}`,
        body: `
          <h2>Background Check Completed</h2>
          <p>Dear ${recruiterName},</p>
          <p>The background check for ${candidateName} has been completed.</p>
          <p><a href="${reportLink}" style="padding: 12px 24px; background: #0066cc; color: white; text-decoration: none; border-radius: 6px; display: inline-block;">View Full Report</a></p>
          <br/>
          <p>Best regards,<br/>HRM8 Team</p>
        `,
      };

    case 'check_requires_review':
      return {
        to: recruiterEmail,
        subject: `⚠ Review Required - ${candidateName}`,
        body: `
          <h2>Background Check Requires Review</h2>
          <p>Dear ${recruiterName},</p>
          <p>The background check for ${candidateName} requires your review before proceeding.</p>
          <p><a href="${reportLink}" style="padding: 12px 24px; background: #ff9900; color: white; text-decoration: none; border-radius: 6px; display: inline-block;">Review Now</a></p>
          <br/>
          <p>Best regards,<br/>HRM8 Team</p>
        `,
      };

    case 'check_issues_found':
      return {
        to: recruiterEmail,
        subject: `⚠ URGENT: Issues Found - ${candidateName}`,
        body: `
          <h2>Background Check - Issues Identified</h2>
          <p>Dear ${recruiterName},</p>
          <p>The background check for ${candidateName} has identified issues that require immediate attention.</p>
          <p><a href="${reportLink}" style="padding: 12px 24px; background: #cc0000; color: white; text-decoration: none; border-radius: 6px; display: inline-block;">Review Issues</a></p>
          <br/>
          <p>Best regards,<br/>HRM8 Team</p>
        `,
      };

    case 'referee_overdue':
      return {
        to: refereeEmail!,
        subject: `Reminder: Reference Check for ${candidateName}`,
        body: `
          <h2>Reference Check Reminder</h2>
          <p>Dear ${refereeName},</p>
          <p>This is a friendly reminder that we're still waiting for your reference feedback regarding ${candidateName}.</p>
          <p>If you haven't had a chance to complete the questionnaire yet, please do so at your earliest convenience:</p>
          <p><a href="${referenceLink}" style="padding: 12px 24px; background: #0066cc; color: white; text-decoration: none; border-radius: 6px; display: inline-block;">Complete Reference Check</a></p>
          <p>If you're unable to provide a reference, please let us know by replying to this email.</p>
          <br/>
          <p>Thank you,<br/>HRM8 Team</p>
        `,
      };

    default:
      return {
        to: recruiterEmail,
        subject: `Background Check Update - ${candidateName}`,
        body: `
          <h2>Background Check Update</h2>
          <p>Dear ${recruiterName},</p>
          <p>There's an update on the background check for ${candidateName}.</p>
          <p><a href="${reportLink}" style="padding: 12px 24px; background: #0066cc; color: white; text-decoration: none; border-radius: 6px; display: inline-block;">View Update</a></p>
          <br/>
          <p>Best regards,<br/>HRM8 Team</p>
        `,
      };
  }
}

/**
 * Send reminder email to overdue referees
 */
export function sendRefereeReminder(
  refereeName: string,
  refereeEmail: string,
  candidateName: string,
  referenceLink: string
): void {
  sendBackgroundCheckEmail('referee_overdue', {
    candidateName,
    candidateEmail: '',
    recruiterEmail: '',
    refereeName,
    refereeEmail,
    referenceLink,
    checkId: '',
  });
}
