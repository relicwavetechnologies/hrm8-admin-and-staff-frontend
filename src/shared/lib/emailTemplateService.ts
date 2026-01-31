import { z } from "zod";

export interface EmailTemplate {
  id: string;
  name: string;
  type: 'application_confirmation' | 'interview_invitation' | 'offer_letter' | 'rejection' | 'stage_change' | 'reminder' | 'custom';
  subject: string;
  body: string;
  variables: string[];
  isActive: boolean;
  isDefault: boolean;
  version: number;
  versionHistory: TemplateVersion[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateVersion {
  version: number;
  subject: string;
  body: string;
  createdAt: string;
  createdBy: string;
  changeNote?: string;
}

export interface TemplateVariable {
  key: string;
  label: string;
  description: string;
  example: string;
}

// Validation schema
export const templateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  type: z.enum(['application_confirmation', 'interview_invitation', 'offer_letter', 'rejection', 'stage_change', 'reminder', 'custom']),
  subject: z.string().trim().min(1).max(300),
  body: z.string().trim().min(10).max(10000),
  isActive: z.boolean(),
  isDefault: z.boolean(),
});

// Available template variables
export const TEMPLATE_VARIABLES: TemplateVariable[] = [
  { key: 'candidateName', label: 'Candidate Name', description: 'Full name of the candidate', example: 'John Doe' },
  { key: 'candidateFirstName', label: 'First Name', description: 'First name only', example: 'John' },
  { key: 'candidateEmail', label: 'Email', description: 'Candidate email address', example: 'john@example.com' },
  { key: 'jobTitle', label: 'Job Title', description: 'Position title', example: 'Senior Software Engineer' },
  { key: 'companyName', label: 'Company Name', description: 'Your company name', example: 'Acme Corp' },
  { key: 'interviewDate', label: 'Interview Date', description: 'Scheduled interview date', example: 'January 15, 2025' },
  { key: 'interviewTime', label: 'Interview Time', description: 'Scheduled interview time', example: '2:00 PM' },
  { key: 'interviewType', label: 'Interview Type', description: 'Type of interview', example: 'Video Call' },
  { key: 'interviewDuration', label: 'Interview Duration', description: 'Expected duration', example: '60 minutes' },
  { key: 'meetingLink', label: 'Meeting Link', description: 'Video call or meeting link', example: 'https://meet.google.com/abc-defg-hij' },
  { key: 'salary', label: 'Salary', description: 'Offered salary', example: '$120,000' },
  { key: 'startDate', label: 'Start Date', description: 'Proposed start date', example: 'February 1, 2025' },
  { key: 'benefits', label: 'Benefits', description: 'Benefits summary', example: 'Health insurance, 401k, unlimited PTO' },
  { key: 'recruiterName', label: 'Recruiter Name', description: 'Your name', example: 'Jane Smith' },
  { key: 'recruiterEmail', label: 'Recruiter Email', description: 'Your email', example: 'jane@acme.com' },
  { key: 'recruiterPhone', label: 'Recruiter Phone', description: 'Your phone number', example: '+1 555-0123' },
  { key: 'applicationDate', label: 'Application Date', description: 'When they applied', example: 'January 1, 2025' },
  { key: 'currentStage', label: 'Current Stage', description: 'Current pipeline stage', example: 'Technical Interview' },
];

