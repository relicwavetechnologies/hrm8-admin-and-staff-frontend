import { z } from "zod";

export interface EmailNotification {
  id: string;
  to: string;
  subject: string;
  body: string;
  type: 'stage_change' | 'interview_scheduled' | 'offer_sent' | 'rejection' | 'reminder';
  status: 'pending' | 'sent' | 'failed';
  sentAt?: string;
  metadata?: Record<string, any>;
}

// Validation schema
const emailSchema = z.object({
  to: z.string().trim().email().max(255),
  subject: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(5000),
});

const mockNotifications: EmailNotification[] = [];

export function sendStageChangeEmail(
  candidateName: string,
  candidateEmail: string,
  fromStage: string,
  toStage: string,
  jobTitle: string
): EmailNotification {
  // Validate email
  const validated = emailSchema.parse({
    to: candidateEmail,
    subject: `Application Update: ${jobTitle}`,
    body: `Hi ${candidateName},\n\nYour application for ${jobTitle} has been moved to ${toStage}.\n\nBest regards,\nThe Hiring Team`,
  });

  const notification: EmailNotification = {
    id: Date.now().toString(),
    to: validated.to,
    subject: validated.subject,
    body: validated.body,
    type: 'stage_change',
    status: 'sent',
    sentAt: new Date().toISOString(),
    metadata: {
      candidateName,
      fromStage,
      toStage,
      jobTitle,
    },
  };

  mockNotifications.unshift(notification);
  
  // Simulate sending (in real app, would call email service API)
  console.log(`📧 Email notification sent to ${candidateEmail}:`, notification.subject);
  
  return notification;
}

export function sendInterviewScheduledEmail(
  candidateName: string,
  candidateEmail: string,
  jobTitle: string,
  interviewDate: string,
  interviewType: string
): EmailNotification {
  const validated = emailSchema.parse({
    to: candidateEmail,
    subject: `Interview Scheduled: ${jobTitle}`,
    body: `Hi ${candidateName},\n\nYour ${interviewType} interview for ${jobTitle} has been scheduled for ${new Date(interviewDate).toLocaleString()}.\n\nBest regards,\nThe Hiring Team`,
  });

  const notification: EmailNotification = {
    id: Date.now().toString(),
    to: validated.to,
    subject: validated.subject,
    body: validated.body,
    type: 'interview_scheduled',
    status: 'sent',
    sentAt: new Date().toISOString(),
    metadata: {
      candidateName,
      jobTitle,
      interviewDate,
      interviewType,
    },
  };

  mockNotifications.unshift(notification);
  console.log(`📧 Interview email sent to ${candidateEmail}`);
  
  return notification;
}

export function sendOfferEmail(
  candidateName: string,
  candidateEmail: string,
  jobTitle: string,
  offerDetails: string
): EmailNotification {
  const validated = emailSchema.parse({
    to: candidateEmail,
    subject: `Job Offer: ${jobTitle}`,
    body: `Hi ${candidateName},\n\nCongratulations! We are pleased to extend an offer for the position of ${jobTitle}.\n\n${offerDetails}\n\nBest regards,\nThe Hiring Team`,
  });

  const notification: EmailNotification = {
    id: Date.now().toString(),
    to: validated.to,
    subject: validated.subject,
    body: validated.body,
    type: 'offer_sent',
    status: 'sent',
    sentAt: new Date().toISOString(),
    metadata: {
      candidateName,
      jobTitle,
      offerDetails,
    },
  };

  mockNotifications.unshift(notification);
  console.log(`📧 Offer email sent to ${candidateEmail}`);
  
  return notification;
}

export function sendRejectionEmail(
  candidateName: string,
  candidateEmail: string,
  jobTitle: string
): EmailNotification {
  const validated = emailSchema.parse({
    to: candidateEmail,
    subject: `Application Update: ${jobTitle}`,
    body: `Hi ${candidateName},\n\nThank you for your interest in the ${jobTitle} position. After careful consideration, we have decided to move forward with other candidates.\n\nWe appreciate your time and wish you the best in your job search.\n\nBest regards,\nThe Hiring Team`,
  });

  const notification: EmailNotification = {
    id: Date.now().toString(),
    to: validated.to,
    subject: validated.subject,
    body: validated.body,
    type: 'rejection',
    status: 'sent',
    sentAt: new Date().toISOString(),
    metadata: {
      candidateName,
      jobTitle,
    },
  };

  mockNotifications.unshift(notification);
  console.log(`📧 Rejection email sent to ${candidateEmail}`);
  
  return notification;
}

export function getNotifications(limit: number = 50): EmailNotification[] {
  return mockNotifications.slice(0, limit);
}

export function getNotificationsByCandidate(candidateEmail: string): EmailNotification[] {
  return mockNotifications.filter((n) => n.to === candidateEmail);
}
