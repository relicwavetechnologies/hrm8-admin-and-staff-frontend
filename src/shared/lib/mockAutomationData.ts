import { AutomationRule } from '@/shared/types/feedbackAnalytics';

export const mockAutomationRules: AutomationRule[] = [
  {
    id: 'rule-1',
    name: 'Technical Interview Feedback',
    description: 'Automatically request feedback 1 day after technical interviews',
    enabled: true,
    trigger: 'interview_completed',
    conditions: {
      interviewStage: 'Technical Round',
      daysAfterInterview: 1,
    },
    templateId: 'tmpl-1',
    targetRoles: ['Senior Engineer', 'Tech Lead'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rule-2',
    name: 'Pre-Interview Reminder',
    description: 'Request feedback prep 2 days before scheduled interviews',
    enabled: true,
    trigger: 'interview_scheduled',
    conditions: {
      daysBeforeInterview: 2,
    },
    templateId: 'tmpl-5',
    targetRoles: ['Engineering Manager', 'HR Manager'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rule-3',
    name: 'Final Round Feedback',
    description: 'Request comprehensive feedback after final interviews',
    enabled: false,
    trigger: 'pipeline_stage_change',
    conditions: {
      pipelineStage: 'Final Round',
    },
    templateId: 'tmpl-2',
    targetRoles: ['CTO', 'Engineering Manager', 'HR Manager'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function initializeMockAutomationRules() {
  const RULES_KEY = 'automation_rules';
  
  if (!localStorage.getItem(RULES_KEY)) {
    localStorage.setItem(RULES_KEY, JSON.stringify(mockAutomationRules));
  }
}
