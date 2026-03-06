export interface EmailLog {
  id: string;
  templateId?: string;
  recipientIds: string[];
  recipientEmails: string[];
  subject: string;
  body: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  scheduledFor?: string;
  sentAt?: string;
  opens: number;
  clicks: number;
  bounces: string[];
  createdBy: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface EmailEvent {
  id: string;
  emailLogId: string;
  recipientEmail: string;
  eventType: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface EmailStats {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  totalFailed: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  deliveryRate: number;
}
