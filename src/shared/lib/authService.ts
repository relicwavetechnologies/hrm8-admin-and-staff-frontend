/**
 * Authentication Service
 * Handles authentication-related API calls
 */

import { apiClient } from './api';
import { CompanyProfileSummary } from '@/shared/types/companyProfile';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER' | 'VISITOR';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId: string;
  companyName?: string;
  companyWebsite?: string;
  companyDomain?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  profile: CompanyProfileSummary;
}

export interface RegisterCompanyRequest {
  companyName: string;
  companyWebsite: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  password: string;
  countryOrRegion: string;
  acceptTerms: boolean;
}

export interface RegisterCompanyResponse {
  companyId: string;
  adminUserId: string;
  verificationRequired: boolean;
  verificationMethod: string;
  message: string;
}

export interface VerifyCompanyRequest {
  token: string;
  companyId: string;
}

export interface VerifyCompanyResponse {
  message: string;
  email?: string;
  user?: User;
  profile?: CompanyProfileSummary;
}

export interface ResendVerificationResponse {
  message: string;
  email?: string;
  companyId?: string;
  expiresAt?: string;
}

class AuthService {
  async login(credentials: LoginRequest) {
    return apiClient.post<LoginResponse>('/api/auth/login', credentials);
  }

  async logout() {
    return apiClient.post('/api/auth/logout');
  }

  async registerCompany(data: RegisterCompanyRequest) {
    return apiClient.post<RegisterCompanyResponse>('/api/auth/register/company', data);
  }

  async getCurrentUser() {
    return apiClient.get<{ user: User; profile: CompanyProfileSummary }>('/api/auth/me');
  }

  async verifyCompany(data: VerifyCompanyRequest) {
    return apiClient.post<VerifyCompanyResponse>('/api/auth/verify-company', data);
  }

  async employeeSignup(data: {
    firstName: string;
    lastName: string;
    businessEmail: string;
    password: string;
    acceptTerms: boolean;
    companyDomain?: string;
  }) {
    return apiClient.post<{ requestId: string; message: string }>('/api/auth/signup', data);
  }

  async acceptInvitation(data: {
    token: string;
    password: string;
    name: string;
  }) {
    return apiClient.post<{ userId: string; message: string }>('/api/auth/accept-invitation', data);
  }

  async resendVerification(email: string) {
    return apiClient.post<ResendVerificationResponse>('/api/auth/resend-verification', { email });
  }

  async requestPasswordReset(email: string) {
    return apiClient.post<{ message: string }>('/api/auth/forgot-password', { email });
  }

  async resetPassword(data: { token: string; password: string }) {
    return apiClient.post<{ message: string }>('/api/auth/reset-password', data);
  }
}

export const authService = new AuthService();

