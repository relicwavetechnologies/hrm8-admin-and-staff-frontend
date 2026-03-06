import { v4 as uuidv4 } from 'uuid';
import type { ConsentRequest, ConsentResponse } from '@/shared/types/consent';
import type { BackgroundCheckType } from '@/shared/types/backgroundCheck';
import {
  saveConsentRequest,
  updateConsent,
  getConsentByToken as getConsentByTokenStorage,
  saveConsentResponse
} from './consentStorage';
import { updateBackgroundCheck } from '@/shared/lib/mockBackgroundCheckStorage';
import { generateConsentEmail } from './emailTemplates';
import { LEGAL_DISCLOSURE_TEMPLATE, PRIVACY_POLICY_URL } from './legalTemplates';
import { BACKGROUND_CHECK_PRICING } from './pricingConstants';
import { createBackgroundCheckNotification } from './notificationService';
import { sendBackgroundCheckEmail } from './emailNotificationService';
import { handleConsentReceived } from './statusUpdateService';

export function generateConsentToken(): string {
  return `consent_${uuidv4()}_${Date.now()}`;
}

export function createConsentRequest(
  candidateId: string,
  candidateName: string,
  candidateEmail: string,
  backgroundCheckId: string,
  checkTypes: BackgroundCheckType[],
  createdBy: string,
  createdByName: string
): ConsentRequest {
  const token = generateConsentToken();
  const now = new Date();
  const expiryDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const requestedChecks = checkTypes.map(type => {
    const pricing = BACKGROUND_CHECK_PRICING[type];
    return {
      checkType: type,
      provider: pricing.provider,
      cost: pricing.cost,
      description: pricing.name
    };
  });

  const consentRequest: ConsentRequest = {
    id: uuidv4(),
    candidateId,
    candidateName,
    candidateEmail,
    backgroundCheckId,
    requestedChecks,
    token,
    status: 'pending',
    legalDisclosure: LEGAL_DISCLOSURE_TEMPLATE,
    privacyPolicyUrl: PRIVACY_POLICY_URL,
    sentDate: now.toISOString(),
    expiryDate: expiryDate.toISOString(),
    createdBy,
    createdByName,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };

  saveConsentRequest(consentRequest);
  return consentRequest;
}

export function sendConsentEmail(consent: ConsentRequest): void {
  const consentUrl = `${window.location.origin}/consent/${consent.token}`;
  const emailHtml = generateConsentEmail(consent, consentUrl);
  
  // Simulate sending email (log to console)
  console.log('📧 Sending consent email to:', consent.candidateEmail);
  console.log('Consent URL:', consentUrl);
  console.log('Email HTML:', emailHtml);
  
  // Update status to sent
  updateConsent(consent.id, { status: 'sent' });

  // Send email notification
  sendBackgroundCheckEmail('consent_requested', {
    candidateName: consent.candidateName,
    candidateEmail: consent.candidateEmail,
    recruiterName: 'Recruiter',
    recruiterEmail: 'recruiter@example.com',
    checkId: consent.backgroundCheckId,
    consentLink: consentUrl,
  });

  // Create in-app notification for recruiter
  createBackgroundCheckNotification('consent_requested', {
    candidateName: consent.candidateName,
    candidateEmail: consent.candidateEmail,
    checkId: consent.backgroundCheckId,
  });
}

export function getConsentByToken(token: string): ConsentRequest | undefined {
  return getConsentByTokenStorage(token);
}

export function validateConsentToken(token: string): boolean {
  const consent = getConsentByToken(token);
  
  if (!consent) return false;
  if (consent.status === 'expired') return false;
  if (consent.status === 'accepted' || consent.status === 'declined') return false;
  
  // Check if expired
  const now = new Date();
  const expiryDate = new Date(consent.expiryDate);
  
  if (now > expiryDate) {
    updateConsent(consent.id, { status: 'expired' });
    return false;
  }
  
  return true;
}

export function markConsentAsViewed(token: string): void {
  const consent = getConsentByToken(token);
  if (consent && consent.status === 'sent') {
    updateConsent(consent.id, {
      status: 'viewed',
      viewedDate: new Date().toISOString()
    });
  }
}

export function acceptConsent(
  token: string,
  signatureDataUrl: string,
  ipAddress: string = '0.0.0.0',
  userAgent: string = navigator.userAgent
): void {
  const consent = getConsentByToken(token);
  if (!consent) throw new Error('Consent request not found');
  
  const now = new Date().toISOString();
  
  // Save consent response
  const response: ConsentResponse = {
    consentRequestId: consent.id,
    accepted: true,
    signatureDataUrl,
    ipAddress,
    userAgent,
    timestamp: now
  };
  saveConsentResponse(response);
  
  // Update consent request
  updateConsent(consent.id, {
    status: 'accepted',
    respondedDate: now
  });
  
  // Trigger automated status update and notifications
  handleConsentReceived(consent.backgroundCheckId);

  // Send additional email notifications
  sendBackgroundCheckEmail('consent_given', {
    candidateName: consent.candidateName,
    candidateEmail: consent.candidateEmail,
    recruiterName: 'Recruiter',
    recruiterEmail: 'recruiter@example.com',
    checkId: consent.backgroundCheckId,
    reportLink: `${window.location.origin}/background-checks/${consent.backgroundCheckId}`,
  });
  
  console.log('✅ Consent accepted for background check:', consent.backgroundCheckId);
}

export function declineConsent(
  token: string,
  reason?: string
): void {
  const consent = getConsentByToken(token);
  if (!consent) throw new Error('Consent request not found');
  
  const now = new Date().toISOString();
  
  // Save consent response
  const response: ConsentResponse = {
    consentRequestId: consent.id,
    accepted: false,
    timestamp: now,
    candidateComments: reason
  };
  saveConsentResponse(response);
  
  // Update consent request
  updateConsent(consent.id, {
    status: 'declined',
    respondedDate: now
  });
  
  // Update background check status
  updateBackgroundCheck(consent.backgroundCheckId, {
    status: 'cancelled'
  });

  // Send notifications
  sendBackgroundCheckEmail('consent_declined', {
    candidateName: consent.candidateName,
    candidateEmail: consent.candidateEmail,
    recruiterName: 'Recruiter',
    recruiterEmail: 'recruiter@example.com',
    checkId: consent.backgroundCheckId,
    reportLink: `${window.location.origin}/background-checks/${consent.backgroundCheckId}`,
  });

  createBackgroundCheckNotification('consent_declined', {
    candidateName: consent.candidateName,
    checkId: consent.backgroundCheckId,
  });
  
  console.log('❌ Consent declined for background check:', consent.backgroundCheckId);
}
