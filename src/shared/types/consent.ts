import type { BackgroundCheckType } from './backgroundCheck';

export interface ConsentRequest {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  backgroundCheckId: string;
  requestedChecks: Array<{
    checkType: BackgroundCheckType;
    provider: string;
    cost: number;
    description: string;
  }>;
  token: string;
  status: 'pending' | 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired';
  legalDisclosure: string;
  privacyPolicyUrl: string;
  sentDate: string;
  viewedDate?: string;
  respondedDate?: string;
  expiryDate: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConsentResponse {
  consentRequestId: string;
  accepted: boolean;
  signatureDataUrl?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  candidateComments?: string;
}
