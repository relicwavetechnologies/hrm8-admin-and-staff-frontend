import { apiClient } from '../api';

export type EmailStatus = 'SENT' | 'DELIVERED' | 'OPENED' | 'BOUNCED' | 'FAILED';

export interface EmailMessage {
  id: string;
  templateId: string | null;
  applicationId: string | null;
  candidateId: string;
  jobId: string;
  jobRoundId: string | null;
  to: string;
  cc: string[];
  bcc: string[];
  subject: string;
  body: string;
  status: EmailStatus;
  sentAt: string;
  deliveredAt: string | null;
  openedAt: string | null;
  bouncedAt: string | null;
  errorMessage: string | null;
  senderId: string;
  senderEmail: string;
}

export interface EmailFilters {
  candidateId?: string;
  applicationId?: string;
  jobId?: string;
  jobRoundId?: string;
  status?: EmailStatus;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export const emailInboxService = {
  /**
   * Get emails with filters
   */
  async getEmails(filters?: EmailFilters): Promise<EmailMessage[]> {
    const params = new URLSearchParams();
    if (filters?.candidateId) params.append('candidateId', filters.candidateId);
    if (filters?.applicationId) params.append('applicationId', filters.applicationId);
    if (filters?.jobId) params.append('jobId', filters.jobId);
    if (filters?.jobRoundId) params.append('jobRoundId', filters.jobRoundId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const response = await apiClient.get<EmailMessage[]>(`/api/emails?${params.toString()}`);
    return response.data || [];
  },

  /**
   * Get email by ID
   */
  async getEmail(id: string): Promise<EmailMessage> {
    const response = await apiClient.get<EmailMessage>(`/api/emails/${id}`);
    if (!response.success || !response.data) throw new Error(response.error);
    return response.data;
  },

  /**
   * Get emails for an application
   */
  async getApplicationEmails(applicationId: string): Promise<EmailMessage[]> {
    const response = await apiClient.get<EmailMessage[]>(`/api/applications/${applicationId}/emails`);
    return response.data || [];
  },

  /**
   * Resend failed email
   */
  async resendEmail(id: string): Promise<void> {
    await apiClient.post(`/api/emails/${id}/resend`);
  },
};

