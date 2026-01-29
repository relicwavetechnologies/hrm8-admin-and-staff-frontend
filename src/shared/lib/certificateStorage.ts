import type { Certificate, CertificateTemplate } from '@/shared/types/performance';
import { mockCertificateTemplates } from '@/shared/data/mockCertificateTemplates';

const CERTIFICATES_KEY = 'certificates';

export function getCertificates(employeeId?: string): Certificate[] {
  const stored = localStorage.getItem(CERTIFICATES_KEY);
  let certificates = stored ? JSON.parse(stored) : [];
  
  if (employeeId) {
    certificates = certificates.filter((c: Certificate) => c.employeeId === employeeId);
  }
  
  return certificates;
}

export function getCertificateById(id: string): Certificate | undefined {
  const certificates = getCertificates();
  return certificates.find(c => c.id === id);
}

export function saveCertificate(certificate: Certificate): void {
  const certificates = getCertificates();
  certificates.push(certificate);
  localStorage.setItem(CERTIFICATES_KEY, JSON.stringify(certificates));
}

export function generateCertificate(
  employeeId: string,
  employeeName: string,
  type: Certificate['type'],
  title: string,
  courseData?: {
    courseId?: string;
    courseName?: string;
    score?: number;
    hours?: number;
  }
): Certificate {
  const verificationCode = generateVerificationCode();
  
  const certificate: Certificate = {
    id: `cert-${Date.now()}`,
    employeeId,
    employeeName,
    type,
    title,
    description: `Certificate of ${type === 'course' ? 'Completion' : type === 'certification' ? 'Certification' : type === 'skill-mastery' ? 'Skill Mastery' : 'Program Completion'}`,
    issueDate: new Date(),
    issuer: 'Learning & Development Team',
    issuerSignature: 'Director of L&D',
    verificationCode,
    skills: [],
    credentialUrl: `${window.location.origin}/verify/${verificationCode}`,
    certificateData: courseData || {}
  };
  
  saveCertificate(certificate);
  return certificate;
}

export function verifyCertificate(verificationCode: string): Certificate | undefined {
  const certificates = getCertificates();
  return certificates.find(c => c.verificationCode === verificationCode);
}

export function getCertificateTemplates(): CertificateTemplate[] {
  return mockCertificateTemplates;
}

export function getCertificateTemplate(id: string): CertificateTemplate | undefined {
  return mockCertificateTemplates.find(t => t.id === id);
}

function generateVerificationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
