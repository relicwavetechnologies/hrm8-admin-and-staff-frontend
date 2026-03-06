/**
 * Mock data for Super Admin platform management dashboard
 */

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  employerId: string;
  employerName: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'waiting-response' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'technical' | 'billing' | 'feature-request' | 'bug' | 'general';
  assignedTo?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  responseTime?: number; // in minutes
}

export interface PlatformMetrics {
  totalActiveUsers: number;
  totalEmployers: number;
  newSignupsThisMonth: number;
  monthlyRecurringRevenue: number;
  revenueGrowth: number; // percentage
  platformUptime: number; // percentage
  avgResponseTime: number; // in hours
  customerSatisfaction: number; // out of 5
  churnRate: number; // percentage
}

export interface RecruitmentServiceQueue {
  id: string;
  employerId: string;
  employerName: string;
  serviceType: 'shortlisting' | 'full-service' | 'executive-search' | 'rpo';
  jobTitle: string;
  status: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  priority: 'low' | 'medium' | 'high';
  assignedConsultant?: string;
  startDate: string;
  dueDate: string;
  progress: number; // percentage
}

export interface SystemIntegration {
  id: string;
  name: string;
  type: 'payroll' | 'calendar' | 'email' | 'storage' | 'hr-system' | 'other';
  status: 'active' | 'inactive' | 'error' | 'maintenance';
  connectedEmployers: number;
  lastSync?: string;
  errorCount?: number;
}

