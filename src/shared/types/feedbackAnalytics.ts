export interface FeedbackAnalytics {
  totalRequests: number;
  completedRequests: number;
  pendingRequests: number;
  overdueRequests: number;
  completionRate: number;
  averageResponseTime: number; // in hours
  responseTimeByMember: Record<string, number>;
  requestsByCandidate: Record<string, number>;
  requestsByRole: Record<string, number>;
  completionRateByMember: Record<string, { completed: number; total: number }>;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger: 'interview_scheduled' | 'interview_completed' | 'pipeline_stage_change' | 'manual';
  conditions: {
    interviewStage?: string;
    pipelineStage?: string;
    daysBeforeInterview?: number;
    daysAfterInterview?: number;
  };
  templateId: string;
  targetRoles: string[];
  createdAt: string;
  updatedAt: string;
}
