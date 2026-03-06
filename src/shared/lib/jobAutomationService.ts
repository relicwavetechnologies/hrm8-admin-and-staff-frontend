import { Job } from "@/shared/types/job";

export interface AutomationRule {
  id: string;
  name: string;
  trigger: AutomationTrigger;
  action: AutomationAction;
  isActive: boolean;
  createdAt: Date;
}

export type AutomationTrigger = 
  | { type: "inactivity_days"; days: number }
  | { type: "applicant_count"; count: number }
  | { type: "closing_soon"; days: number }
  | { type: "offer_accepted" }
  | { type: "scheduled_date"; date: Date };

export type AutomationAction =
  | { type: "close_job" }
  | { type: "change_status"; status: string }
  | { type: "notify"; recipients: string[]; message: string }
  | { type: "archive" }
  | { type: "publish" };

const automationRules: AutomationRule[] = [
  {
    id: "1",
    name: "Auto-close after 60 days of inactivity",
    trigger: { type: "inactivity_days", days: 60 },
    action: { type: "close_job" },
    isActive: true,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
  },
  {
    id: "2",
    name: "Notify when 50+ applicants",
    trigger: { type: "applicant_count", count: 50 },
    action: { 
      type: "notify", 
      recipients: ["hiring-manager@company.com"],
      message: "Job has reached 50 applicants. Consider reviewing candidates."
    },
    isActive: true,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
  },
  {
    id: "3",
    name: "Alert 3 days before closing",
    trigger: { type: "closing_soon", days: 3 },
    action: { 
      type: "notify", 
      recipients: ["team@company.com"],
      message: "Job closing in 3 days. Last chance to review!"
    },
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
];

export interface ScheduledJob {
  id: string;
  jobId: string;
  scheduledDate: Date;
  action: "publish" | "close" | "reminder";
  status: "pending" | "completed" | "cancelled";
  createdAt: Date;
}

const scheduledJobs: ScheduledJob[] = [
  {
    id: "s1",
    jobId: "1",
    scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    action: "close",
    status: "pending",
    createdAt: new Date(),
  },
];

export function getAutomationRules(): AutomationRule[] {
  return [...automationRules];
}

export function createAutomationRule(rule: Omit<AutomationRule, "id" | "createdAt">): AutomationRule {
  const newRule: AutomationRule = {
    ...rule,
    id: Date.now().toString(),
    createdAt: new Date(),
  };
  
  automationRules.push(newRule);
  return newRule;
}

export function toggleAutomationRule(id: string): boolean {
  const rule = automationRules.find(r => r.id === id);
  if (!rule) return false;
  
  rule.isActive = !rule.isActive;
  return true;
}

export function deleteAutomationRule(id: string): boolean {
  const index = automationRules.findIndex(r => r.id === id);
  if (index === -1) return false;
  
  automationRules.splice(index, 1);
  return true;
}

export function getScheduledJobs(jobId?: string): ScheduledJob[] {
  if (jobId) {
    return scheduledJobs.filter(s => s.jobId === jobId);
  }
  return [...scheduledJobs];
}

export function scheduleJob(jobId: string, date: Date, action: ScheduledJob["action"]): ScheduledJob {
  const scheduled: ScheduledJob = {
    id: Date.now().toString(),
    jobId,
    scheduledDate: date,
    action,
    status: "pending",
    createdAt: new Date(),
  };
  
  scheduledJobs.push(scheduled);
  return scheduled;
}

export function cancelScheduledJob(id: string): boolean {
  const scheduled = scheduledJobs.find(s => s.id === id);
  if (!scheduled) return false;
  
  scheduled.status = "cancelled";
  return true;
}

// Simulate checking if automation rules should trigger
export function checkAutomationTriggers(job: Job): AutomationRule[] {
  const triggeredRules: AutomationRule[] = [];
  
  for (const rule of automationRules) {
    if (!rule.isActive) continue;
    
    let shouldTrigger = false;
    
    switch (rule.trigger.type) {
      case "applicant_count":
        shouldTrigger = job.applicantsCount >= rule.trigger.count;
        break;
      case "inactivity_days":
        const postingDate = typeof job.postingDate === 'string' ? new Date(job.postingDate) : job.postingDate;
        const daysSinceUpdate = Math.floor((Date.now() - postingDate.getTime()) / (1000 * 60 * 60 * 24));
        shouldTrigger = daysSinceUpdate >= rule.trigger.days;
        break;
      case "closing_soon":
        if (job.closeDate) {
          const closeDate = typeof job.closeDate === 'string' ? new Date(job.closeDate) : job.closeDate;
          const daysUntilClose = Math.floor((closeDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          shouldTrigger = daysUntilClose <= rule.trigger.days;
        }
        break;
    }
    
    if (shouldTrigger) {
      triggeredRules.push(rule);
    }
  }
  
  return triggeredRules;
}
