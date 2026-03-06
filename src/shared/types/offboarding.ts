export type OffboardingStatus = 'initiated' | 'in-progress' | 'completed' | 'cancelled';
export type SeparationType = 'resignation' | 'termination' | 'retirement' | 'contract-end' | 'mutual';
export type ClearanceStatus = 'pending' | 'approved' | 'rejected';

export interface OffboardingWorkflow {
  id: string;
  employeeId: string;
  employeeName: string;
  jobTitle: string;
  department: string;
  separationType: SeparationType;
  lastWorkingDay: string;
  noticeDate: string;
  noticePeriodDays: number;
  status: OffboardingStatus;
  reason?: string;
  rehireEligible: boolean;
  exitInterviewScheduled: boolean;
  exitInterviewDate?: string;
  exitInterviewCompleted: boolean;
  clearanceItems: ClearanceItem[];
  finalSettlementAmount?: number;
  finalSettlementPaid: boolean;
  createdBy: string;
  createdAt: string;
  completedAt?: string;
  updatedAt: string;
}

export interface ClearanceItem {
  id: string;
  category: 'equipment' | 'access' | 'documents' | 'finance' | 'hr';
  item: string;
  description: string;
  responsiblePerson: string;
  status: ClearanceStatus;
  completedAt?: string;
  notes?: string;
}

export interface ExitInterview {
  id: string;
  offboardingWorkflowId: string;
  employeeId: string;
  employeeName: string;
  interviewDate: string;
  interviewedBy: string;
  reasonForLeaving: string;
  satisfactionLevel: number; // 1-5
  wouldRecommend: boolean;
  managementRating: number;
  workEnvironmentRating: number;
  compensationRating: number;
  careerGrowthRating: number;
  suggestions: string;
  concerns: string;
  feedback: string;
  createdAt: string;
}

export interface OffboardingStats {
  totalOffboarding: number;
  activeOffboarding: number;
  completedThisMonth: number;
  averageNoticePeriod: number;
  rehireEligibleRate: number;
  topSeparationReasons: { reason: string; count: number }[];
}