// Default templates
const defaultTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Application Confirmation',
    type: 'application_confirmation',
    subject: 'Application Received - {{jobTitle}} at {{companyName}}',
    body: `Dear {{candidateName}},

Thank you for your interest in the {{jobTitle}} position at {{companyName}}. We have received your application and are currently reviewing it.

Our hiring team will carefully review your qualifications and experience. If your background matches what we're looking for, we'll reach out to schedule an initial conversation.

We typically respond to applications within 5-7 business days. In the meantime, feel free to learn more about {{companyName}} and our culture on our website.

Thank you again for your interest!

Best regards,
{{recruiterName}}
{{companyName}} Recruiting Team
{{recruiterEmail}}`,
    variables: ['candidateName', 'jobTitle', 'companyName', 'recruiterName', 'recruiterEmail'],
    isActive: true,
    isDefault: true,
    version: 1,
    versionHistory: [],
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Interview Invitation',
    type: 'interview_invitation',
    subject: 'Interview Invitation - {{jobTitle}} at {{companyName}}',
    body: `Dear {{candidateName}},

Great news! We were impressed with your application for the {{jobTitle}} position and would like to invite you for an interview.

**Interview Details:**
- **Date:** {{interviewDate}}
- **Time:** {{interviewTime}}
- **Duration:** {{interviewDuration}}
- **Type:** {{interviewType}}
- **Meeting Link:** {{meetingLink}}

During this interview, we'll discuss your background, experience, and how you might contribute to our team. Please come prepared with questions about the role and {{companyName}}.

Please confirm your attendance by replying to this email. If the proposed time doesn't work for you, let us know and we'll find an alternative.

Looking forward to speaking with you!

Best regards,
{{recruiterName}}
{{recruiterEmail}}
{{recruiterPhone}}`,
    variables: ['candidateName', 'jobTitle', 'companyName', 'interviewDate', 'interviewTime', 'interviewDuration', 'interviewType', 'meetingLink', 'recruiterName', 'recruiterEmail', 'recruiterPhone'],
    isActive: true,
    isDefault: true,
    version: 1,
    versionHistory: [],
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Job Offer Letter',
    type: 'offer_letter',
    subject: 'Job Offer - {{jobTitle}} at {{companyName}}',
    body: `Dear {{candidateName}},

Congratulations! We are delighted to extend an offer for the position of {{jobTitle}} at {{companyName}}.

**Offer Details:**
- **Position:** {{jobTitle}}
- **Salary:** {{salary}}
- **Start Date:** {{startDate}}
- **Benefits:** {{benefits}}

We believe your skills and experience will be a valuable addition to our team, and we're excited about the possibility of working together.

This offer is contingent upon successful completion of a background check and any other standard pre-employment requirements.

Please review the attached formal offer letter and respond by [deadline] to accept this offer. If you have any questions or would like to discuss any aspects of the offer, please don't hesitate to reach out.

We look forward to having you join our team!

Best regards,
{{recruiterName}}
{{companyName}}
{{recruiterEmail}}
{{recruiterPhone}}`,
    variables: ['candidateName', 'jobTitle', 'companyName', 'salary', 'startDate', 'benefits', 'recruiterName', 'recruiterEmail', 'recruiterPhone'],
    isActive: true,
    isDefault: true,
    version: 1,
    versionHistory: [],
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Application Rejection',
    type: 'rejection',
    subject: 'Application Update - {{jobTitle}} at {{companyName}}',
    body: `Dear {{candidateName}},

Thank you for taking the time to apply for the {{jobTitle}} position at {{companyName}} and for your interest in joining our team.

After careful consideration of your application and qualifications, we have decided to move forward with other candidates whose experience more closely matches our current needs for this role.

This decision was difficult, as we received many strong applications. We were impressed by your background and encourage you to apply for future opportunities at {{companyName}} that align with your skills and experience.

We will keep your resume on file and may reach out if a suitable position becomes available.

Thank you again for your interest in {{companyName}}. We wish you the best in your job search and future career endeavors.

Best regards,
{{recruiterName}}
{{companyName}} Recruiting Team
{{recruiterEmail}}`,
    variables: ['candidateName', 'jobTitle', 'companyName', 'recruiterName', 'recruiterEmail'],
    isActive: true,
    isDefault: true,
    version: 1,
    versionHistory: [],
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Stage Update Notification',
    type: 'stage_change',
    subject: 'Application Status Update - {{jobTitle}}',
    body: `Dear {{candidateName}},

We wanted to update you on the status of your application for the {{jobTitle}} position at {{companyName}}.

Your application has progressed to the **{{currentStage}}** stage of our hiring process. This is an important step forward, and we're excited to continue getting to know you.

**Next Steps:**
We'll be in touch soon with more information about what to expect in this stage of the process.

If you have any questions in the meantime, please don't hesitate to reach out.

Best regards,
{{recruiterName}}
{{companyName}}
{{recruiterEmail}}`,
    variables: ['candidateName', 'jobTitle', 'companyName', 'currentStage', 'recruiterName', 'recruiterEmail'],
    isActive: true,
    isDefault: false,
    version: 1,
    versionHistory: [],
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockTemplates: EmailTemplate[] = [...defaultTemplates];

