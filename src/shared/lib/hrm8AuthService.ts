/**
 * HRM8 Authentication Service
 * Handles HRM8 Global Admin and Regional Licensee authentication-related API calls
 */

import { apiClient } from './api';

export interface Hrm8User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'GLOBAL_ADMIN' | 'REGIONAL_LICENSEE';
  status: string;
  regionIds?: string[];
}

export interface Hrm8LoginRequest {
  email: string;
  password: string;
}

export interface Hrm8LoginResponse {
  hrm8User: Hrm8User;
  message?: string;
}

class Hrm8AuthService {
  async login(credentials: Hrm8LoginRequest) {
    return apiClient.post<Hrm8LoginResponse>('/api/hrm8/auth/login', credentials);
  }

  async logout() {
    return apiClient.post('/api/hrm8/auth/logout');
  }

  async getCurrentHrm8User() {
    return apiClient.get<{ hrm8User: Hrm8User }>('/api/hrm8/auth/me');
  }

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    return apiClient.put('/api/hrm8/auth/change-password', data);
  }
}

export const hrm8AuthService = new Hrm8AuthService();
