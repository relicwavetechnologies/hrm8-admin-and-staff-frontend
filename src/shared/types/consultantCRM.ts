export type CRMActivityType = 
  | 'placement' 
  | 'meeting' 
  | 'call' 
  | 'email' 
  | 'note' 
  | 'commission'
  | 'assignment'
  | 'status_change';

export interface CRMActivity {
  id: string;
  consultantId: string;
  type: CRMActivityType;
  title: string;
  description: string;
  timestamp: string;
  relatedEntityType?: 'employer' | 'job' | 'candidate';
  relatedEntityId?: string;
  performedBy: string;
  performedByName?: string;
  metadata?: Record<string, any>;
}

export interface CRMNote {
  id: string;
  consultantId: string;
  content: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
  updatedAt?: string;
  isPinned?: boolean;
  attachments?: string[];
}

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface CRMTask {
  id: string;
  consultantId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt?: string;
  assignedTo: string;
  assignedToName?: string;
  assignedBy: string;
  assignedByName?: string;
  relatedEntityType?: 'employer' | 'job' | 'candidate';
  relatedEntityId?: string;
}

// Legacy type names for compatibility with existing storage modules
export type ConsultantActivityType =
  | 'profile-updated'
  | 'assignment-added'
  | 'assignment-removed'
  | 'task-created'
  | 'task-completed'
  | 'note-added'
  | 'document-uploaded'
  | 'status-changed'
  | 'commission-earned'
  | 'commission-paid'
  | 'placement-completed'
  | 'meeting-scheduled';

export interface ConsultantActivity {
  id: string;
  consultantId: string;
  type: ConsultantActivityType;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  userId?: string;
  userName?: string;
  createdAt: string;
}

export interface ConsultantNote {
  id: string;
  consultantId: string;
  category?: 'general' | 'performance' | 'issue' | 'achievement';
  content: string;
  authorId: string;
  authorName: string;
  isPinned?: boolean;
  isPrivate?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConsultantTask {
  id: string;
  consultantId: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  dueDate?: string;
  completedAt?: string;
  assignedTo?: string;
  assignedToName?: string;
  assignedBy?: string;
  createdAt: string;
}

export type ConsultantDocumentType =
  | 'contract'
  | 'resume'
  | 'certification'
  | 'performance-review'
  | 'commission-statement'
  | 'tax-document'
  | 'other';

export interface ConsultantDocument {
  id: string;
  consultantId: string;
  name: string;
  type: ConsultantDocumentType;
  fileName: string;
  fileSize: number;
  fileUrl: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  expiryDate?: string;
  tags?: string[];
}

export type AssignmentStatus = 'active' | 'completed' | 'cancelled';

export interface ConsultantAssignment {
  id: string;
  consultantId: string;
  entityType: 'employer' | 'job';
  entityId: string;
  entityName: string;
  role?: string;
  isPrimary?: boolean;
  status: AssignmentStatus;
  assignedAt: string;
  assignedBy?: string;
  completedAt?: string;
}

export interface ConsultantSettings {
  consultantId: string;
  maxEmployers: number;
  maxJobs: number;
  autoAssign: boolean;
  commissionStructure: 'percentage' | 'flat' | 'tiered' | 'custom';
  defaultCommissionRate?: number;
  customCommissionRates?: Record<string, number>;
  emailNotifications: boolean;
  smsNotifications: boolean;
  notifyOnAssignment: boolean;
  notifyOnCommission: boolean;
  notifyOnPerformanceAlert: boolean;
  canViewAllCandidates: boolean;
  canViewAllEmployers: boolean;
  canManageOwnJobs: boolean;
  restrictedAccess: boolean;
  tags: string[];
  updatedAt: string;
}
