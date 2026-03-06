/**
 * Email service for sending ATS notifications
 * Note: Requires RESEND_API_KEY to be configured in Supabase secrets
 */

export interface EmailNotification {
  to: string;
  subject: string;
  type: 'application' | 'interview' | 'offer' | 'background-check';
  data: {
    candidateName?: string;
    jobTitle?: string;
    interviewDate?: string;
    interviewTime?: string;
    interviewType?: string;
    meetingLink?: string;
    offerDetails?: string;
    consentLink?: string;
    [key: string]: any;
  };
}

export async function sendNotificationEmail(notification: EmailNotification): Promise<void> {
  try {
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    
    if (!SUPABASE_URL) {
      console.warn('Supabase URL not configured. Email notification skipped.');
      return;
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-notification-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify(notification),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to send email:', error);
      throw new Error('Failed to send email notification');
    }

    console.log('Email notification sent successfully');
  } catch (error) {
    console.error('Email service error:', error);
    // Don't throw - we don't want email failures to break the application flow
  }
}

// Helper functions for common notifications
export async function sendApplicationReceivedEmail(
  candidateName: string,
  candidateEmail: string,
  jobTitle: string
): Promise<void> {
  await sendNotificationEmail({
    to: candidateEmail,
    subject: 'Application Received - ' + jobTitle,
    type: 'application',
    data: {
      candidateName,
      jobTitle,
    },
  });
}

export async function sendInterviewScheduledEmail(
  candidateName: string,
  candidateEmail: string,
  jobTitle: string,
  interviewDate: string,
  interviewTime: string,
  interviewType: string,
  meetingLink?: string
): Promise<void> {
  await sendNotificationEmail({
    to: candidateEmail,
    subject: 'Interview Scheduled - ' + jobTitle,
    type: 'interview',
    data: {
      candidateName,
      jobTitle,
      interviewDate,
      interviewTime,
      interviewType,
      meetingLink,
    },
  });
}

export async function sendOfferLetterEmail(
  candidateName: string,
  candidateEmail: string,
  jobTitle: string
): Promise<void> {
  await sendNotificationEmail({
    to: candidateEmail,
    subject: 'Job Offer - ' + jobTitle,
    type: 'offer',
    data: {
      candidateName,
      jobTitle,
    },
  });
}

export async function sendBackgroundCheckEmail(
  candidateName: string,
  candidateEmail: string,
  consentLink: string
): Promise<void> {
  await sendNotificationEmail({
    to: candidateEmail,
    subject: 'Background Check Required',
    type: 'background-check',
    data: {
      candidateName,
      consentLink,
    },
  });
}