export function getEmailTemplates(filters?: {
  type?: EmailTemplate['type'];
  isActive?: boolean;
}): EmailTemplate[] {
  let filtered = [...mockTemplates];

  if (filters?.type) {
    filtered = filtered.filter((t) => t.type === filters.type);
  }
  if (filters?.isActive !== undefined) {
    filtered = filtered.filter((t) => t.isActive === filters.isActive);
  }

  return filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getTemplateById(id: string): EmailTemplate | null {
  return mockTemplates.find((t) => t.id === id) || null;
}

export function createTemplate(
  data: Omit<EmailTemplate, 'id' | 'version' | 'versionHistory' | 'createdAt' | 'updatedAt'>
): EmailTemplate {
  templateSchema.parse(data);

  const newTemplate: EmailTemplate = {
    ...data,
    id: Date.now().toString(),
    version: 1,
    versionHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockTemplates.push(newTemplate);
  return newTemplate;
}

export function updateTemplate(
  id: string,
  updates: Partial<Omit<EmailTemplate, 'id' | 'createdBy' | 'createdAt'>>,
  changeNote?: string
): EmailTemplate | null {
  const index = mockTemplates.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const current = mockTemplates[index];

  // Create version history entry if content changed
  if (updates.subject || updates.body) {
    const versionEntry: TemplateVersion = {
      version: current.version,
      subject: current.subject,
      body: current.body,
      createdAt: current.updatedAt,
      createdBy: current.createdBy,
      changeNote,
    };

    current.versionHistory.unshift(versionEntry);
    current.version += 1;
  }

  mockTemplates[index] = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  return mockTemplates[index];
}

export function deleteTemplate(id: string): boolean {
  const index = mockTemplates.findIndex((t) => t.id === id);
  if (index === -1) return false;

  mockTemplates.splice(index, 1);
  return true;
}

export function duplicateTemplate(id: string, newName: string): EmailTemplate | null {
  const template = getTemplateById(id);
  if (!template) return null;

  return createTemplate({
    ...template,
    name: newName,
    isDefault: false,
  });
}

export function revertToVersion(templateId: string, version: number): EmailTemplate | null {
  const template = getTemplateById(templateId);
  if (!template) return null;

  const versionData = template.versionHistory.find((v) => v.version === version);
  if (!versionData) return null;

  return updateTemplate(
    templateId,
    {
      subject: versionData.subject,
      body: versionData.body,
    },
    `Reverted to version ${version}`
  );
}

export function interpolateTemplate(template: string, variables: Record<string, any>): string {
  let result = template;

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value?.toString() || '');
  });

  return result;
}

export function extractVariablesFromTemplate(template: string): string[] {
  const regex = /{{(\w+)}}/g;
  const matches = [...template.matchAll(regex)];
  return [...new Set(matches.map((match) => match[1]))];
}

export function validateTemplateVariables(template: string): { valid: boolean; missingVariables: string[] } {
  const usedVariables = extractVariablesFromTemplate(template);
  const availableKeys = TEMPLATE_VARIABLES.map((v) => v.key);
  const missingVariables = usedVariables.filter((v) => !availableKeys.includes(v));

  return {
    valid: missingVariables.length === 0,
    missingVariables,
  };
}
