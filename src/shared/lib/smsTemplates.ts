export interface SmsTemplate {
  id: string;
  name: string;
  message: string;
  category: 'interview' | 'status' | 'document' | 'other';
}

// SMS templates with variable placeholders
export const smsTemplates: SmsTemplate[] = [
  {
    id: 'interview-reminder',
    name: 'Interview Reminder',
    message: 'Hi {candidateName}, this is a reminder about your interview for {jobTitle} at {companyName} tomorrow. Looking forward to speaking with you!',
    category: 'interview',
  },
  {
    id: 'interview-scheduled',
    name: 'Interview Scheduled',
    message: 'Hi {candidateName}, your interview for {jobTitle} at {companyName} has been scheduled. Check your email for details.',
    category: 'interview',
  },
  {
    id: 'status-update',
    name: 'Status Update',
    message: 'Hi {candidateName}, your application for {jobTitle} at {companyName} has been updated. Please check your email for more details.',
    category: 'status',
  },
  {
    id: 'application-received',
    name: 'Application Received',
    message: 'Hi {candidateName}, we received your application for {jobTitle} at {companyName}. We\'ll review it and get back to you soon!',
    category: 'status',
  },
  {
    id: 'document-request',
    name: 'Document Request',
    message: 'Hi {candidateName}, we need additional documents for your {jobTitle} application at {companyName}. Please check your email for details.',
    category: 'document',
  },
  {
    id: 'offer-extended',
    name: 'Offer Extended',
    message: 'Congratulations {candidateName}! We\'re excited to extend an offer for {jobTitle} at {companyName}. Check your email for the offer letter.',
    category: 'status',
  },
];

// Replace variables in template message
export function replaceSmsVariables(
  template: string,
  variables: {
    candidateName?: string;
    jobTitle?: string;
    companyName?: string;
    [key: string]: string | undefined;
  }
): string {
  let message = template;

  Object.entries(variables).forEach(([key, value]) => {
    if (value) {
      const regex = new RegExp(`{${key}}`, 'g');
      message = message.replace(regex, value);
    }
  });

  return message;
}

// Calculate SMS segments (160 chars per segment)
export function calculateSmsSegments(message: string): number {
  if (!message) return 0;

  const length = message.length;

  // Single segment: 160 chars
  if (length <= 160) return 1;

  // Multi-segment: 153 chars per segment (7 chars used for concatenation)
  return Math.ceil(length / 153);
}

// Get category color for badges
export function getCategoryColor(category: SmsTemplate['category']): string {
  switch (category) {
    case 'interview':
      return 'bg-blue-500/10 text-blue-700 border-blue-200';
    case 'status':
      return 'bg-green-500/10 text-green-700 border-green-200';
    case 'document':
      return 'bg-orange-500/10 text-orange-700 border-orange-200';
    case 'other':
      return 'bg-gray-500/10 text-gray-700 border-gray-200';
    default:
      return 'bg-gray-500/10 text-gray-700 border-gray-200';
  }
}
