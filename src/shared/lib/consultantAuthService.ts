/**
 * Consultant Authentication Service
 * Handles consultant authentication-related API calls
 */

import { apiClient } from './api';

export interface ConsultantUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'RECRUITER' | 'SALES_AGENT' | 'CONSULTANT_360';
  status: string;
  defaultCurrency?: string;
  payoutCurrency?: string | null;
  requiresCurrencySetup?: boolean;
}

export interface ConsultantLoginRequest {
  email: string;
  password: string;
}

export interface ConsultantLoginResponse {
  consultant: ConsultantUser;
  message?: string;
}

class ConsultantAuthService {
  async login(credentials: ConsultantLoginRequest) {
    return apiClient.post<ConsultantLoginResponse>('/api/consultant/auth/login', credentials);
  }

  async logout() {
    return apiClient.post('/api/consultant/auth/logout');
  }

  async getCurrentConsultant() {
    return apiClient.get<{ consultant: ConsultantUser }>('/api/consultant/auth/me');
  }

  async updateCurrencyPreference(payoutCurrency: string) {
    return apiClient.patch<{ consultant: { payoutCurrency: string; requiresCurrencySetup: boolean } }>(
      '/api/consultant/profile/currency-preference',
      { payoutCurrency }
    );
  }
}

export const consultantAuthService = new ConsultantAuthService();

