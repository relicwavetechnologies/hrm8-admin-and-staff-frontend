// Compliance & Audit Types

export type AuditAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'export'
  | 'approve'
  | 'reject'
  | 'download'
  | 'upload';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: AuditAction;
  module: string;
  recordId?: string;
  recordType?: string;
  changes?: Record<string, { old: any; new: any }>;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, any>;
}

export type PolicyCategory =
  | 'privacy'
  | 'security'
  | 'hr'
  | 'code-of-conduct'
  | 'safety'
  | 'other';

export interface CompliancePolicy {
  id: string;
  title: string;
  category: PolicyCategory;
  version: string;
  effectiveDate: string;
  expiryDate?: string;
  content: string;
  requiresAcknowledgment: boolean;
  targetAudience: 'all' | 'managers' | 'specific-roles';
  targetRoles?: string[];
  documentUrl?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyAcknowledgment {
  id: string;
  policyId: string;
  policyTitle: string;
  employeeId: string;
  employeeName: string;
  acknowledgedAt: string;
  signatureData?: string;
  ipAddress: string;
  version: string;
}

export type ComplianceReportType =
  | 'gdpr'
  | 'eeo'
  | 'flsa'
  | 'retention'
  | 'audit-summary'
  | 'policy-compliance'
  | 'custom';

export interface ComplianceReport {
  id: string;
  type: ComplianceReportType;
  title: string;
  generatedAt: string;
  generatedBy: string;
  dateRange: { start: string; end: string };
  findings: ComplianceFinding[];
  recommendations: string[];
  status: 'draft' | 'final';
  exportUrl?: string;
}

export interface ComplianceFinding {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  affectedRecords: number;
  recommendation: string;
}

export interface DataSubjectRequest {
  id: string;
  type: 'access' | 'deletion' | 'correction' | 'portability';
  employeeId: string;
  employeeName: string;
  requestDate: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  assignedTo?: string;
  completedAt?: string;
  notes?: string;
}

export interface ComplianceAlert {
  id: string;
  type: 'policy-expiry' | 'missing-acknowledgment' | 'document-expiry' | 'audit-required';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  affectedItems: number;
  createdAt: string;
  resolvedAt?: string;
}
