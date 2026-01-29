import type { ConsentRequest, ConsentResponse } from '@/shared/types/consent';

const CONSENTS_KEY = 'hrm8_consent_requests';
const CONSENT_RESPONSES_KEY = 'hrm8_consent_responses';

function initializeStorage() {
  if (!localStorage.getItem(CONSENTS_KEY)) {
    localStorage.setItem(CONSENTS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(CONSENT_RESPONSES_KEY)) {
    localStorage.setItem(CONSENT_RESPONSES_KEY, JSON.stringify([]));
  }
}

export function saveConsentRequest(consent: ConsentRequest): void {
  initializeStorage();
  const consents = getConsentRequests();
  consents.push(consent);
  localStorage.setItem(CONSENTS_KEY, JSON.stringify(consents));
}

export function getConsentRequests(): ConsentRequest[] {
  initializeStorage();
  const data = localStorage.getItem(CONSENTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getConsentById(id: string): ConsentRequest | undefined {
  return getConsentRequests().find(c => c.id === id);
}

export function getConsentByToken(token: string): ConsentRequest | undefined {
  return getConsentRequests().find(c => c.token === token);
}

export function updateConsent(id: string, updates: Partial<ConsentRequest>): void {
  const consents = getConsentRequests();
  const index = consents.findIndex(c => c.id === id);
  if (index !== -1) {
    consents[index] = {
      ...consents[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(CONSENTS_KEY, JSON.stringify(consents));
  }
}

export function getConsentsByCandidate(candidateId: string): ConsentRequest[] {
  return getConsentRequests().filter(c => c.candidateId === candidateId);
}

export function getConsentsByBackgroundCheck(backgroundCheckId: string): ConsentRequest[] {
  return getConsentRequests().filter(c => c.backgroundCheckId === backgroundCheckId);
}

export function saveConsentResponse(response: ConsentResponse): void {
  initializeStorage();
  const responses = getConsentResponses();
  responses.push(response);
  localStorage.setItem(CONSENT_RESPONSES_KEY, JSON.stringify(responses));
}

export function getConsentResponses(): ConsentResponse[] {
  initializeStorage();
  const data = localStorage.getItem(CONSENT_RESPONSES_KEY);
  return data ? JSON.parse(data) : [];
}

export function getConsentResponseByRequestId(requestId: string): ConsentResponse | undefined {
  return getConsentResponses().find(r => r.consentRequestId === requestId);
}
