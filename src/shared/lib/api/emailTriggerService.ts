import { apiClient } from '../api';

export type TriggerType = 'STAGE_CHANGE' | 'SCHEDULED_DATE' | 'APPLICATION_SUBMITTED' | 'INTERVIEW_SCHEDULED' | 'OFFER_EXTENDED' | 'OFFER_ACCEPTED' | 'OFFER_DECLINED';

export interface EmailTrigger {
  id: string;
  templateId: string;
  jobRoundId: string;
  triggerType: TriggerType;
  triggerCondition: any;
  delayDays: number;
  delayHours: number;
  scheduledTime: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmailTriggerRequest {
  templateId: string;
  triggerType: TriggerType;
  triggerCondition?: any;
  delayDays?: number;
  delayHours?: number;
  scheduledTime?: string;
  isActive?: boolean;
}

export interface UpdateEmailTriggerRequest {
  templateId?: string;
  triggerType?: TriggerType;
  triggerCondition?: any;
  delayDays?: number;
  delayHours?: number;
  scheduledTime?: string;
  isActive?: boolean;
}

export const emailTriggerService = {
  /**
   * Get triggers for a job round
   */
  async getTriggers(roundId: string): Promise<EmailTrigger[]> {
    const response = await apiClient.get<EmailTrigger[]>(`/api/job-rounds/${roundId}/email-triggers`);
    return response.data || [];
  },

  /**
   * Create trigger
   */
  async createTrigger(roundId: string, data: CreateEmailTriggerRequest): Promise<EmailTrigger> {
    const response = await apiClient.post<EmailTrigger>(`/api/job-rounds/${roundId}/email-triggers`, data);
    if (!response.success || !response.data) throw new Error(response.error);
    return response.data;
  },

  /**
   * Update trigger
   */
  async updateTrigger(id: string, data: UpdateEmailTriggerRequest): Promise<EmailTrigger> {
    const response = await apiClient.put<EmailTrigger>(`/api/email-triggers/${id}`, data);
    if (!response.success || !response.data) throw new Error(response.error);
    return response.data;
  },

  /**
   * Delete trigger
   */
  async deleteTrigger(id: string): Promise<void> {
    await apiClient.delete(`/api/email-triggers/${id}`);
  },
};

