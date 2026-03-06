// Employee Relations Case Management Types

export type ERCaseType =
  | 'grievance'
  | 'complaint'
  | 'disciplinary'
  | 'investigation'
  | 'mediation';

export type ERCaseCategory =
  | 'harassment'
  | 'discrimination'
  | 'policy-violation'
  | 'performance'
  | 'conduct'
  | 'workplace-safety'
  | 'other';

export type CasePriority = 'low' | 'medium' | 'high' | 'urgent';

export type CaseStatus =
  | 'open'
  | 'investigating'
  | 'pending-action'
  | 'resolved'
  | 'closed';

export interface ERCase {
  id: string;
  caseNumber: string;
  type: ERCaseType;
  category: ERCaseCategory;
  priority: CasePriority;
  status: CaseStatus;
  confidential: boolean;
  reportedBy?: string;
  reportedByName?: string;
  affectedEmployees: string[];
  affectedEmployeeNames?: string[];
  description: string;
  openedDate: string;
  closedDate?: string;
  assignedTo: string[];
  assignedToNames?: string[];
  investigationNotes: InvestigationNote[];
  actionPlan?: ActionPlan;
  outcome?: CaseOutcome;
  accessControlList: string[];
  createdAt: string;
  updatedAt: string;
}

export type InvestigationNoteType =
  | 'interview'
  | 'evidence'
  | 'observation'
  | 'general';

export interface InvestigationNote {
  id: string;
  caseId: string;
  author: string;
  authorName: string;
  noteType: InvestigationNoteType;
  content: string;
  attachments?: string[];
  timestamp: string;
  isConfidential: boolean;
}

export interface ActionPlan {
  id: string;
  caseId: string;
  actions: CaseAction[];
  targetCompletionDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CaseAction {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  completedDate?: string;
  notes?: string;
}

export interface CaseOutcome {
  id: string;
  caseId: string;
  decision: string;
  disciplinaryAction?: DisciplinaryAction;
  correctiveActions: string[];
  followUpRequired: boolean;
  followUpDate?: string;
  documentUrl?: string;
  recordedBy: string;
  recordedAt: string;
}

export interface DisciplinaryAction {
  type: 'verbal-warning' | 'written-warning' | 'suspension' | 'termination' | 'none';
  effectiveDate: string;
  expiryDate?: string;
  details: string;
}

export interface ERCaseStats {
  total: number;
  open: number;
  investigating: number;
  resolved: number;
  byType: Record<ERCaseType, number>;
  byCategory: Record<ERCaseCategory, number>;
  avgResolutionTime: number;
}
