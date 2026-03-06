import { getBackgroundChecks } from '@/shared/lib/mockBackgroundCheckStorage';
import { getOverdueReferees } from './refereeStorage';
import { getConsentRequests } from './consentStorage';
import type { BackgroundCheck } from '@/shared/types/backgroundCheck';

export interface BackgroundCheckStats {
  total: number;
  active: number;
  completed: number;
  issuesFound: number;
  cancelled: number;
  completionRate: number;
  avgCompletionTime: number;
  pendingConsents: number;
  overdueReferees: number;
  requiresReview: number;
  changeFromLastMonth: {
    total: number;
    active: number;
    completionRate: number;
    avgCompletionTime: number;
  };
}

export function getBackgroundCheckStats(): BackgroundCheckStats {
  const checks = getBackgroundChecks();
  // const referees = getReferees();
  const consents = getConsentRequests();

  const completed = checks.filter(c => c.status === 'completed').length;
  const active = checks.filter(c => ['pending-consent', 'in-progress'].includes(c.status)).length;
  const issuesFound = checks.filter(c => c.status === 'issues-found').length;
  const cancelled = checks.filter(c => c.status === 'cancelled').length;

  const completionRate = checks.length > 0 ? (completed / checks.length) * 100 : 0;
  const avgCompletionTime = calculateAvgCompletionTime(checks);

  return {
    total: checks.length,
    active,
    completed,
    issuesFound,
    cancelled,
    completionRate,
    avgCompletionTime,
    pendingConsents: consents.filter(c => c.status === 'pending' || c.status === 'sent').length,
    overdueReferees: getOverdueReferees().length,
    requiresReview: checks.filter(c => c.overallStatus === 'conditional' || c.status === 'issues-found').length,
    changeFromLastMonth: {
      total: 12.5,
      active: -5.2,
      completionRate: 3.8,
      avgCompletionTime: -2.1,
    }
  };
}

export function calculateAvgCompletionTime(checks: BackgroundCheck[]): number {
  const completedChecks = checks.filter(c => c.completedDate);
  if (completedChecks.length === 0) return 0;

  const totalDays = completedChecks.reduce((sum, check) => {
    const initiated = new Date(check.initiatedDate);
    const completed = new Date(check.completedDate!);
    const days = Math.floor((completed.getTime() - initiated.getTime()) / (1000 * 60 * 60 * 24));
    return sum + days;
  }, 0);

  return Math.round(totalDays / completedChecks.length);
}

export function getCheckVolumeData() {
  return [
    { month: 'Jan', initiated: 45, completed: 38, avgDays: 12 },
    { month: 'Feb', initiated: 52, completed: 45, avgDays: 11 },
    { month: 'Mar', initiated: 48, completed: 50, avgDays: 10 },
    { month: 'Apr', initiated: 61, completed: 48, avgDays: 11 },
    { month: 'May', initiated: 58, completed: 55, avgDays: 9 },
    { month: 'Jun', initiated: 67, completed: 61, avgDays: 9 },
  ];
}

export function getStatusDistributionData() {
  const checks = getBackgroundChecks();
  return [
    { status: 'Not Started', count: checks.filter(c => c.status === 'not-started').length },
    { status: 'Pending Consent', count: checks.filter(c => c.status === 'pending-consent').length },
    { status: 'In Progress', count: checks.filter(c => c.status === 'in-progress').length },
    { status: 'Completed', count: checks.filter(c => c.status === 'completed').length },
    { status: 'Issues Found', count: checks.filter(c => c.status === 'issues-found').length },
    { status: 'Cancelled', count: checks.filter(c => c.status === 'cancelled').length },
  ];
}

export function getCheckTypeDistribution() {
  const checks = getBackgroundChecks();
  const typeCounts: Record<string, number> = {};

  checks.forEach(check => {
    check.checkTypes.forEach(ct => {
      typeCounts[ct.type] = (typeCounts[ct.type] || 0) + 1;
    });
  });

  return Object.entries(typeCounts).map(([type, count]) => ({
    type: formatCheckType(type),
    count,
    percentage: Math.round((count / checks.length) * 100)
  }));
}

export function getProviderUsageData() {
  const checks = getBackgroundChecks();
  const providers = ['checkr', 'sterling', 'hireright', 'manual'];

  return providers.map(provider => ({
    provider: provider.charAt(0).toUpperCase() + provider.slice(1),
    count: checks.filter(c => c.provider === provider).length,
    successRate: Math.floor(Math.random() * 20) + 80, // Mock success rate
  }));
}

export function getResultsOverview() {
  const checks = getBackgroundChecks();
  return [
    { status: 'Clear', count: checks.filter(c => c.overallStatus === 'clear').length, color: 'hsl(var(--success))' },
    { status: 'Conditional', count: checks.filter(c => c.overallStatus === 'conditional').length, color: 'hsl(var(--warning))' },
    { status: 'Not Clear', count: checks.filter(c => c.overallStatus === 'not-clear').length, color: 'hsl(var(--destructive))' },
    { status: 'Pending', count: checks.filter(c => !c.overallStatus).length, color: 'hsl(var(--muted))' },
  ];
}

export function getRecentActivity() {
  const checks = getBackgroundChecks();
  const activities = checks
    .flatMap(check => [
      {
        type: 'initiated',
        candidateName: check.candidateName,
        timestamp: check.initiatedDate,
        checkId: check.id,
      },
      ...(check.consentGiven ? [{
        type: 'consent-received',
        candidateName: check.candidateName,
        timestamp: check.consentDate!,
        checkId: check.id,
      }] : []),
      ...(check.completedDate ? [{
        type: 'completed',
        candidateName: check.candidateName,
        timestamp: check.completedDate,
        checkId: check.id,
      }] : []),
    ])
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  return activities;
}

function formatCheckType(type: string): string {
  return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
