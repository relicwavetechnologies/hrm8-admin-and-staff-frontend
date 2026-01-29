/**
 * Signup Request Service
 * Handles signup request-related API calls
 */

import { apiClient } from './api';

export interface SignupRequest {
  id: string;
  companyId: string;
  email: string;
  name: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SignupRequestResponse {
  signupRequests: SignupRequest[];
}

class SignupRequestService {
  async getPendingSignupRequests() {
    return apiClient.get<SignupRequest[]>('/api/signup-requests/pending');
  }

  async getSignupRequests() {
    return apiClient.get<SignupRequest[]>('/api/signup-requests');
  }

  async approveSignupRequest(requestId: string) {
    return apiClient.post<{
      signupRequest: SignupRequest;
      user: {
        id: string;
        email: string;
        name: string;
      };
      message: string;
    }>(`/api/signup-requests/${requestId}/approve`);
  }

  async rejectSignupRequest(requestId: string, reason?: string) {
    return apiClient.post<{
      signupRequest: SignupRequest;
      message: string;
    }>(`/api/signup-requests/${requestId}/reject`, { reason });
  }
}

export const signupRequestService = new SignupRequestService();

