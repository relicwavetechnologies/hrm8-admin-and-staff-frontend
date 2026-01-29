export interface ApplicationEmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  isCustom: boolean;
}

const STORAGE_KEY = 'application_email_templates';

// Default templates
const defaultTemplates: ApplicationEmailTemplate[] = [
  {
    id: 'default-1',
    name: 'Application Received',
    subject: 'Application Received - {jobTitle} Position',
    body: '<p>Dear {candidateName},</p><p>Thank you for your interest in the {jobTitle} position at {companyName}. We have received your application and our team is currently reviewing all submissions.</p><p>You can expect to hear back from us within the next few days regarding the next steps.</p><p>Best regards,<br>{recruiterName}</p>',
    isCustom: false,
  },
  {
    id: 'default-2',
    name: 'Interview Invitation',
    subject: 'Interview Invitation - {jobTitle} at {companyName}',
    body: '<p>Dear {candidateName},</p><p>We are pleased to invite you for an interview for the {jobTitle} position at {companyName}.</p><p>Your application, submitted on {applicationDate}, has impressed our team and we would like to learn more about your experience and qualifications.</p><p>Please reply to this email with your availability for the coming week.</p><p>Best regards,<br>{recruiterName}</p>',
    isCustom: false,
  },
  {
    id: 'default-3',
    name: 'Application Status Update',
    subject: 'Update on Your Application - {jobTitle}',
    body: '<p>Dear {candidateName},</p><p>We wanted to provide you with an update on your application for the {jobTitle} position at {companyName}.</p><p>Your application has progressed to the {currentStage} stage. We appreciate your patience throughout this process.</p><p>We will be in touch soon with next steps.</p><p>Best regards,<br>{recruiterName}</p>',
    isCustom: false,
  },
];

function getSavedTemplates(): ApplicationEmailTemplate[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];
  
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export function getApplicationEmailTemplates(): ApplicationEmailTemplate[] {
  return [...defaultTemplates, ...getSavedTemplates()];
}

export function saveApplicationEmailTemplate(template: Omit<ApplicationEmailTemplate, 'id' | 'isCustom'>): ApplicationEmailTemplate {
  const saved = getSavedTemplates();
  const newTemplate: ApplicationEmailTemplate = {
    ...template,
    id: `custom-${Date.now()}`,
    isCustom: true,
  };
  
  saved.push(newTemplate);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  
  return newTemplate;
}

export function deleteApplicationEmailTemplate(id: string): void {
  const saved = getSavedTemplates();
  const filtered = saved.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}
