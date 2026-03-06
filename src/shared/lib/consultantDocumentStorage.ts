import type { ConsultantDocument, ConsultantDocumentType } from '@/shared/types/consultantCRM';
import { getConsultantDocuments, addConsultantDocument, deleteConsultantDocument } from './consultantCRMStorage';

export {
  getConsultantDocuments,
  addConsultantDocument,
  deleteConsultantDocument,
};

export function getDocumentsByType(
  consultantId: string,
  type: ConsultantDocumentType
): ConsultantDocument[] {
  return getConsultantDocuments(consultantId).filter(d => d.type === type);
}

export function getExpiredDocuments(consultantId: string): ConsultantDocument[] {
  const now = new Date();
  return getConsultantDocuments(consultantId).filter(d => {
    if (!d.expiryDate) return false;
    return new Date(d.expiryDate) < now;
  });
}

export function getExpiringDocuments(
  consultantId: string,
  daysAhead: number = 30
): ConsultantDocument[] {
  const now = new Date();
  const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  
  return getConsultantDocuments(consultantId).filter(d => {
    if (!d.expiryDate) return false;
    const expiry = new Date(d.expiryDate);
    return expiry > now && expiry <= futureDate;
  });
}
