import type { InterviewAnalysis } from './aiInterview';

export type ReportStatus = 'draft' | 'in-review' | 'finalized';
export type PermissionLevel = 'view' | 'comment' | 'edit';

export interface InterviewReport {
  id: string;
  sessionId: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  status: ReportStatus;
  version: number;
  executiveSummary: string;
  analysis: InterviewAnalysis;
  recommendations: string;
  nextSteps: string;
  isShared: boolean;
  sharedWith: string[];
  permissions: ReportPermission[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  finalizedAt?: string;
  finalizedBy?: string;
}

export interface ReportPermission {
  userId: string;
  userName: string;
  level: PermissionLevel;
  grantedAt: string;
  grantedBy: string;
}

export interface ReportComment {
  id: string;
  reportId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  mentions: string[];
  parentId?: string;
  replies: ReportComment[];
  createdAt: string;
  updatedAt?: string;
  isEdited: boolean;
}

export interface ReportVersion {
  version: number;
  timestamp: string;
  userId: string;
  userName: string;
  changes: string;
  snapshot: Partial<InterviewReport>;
}

export interface ReportShare {
  id: string;
  reportId: string;
  shareToken: string;
  expiresAt?: string;
  isPublic: boolean;
  allowComments: boolean;
  createdBy: string;
  createdAt: string;
  viewCount: number;
}
