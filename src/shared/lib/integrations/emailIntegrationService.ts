/**
 * Email Integration Service
 * Handles Gmail and Outlook email integrations
 */

export type EmailProvider = 'gmail' | 'outlook';

export interface EmailIntegration {
  id: string;
  provider: EmailProvider;
  email: string;
  connected: boolean;
  connectedAt?: string;
  lastSync?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: 'interview' | 'offer' | 'rejection' | 'follow-up' | 'general';
}

// Mock storage for integrations
const STORAGE_KEY = 'email_integrations';

export function getEmailIntegrations(): EmailIntegration[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveEmailIntegration(integration: EmailIntegration): void {
  const integrations = getEmailIntegrations();
  const index = integrations.findIndex(i => i.provider === integration.provider);
  
  if (index >= 0) {
    integrations[index] = integration;
  } else {
    integrations.push(integration);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(integrations));
}

export function disconnectEmailIntegration(provider: EmailProvider): void {
  const integrations = getEmailIntegrations().filter(i => i.provider !== provider);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(integrations));
}

export function getEmailIntegration(provider: EmailProvider): EmailIntegration | undefined {
  return getEmailIntegrations().find(i => i.provider === provider);
}

/**
 * Initiate OAuth flow for email provider
 * In production, this would redirect to the OAuth provider
 */
export async function connectEmailProvider(provider: EmailProvider): Promise<void> {
  // Mock OAuth flow - in production this would be a real OAuth implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      const integration: EmailIntegration = {
        id: `${provider}-${Date.now()}`,
        provider,
        email: `user@${provider === 'gmail' ? 'gmail.com' : 'outlook.com'}`,
        connected: true,
        connectedAt: new Date().toISOString(),
        lastSync: new Date().toISOString(),
      };
      
      saveEmailIntegration(integration);
      resolve();
    }, 1500);
  });
}

/**
 * Send email using connected provider
 */
export async function sendEmail(
  provider: EmailProvider,
  to: string,
  subject: string,
  body: string,
  cc?: string[],
  bcc?: string[]
): Promise<void> {
  const integration = getEmailIntegration(provider);
  
  if (!integration || !integration.connected) {
    throw new Error(`${provider} is not connected`);
  }

  // Mock sending - in production this would use the provider's API
  console.log('Sending email via', provider, {
    to,
    subject,
    body,
    cc,
    bcc,
  });

  return new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });
}

/**
 * Sync emails from provider
 */
export async function syncEmails(provider: EmailProvider): Promise<void> {
  const integration = getEmailIntegration(provider);
  
  if (!integration || !integration.connected) {
    throw new Error(`${provider} is not connected`);
  }

  // Mock sync - in production this would fetch emails from the provider
  integration.lastSync = new Date().toISOString();
  saveEmailIntegration(integration);

  return new Promise((resolve) => {
    setTimeout(resolve, 2000);
  });
}

/**
 * Get email templates
 */
export function getEmailTemplates(): EmailTemplate[] {
  return [
    {
      id: '1',
      name: 'Interview Invitation',
      subject: 'Interview Invitation - {{position}}',
      body: 'Dear {{candidateName}},\n\nWe are pleased to invite you for an interview for the {{position}} position.\n\nInterview Details:\nDate: {{date}}\nTime: {{time}}\nLocation: {{location}}\n\nPlease confirm your availability.\n\nBest regards,\n{{recruiterName}}',
      category: 'interview',
    },
    {
      id: '2',
      name: 'Job Offer',
      subject: 'Job Offer - {{position}}',
      body: 'Dear {{candidateName}},\n\nCongratulations! We are delighted to offer you the position of {{position}}.\n\nPlease review the attached offer letter and let us know if you have any questions.\n\nBest regards,\n{{recruiterName}}',
      category: 'offer',
    },
    {
      id: '3',
      name: 'Application Status Update',
      subject: 'Application Update - {{position}}',
      body: 'Dear {{candidateName}},\n\nThank you for your interest in the {{position}} position. After careful consideration, we have decided to move forward with other candidates.\n\nWe appreciate your time and wish you the best in your job search.\n\nBest regards,\n{{recruiterName}}',
      category: 'rejection',
    },
    {
      id: '4',
      name: 'Follow-up',
      subject: 'Following Up - {{position}}',
      body: 'Dear {{candidateName}},\n\nI wanted to follow up regarding your application for the {{position}} position.\n\n{{customMessage}}\n\nPlease feel free to reach out if you have any questions.\n\nBest regards,\n{{recruiterName}}',
      category: 'follow-up',
    },
  ];
}