export interface PlatformActivity {
  id: string;
  type: 'user-signup' | 'job-posted' | 'service-requested' | 'payment-received' | 'support-ticket' | 'integration-connected';
  description: string;
  employerName?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Mock Support Tickets
export const mockSupportTickets: SupportTicket[] = [
  {
    id: 'ticket-1',
    ticketNumber: 'TKT-1001',
    employerId: 'emp-1',
    employerName: 'TechCorp Solutions',
    subject: 'Unable to access payroll module',
    description: 'Getting 403 error when trying to access the payroll section',
    status: 'open',
    priority: 'high',
    category: 'technical',
    createdBy: 'john.doe@techcorp.com',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ticket-2',
    ticketNumber: 'TKT-1002',
    employerId: 'emp-2',
    employerName: 'Global Innovations Inc',
    subject: 'Billing inquiry for last month',
    description: 'Need clarification on charges for additional users',
    status: 'in-progress',
    priority: 'medium',
    category: 'billing',
    assignedTo: 'Sarah Admin',
    createdBy: 'finance@globalinnovations.com',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    responseTime: 120,
  },
  {
    id: 'ticket-3',
    ticketNumber: 'TKT-1003',
    employerId: 'emp-3',
    employerName: 'StartupHub Co',
    subject: 'Feature Request: Bulk candidate import',
    description: 'Would like ability to import candidates via CSV with custom fields',
    status: 'open',
    priority: 'low',
    category: 'feature-request',
    createdBy: 'hr@startuphub.com',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ticket-4',
    ticketNumber: 'TKT-1004',
    employerId: 'emp-4',
    employerName: 'Enterprise Solutions Ltd',
    subject: 'API Integration not syncing',
    description: 'Calendar integration stopped working since yesterday',
    status: 'open',
    priority: 'critical',
    category: 'bug',
    createdBy: 'admin@enterprisesol.com',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
];

// Mock Platform Metrics
export const mockPlatformMetrics: PlatformMetrics = {
  totalActiveUsers: 2847,
  totalEmployers: 156,
  newSignupsThisMonth: 23,
  monthlyRecurringRevenue: 142500,
  revenueGrowth: 12.5,
  platformUptime: 99.8,
  avgResponseTime: 2.4,
  customerSatisfaction: 4.6,
  churnRate: 2.1,
};

// Mock Recruitment Service Queue
export const mockRecruitmentQueue: RecruitmentServiceQueue[] = [
  {
    id: 'service-1',
    employerId: 'emp-5',
    employerName: 'FinTech Ventures',
    serviceType: 'full-service',
    jobTitle: 'Senior Software Engineer',
    status: 'pending',
    priority: 'high',
    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 0,
  },
  {
    id: 'service-2',
    employerId: 'emp-6',
    employerName: 'Healthcare Plus',
    serviceType: 'executive-search',
    jobTitle: 'Chief Technology Officer',
    status: 'in-progress',
    priority: 'high',
    assignedConsultant: 'Michael Chen',
    startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 45,
  },
  {
    id: 'service-3',
    employerId: 'emp-7',
    employerName: 'Retail Excellence',
    serviceType: 'shortlisting',
    jobTitle: 'Marketing Manager',
    status: 'in-progress',
    priority: 'medium',
    assignedConsultant: 'Sarah Johnson',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 70,
  },
];

// Mock System Integrations
export const mockSystemIntegrations: SystemIntegration[] = [
  {
    id: 'int-1',
    name: 'Google Calendar',
    type: 'calendar',
    status: 'active',
    connectedEmployers: 134,
    lastSync: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'int-2',
    name: 'Stripe Payments',
    type: 'payroll',
    status: 'active',
    connectedEmployers: 156,
    lastSync: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'int-3',
    name: 'Microsoft Teams',
    type: 'email',
    status: 'active',
    connectedEmployers: 89,
    lastSync: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 'int-4',
    name: 'AWS S3 Storage',
    type: 'storage',
    status: 'active',
    connectedEmployers: 156,
    lastSync: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: 'int-5',
    name: 'Workday Connector',
    type: 'hr-system',
    status: 'maintenance',
    connectedEmployers: 12,
    lastSync: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
  },
];

// Mock Platform Activity
export const mockPlatformActivity: PlatformActivity[] = [
  {
    id: 'act-1',
    type: 'job-posted',
    description: 'New job posted: Senior Product Manager',
    employerName: 'TechCorp Solutions',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'act-2',
    type: 'user-signup',
    description: 'New employer signed up',
    employerName: 'Digital Marketing Pro',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'act-3',
    type: 'service-requested',
    description: 'Full-service recruitment requested for CTO position',
    employerName: 'Healthcare Plus',
    timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
  },
  {
    id: 'act-4',
    type: 'payment-received',
    description: 'Monthly subscription payment received - $950',
    employerName: 'Enterprise Solutions Ltd',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'act-5',
    type: 'support-ticket',
    description: 'New support ticket opened - API Integration issue',
    employerName: 'Enterprise Solutions Ltd',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'act-6',
    type: 'integration-connected',
    description: 'Connected Google Calendar integration',
    employerName: 'StartupHub Co',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'act-7',
    type: 'job-posted',
    description: 'New job posted: Data Analyst',
    employerName: 'FinTech Ventures',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'act-8',
    type: 'user-signup',
    description: 'New employer signed up',
    employerName: 'Green Energy Corp',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
];

export function getPlatformMetrics(): PlatformMetrics {
  return mockPlatformMetrics;
}

export function getSupportTickets(): SupportTicket[] {
  return mockSupportTickets;
}

export function getRecruitmentQueue(): RecruitmentServiceQueue[] {
  return mockRecruitmentQueue;
}

export function getSystemIntegrations(): SystemIntegration[] {
  return mockSystemIntegrations;
}

export function getPlatformActivity(): PlatformActivity[] {
  return mockPlatformActivity;
}

export function getTicketsByStatus(status: SupportTicket['status']): SupportTicket[] {
  return mockSupportTickets.filter(ticket => ticket.status === status);
}

export function getTicketsByPriority(priority: SupportTicket['priority']): SupportTicket[] {
  return mockSupportTickets.filter(ticket => ticket.priority === priority);
}

export function getServicesByStatus(status: RecruitmentServiceQueue['status']): RecruitmentServiceQueue[] {
  return mockRecruitmentQueue.filter(service => service.status === status);
}
