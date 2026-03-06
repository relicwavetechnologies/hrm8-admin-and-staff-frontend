import { apiClient } from '@/shared/lib/apiClient';

export interface MessagingProvider {
  provider: 'smtp';
  name: string;
  configured: boolean;
  smtp_host: string | null;
  smtp_port: string | null;
  smtp_secure: boolean;
  smtp_from: string | null;
}

export const messagingService = {
  getProviders: async (): Promise<{ providers: MessagingProvider[] }> => {
    const response = await apiClient.get<any>('/api/hrm8/messaging/providers');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch messaging providers');
  },
};
