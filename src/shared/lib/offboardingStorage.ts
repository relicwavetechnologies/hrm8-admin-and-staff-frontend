import type { OffboardingWorkflow, ExitInterview, OffboardingStats } from '@/shared/types/offboarding';
import { mockOffboardingWorkflows } from '@/shared/data/mockOffboardingData';

const WORKFLOWS_KEY = 'offboarding_workflows';
const INTERVIEWS_KEY = 'exit_interviews';

function initializeData() {
  if (!localStorage.getItem(WORKFLOWS_KEY)) {
    localStorage.setItem(WORKFLOWS_KEY, JSON.stringify(mockOffboardingWorkflows));
  }
}

export function getOffboardingWorkflows(): OffboardingWorkflow[] {
  initializeData();
  const stored = localStorage.getItem(WORKFLOWS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveOffboardingWorkflow(workflow: Omit<OffboardingWorkflow, 'id' | 'createdAt' | 'updatedAt'>): OffboardingWorkflow {
  const workflows = getOffboardingWorkflows();
  const newWorkflow: OffboardingWorkflow = {
    ...workflow,
    id: `offboarding-${Date.now()}`,

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  workflows.push(newWorkflow);
  localStorage.setItem(WORKFLOWS_KEY, JSON.stringify(workflows));
  return newWorkflow;
}

export function updateOffboardingWorkflow(id: string, updates: Partial<OffboardingWorkflow>): OffboardingWorkflow | null {
  const workflows = getOffboardingWorkflows();
  const index = workflows.findIndex(w => w.id === id);
  if (index === -1) return null;

  workflows[index] = {
    ...workflows[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(WORKFLOWS_KEY, JSON.stringify(workflows));
  return workflows[index];
}

export function getExitInterviews(): ExitInterview[] {
  const stored = localStorage.getItem(INTERVIEWS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveExitInterview(interview: Omit<ExitInterview, 'id' | 'createdAt'>): ExitInterview {
  const interviews = getExitInterviews();
  const newInterview: ExitInterview = {
    ...interview,
    id: `interview-${Date.now()}`,

    createdAt: new Date().toISOString(),
  };
  interviews.push(newInterview);
  localStorage.setItem(INTERVIEWS_KEY, JSON.stringify(interviews));
  return newInterview;
}

export function calculateOffboardingStats(): OffboardingStats {
  const workflows = getOffboardingWorkflows();
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const activeOffboarding = workflows.filter(w => w.status === 'in-progress').length;
  const completedThisMonth = workflows.filter(w => {
    if (!w.completedAt) return false;
    const completedDate = new Date(w.completedAt);
    return completedDate.getMonth() === thisMonth && completedDate.getFullYear() === thisYear;
  }).length;

  const rehireEligible = workflows.filter(w => w.rehireEligible).length;
  const rehireEligibleRate = workflows.length > 0 ? (rehireEligible / workflows.length) * 100 : 0;

  const noticePeriods = workflows.map(w => w.noticePeriodDays).filter(d => d > 0);
  const averageNoticePeriod = noticePeriods.length > 0
    ? noticePeriods.reduce((a, b) => a + b, 0) / noticePeriods.length
    : 0;

  const reasonCounts: Record<string, number> = {};
  workflows.forEach(w => {
    reasonCounts[w.separationType] = (reasonCounts[w.separationType] || 0) + 1;
  });

  const topSeparationReasons = Object.entries(reasonCounts)
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalOffboarding: workflows.length,
    activeOffboarding,
    completedThisMonth,
    averageNoticePeriod,
    rehireEligibleRate,
    topSeparationReasons,
  };
}
