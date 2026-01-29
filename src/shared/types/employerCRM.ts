/**
 * CRM-specific types for Employer Management
 */

export interface EmployerContact {
  id: string;
  employerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  title?: string;
  department?: string;
  isPrimary: boolean;
  roles: ContactRole[];
  linkedInUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ContactRole = 
  | 'decision-maker' 
  | 'technical' 
  | 'billing' 
  | 'hr' 
  | 'recruiter'
  | 'other';

export interface EmployerNote {
  id: string;
  employerId: string;
  authorId: string;
  authorName: string;
  category: NoteCategory;
  content: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export type NoteCategory = 
  | 'general' 
  | 'meeting' 
  | 'call' 
  | 'email' 
  | 'issue'
  | 'opportunity';

export interface EmployerActivity {
  id: string;
  employerId: string;
  type: ActivityType;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  userId?: string;
  userName?: string;
  createdAt: string;
}

export type ActivityType =
  | 'account-created'
  | 'account-updated'
  | 'contact-added'
  | 'contact-updated'
  | 'contact-removed'
  | 'job-posted'
  | 'subscription-changed'
  | 'subscription-upgraded'
  | 'subscription-downgraded'
  | 'invoice-sent'
  | 'invoice-paid'
  | 'invoice-overdue'
  | 'note-added'
  | 'call-logged'
  | 'meeting-scheduled'
  | 'email-sent'
  | 'document-uploaded'
  | 'status-changed';

export interface EmployerDocument {
  id: string;
  employerId: string;
  type: DocumentType;
  name: string;
  fileName: string;
  fileSize: number;
  fileUrl: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  notes?: string;
}

export type DocumentType = 
  | 'contract' 
  | 'proposal' 
  | 'agreement' 
  | 'invoice' 
  | 'msa'
  | 'other';

export interface EmployerSubscriptionHistory {
  id: string;
  employerId: string;
  fromTier: string;
  toTier: string;
  changeType: 'upgrade' | 'downgrade' | 'initial' | 'cancelled';
  reason?: string;
  changedBy: string;
  changedByName: string;
  changedAt: string;
  effectiveDate: string;
}

export interface EmployerOpportunity {
  id: string;
  employerId: string;
  title: string;
  stage: OpportunityStage;
  value: number;
  probability: number;
  expectedCloseDate: string;
  ownerId: string;
  ownerName: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type OpportunityStage =
  | 'lead'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'closed-won'
  | 'closed-lost';

export interface EmployerTask {
  id: string;
  employerId: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  assignedTo: string;
  assignedToName: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  completedAt?: string;
}

export interface EmployerMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  averageJobValue: number;
  lifetimeValue: number;
  totalJobs: number;
  activeJobs: number;
  totalUsers: number;
  activeUsers: number;
  outstandingBalance: number;
  creditLimit: number;
  daysAsCustomer: number;
  lastActivityDate: string;
}

export interface EmployerSettings {
  employerId: string;
  accountManagerId?: string;
  accountManagerName?: string;
  primaryRecruiterId?: string;
  primaryRecruiterName?: string;
  territory?: string;
  region?: string;
  tags: string[];
  notificationSettings: NotificationSettings;
  updatedAt: string;
}

export interface NotificationSettings {
  emailOnJobPosted: boolean;
  emailOnInvoiceDue: boolean;
  emailOnSubscriptionChange: boolean;
  emailOnLowBalance: boolean;
}
