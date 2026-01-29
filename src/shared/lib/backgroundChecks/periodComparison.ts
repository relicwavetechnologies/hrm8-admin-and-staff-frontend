import { getBackgroundChecks } from '@/shared/lib/mockBackgroundCheckStorage';
import type { BackgroundCheck } from '@/shared/types/backgroundCheck';

export interface PeriodMetrics {
  totalChecks: number;
  completed: number;
  active: number;
  completionRate: number;
  avgCompletionTime: number;
  issuesFound: number;
}

export interface PeriodComparison {
  current: PeriodMetrics;
  previous: PeriodMetrics;
  changes: {
    totalChecks: number;
    totalChecksPercent: number;
    completed: number;
    completedPercent: number;
    completionRate: number;
    avgCompletionTime: number;
    avgCompletionTimePercent: number;
  };
}

function calculateMetrics(checks: BackgroundCheck[]): PeriodMetrics {
  const completed = checks.filter(c => c.status === 'completed');
  const active = checks.filter(c => ['pending-consent', 'in-progress'].includes(c.status));
  const issuesFound = checks.filter(c => c.status === 'issues-found');
  
  const completionRate = checks.length > 0 ? (completed.length / checks.length) * 100 : 0;
  
  const avgCompletionTime = completed.length > 0
    ? completed.reduce((sum, c) => {
        const initiated = new Date(c.initiatedDate);
        const completedDate = new Date(c.completedDate!);
        return sum + Math.floor((completedDate.getTime() - initiated.getTime()) / (1000 * 60 * 60 * 24));
      }, 0) / completed.length
    : 0;
  
  return {
    totalChecks: checks.length,
    completed: completed.length,
    active: active.length,
    completionRate,
    avgCompletionTime: Math.round(avgCompletionTime),
    issuesFound: issuesFound.length,
  };
}

export function getPeriodComparison(
  currentFrom: Date,
  currentTo: Date
): PeriodComparison {
  const checks = getBackgroundChecks();
  
  // Calculate period duration in days
  const periodDuration = Math.floor((currentTo.getTime() - currentFrom.getTime()) / (1000 * 60 * 60 * 24));
  
  // Previous period
  const previousFrom = new Date(currentFrom.getTime() - periodDuration * 24 * 60 * 60 * 1000);
  const previousTo = new Date(currentFrom.getTime() - 1); // Day before current period starts
  
  // Filter checks for each period
  const currentChecks = checks.filter(c => {
    const date = new Date(c.initiatedDate);
    return date >= currentFrom && date <= currentTo;
  });
  
  const previousChecks = checks.filter(c => {
    const date = new Date(c.initiatedDate);
    return date >= previousFrom && date <= previousTo;
  });
  
  const current = calculateMetrics(currentChecks);
  const previous = calculateMetrics(previousChecks);
  
  // Calculate changes
  const totalChecksChange = current.totalChecks - previous.totalChecks;
  const totalChecksPercent = previous.totalChecks > 0 
    ? (totalChecksChange / previous.totalChecks) * 100 
    : 0;
  
  const completedChange = current.completed - previous.completed;
  const completedPercent = previous.completed > 0
    ? (completedChange / previous.completed) * 100
    : 0;
  
  const completionRateChange = current.completionRate - previous.completionRate;
  
  const avgTimeChange = current.avgCompletionTime - previous.avgCompletionTime;
  const avgTimePercent = previous.avgCompletionTime > 0
    ? (avgTimeChange / previous.avgCompletionTime) * 100
    : 0;
  
  return {
    current,
    previous,
    changes: {
      totalChecks: totalChecksChange,
      totalChecksPercent,
      completed: completedChange,
      completedPercent,
      completionRate: completionRateChange,
      avgCompletionTime: avgTimeChange,
      avgCompletionTimePercent: avgTimePercent,
    },
  };
}
