export type DisputeStatus = 'open' | 'under-review' | 'resolved' | 'rejected' | 'escalated';
export type DisputeResolution = 'approved' | 'denied' | 'partial-approval' | 'escalated';
export type DisputePriority = 'low' | 'medium' | 'high' | 'critical';

export interface DisputeEvidence {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
  uploadedBy: string;
  description?: string;
}

export interface DisputeComment {
  id: string;
  userId: string;
  userName: string;
  comment: string;
  createdAt: string;
  isInternal: boolean;
}

export interface DisputeAuditEntry {
  id: string;
  action: string;
  userId: string;
  userName: string;
  timestamp: string;
  details: Record<string, any>;
  previousValue?: any;
  newValue?: any;
}

export interface CommissionDispute {
  id: string;
  commissionId: string;
  consultantId: string;
  consultantName: string;
  
  // Dispute Details
  reason: string;
  description: string;
  disputedAmount: number;
  expectedAmount: number;
  status: DisputeStatus;
  priority: DisputePriority;
  
  // Filing Info
  filedBy: string;
  filedByName: string;
  filedDate: string;
  
  // Assignment
  assignedTo?: string;
  assignedToName?: string;
  assignedDate?: string;
  
  // Resolution
  resolution?: DisputeResolution;
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedByName?: string;
  resolvedDate?: string;
  approvedAmount?: number;
  
  // Evidence & Communication
  evidence: DisputeEvidence[];
  comments: DisputeComment[];
  auditTrail: DisputeAuditEntry[];
  
  // Escalation
  escalatedTo?: string;
  escalatedToName?: string;
  escalatedDate?: string;
  escalationReason?: string;
  
  // Deadlines
  dueDate?: string;
  slaBreached: boolean;
  
  // Metadata
  tags?: string[];
  relatedDisputes?: string[];
  createdAt: string;
  updatedAt: string;
}
