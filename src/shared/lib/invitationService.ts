/**
 * Invitation Service
 * Handles invitation-related API calls
 */

import { apiClient } from './api';

export interface Invitation {
  id: string;
  companyId: string;
  invitedBy: string;
  email: string;
  token: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
  expiresAt: string;
  acceptedAt?: string;
  createdAt: string;
}

export interface SendInvitationsRequest {
  emails: string[];
}

export interface SendInvitationsResponse {
  sent: string[];
  failed: Array<{ email: string; reason: string }>;
}

class InvitationService {
  async sendInvitations(data: SendInvitationsRequest) {
    return apiClient.post<SendInvitationsResponse>('/api/employees/invite', data);
  }

  async getInvitations() {
    return apiClient.get<Invitation[]>('/api/employees/invitations');
  }
}

export const invitationService = new InvitationService();

