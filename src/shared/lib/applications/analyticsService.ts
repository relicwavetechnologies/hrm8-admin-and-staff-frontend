import type { Application } from '@/shared/types/application';
import { differenceInDays, format, startOfMonth, subMonths } from 'date-fns';

export interface TimeToHireMetrics {
  averageDays: number;
  medianDays: number;
  byStage: { stage: string; averageDays: number }[];
  trend: { month: string; averageDays: number }[];
}

export interface ConversionRateMetrics {
  overallRate: number;
  byStage: { stage: string; rate: number; count: number }[];
  funnel: { stage: string; count: number; rate: number }[];
}

export interface SourceEffectiveness {
  sources: { source: string; count: number; conversionRate: number; avgTimeToHire: number }[];
  topPerforming: string[];
}

export interface RecruiterPerformance {
  recruiters: {
    id: string;
    name: string;
    applicationsProcessed: number;
    avgTimeToHire: number;
    conversionRate: number;
    activeApplications: number;
  }[];
  topPerformers: string[];
}

const STAGE_ORDER = [
  'New Application',
  'Resume Review',
  'Phone Screen',
  'Technical Interview',
  'Manager Interview',
  'Final Round',
  'Reference Check',
  'Offer Extended',
  'Offer Accepted',
];

export function calculateTimeToHire(applications: Application[]): TimeToHireMetrics {
  const hiredApps = applications.filter(app => app.status === 'hired');

  if (hiredApps.length === 0) {
    return {
      averageDays: 0,
      medianDays: 0,
      byStage: [],
      trend: [],
    };
  }

  // Calculate days to hire
  const daysToHire = hiredApps.map(app =>
    differenceInDays(app.updatedAt, app.appliedDate)
  );

  const averageDays = Math.round(
    daysToHire.reduce((sum, days) => sum + days, 0) / daysToHire.length
  );

  const sortedDays = [...daysToHire].sort((a, b) => a - b);
  const medianDays = sortedDays[Math.floor(sortedDays.length / 2)];

  // By stage
  const stageGroups = new Map<string, number[]>();
  hiredApps.forEach(app => {
    const days = differenceInDays(app.updatedAt, app.appliedDate);
    const existing = stageGroups.get(app.stage) || [];
    stageGroups.set(app.stage, [...existing, days]);
  });

  const byStage = Array.from(stageGroups.entries()).map(([stage, days]) => ({
    stage,
    averageDays: Math.round(days.reduce((sum, d) => sum + d, 0) / days.length),
  }));

  // Trend over last 6 months
  const trend: { month: string; averageDays: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(new Date(), i);
    const monthStart = startOfMonth(monthDate);
    const monthApps = hiredApps.filter(app => {
      const hiredDate = app.updatedAt;
      return hiredDate >= monthStart && hiredDate < startOfMonth(subMonths(new Date(), i - 1));
    });

    if (monthApps.length > 0) {
      const monthDays = monthApps.map(app =>
        differenceInDays(app.updatedAt, app.appliedDate)
      );
      const avg = Math.round(monthDays.reduce((sum, d) => sum + d, 0) / monthDays.length);
      trend.push({
        month: format(monthDate, 'MMM yyyy'),
        averageDays: avg,
      });
    } else {
      trend.push({
        month: format(monthDate, 'MMM yyyy'),
        averageDays: 0,
      });
    }
  }

  return { averageDays, medianDays, byStage, trend };
}

export function calculateConversionRates(applications: Application[]): ConversionRateMetrics {
  if (applications.length === 0) {
    return { overallRate: 0, byStage: [], funnel: [] };
  }

  const hiredCount = applications.filter(app => app.status === 'hired').length;
  const overallRate = Math.round((hiredCount / applications.length) * 100);

  // By stage conversion
  const stageGroups = new Map<string, { total: number; hired: number }>();
  applications.forEach(app => {
    const existing = stageGroups.get(app.stage) || { total: 0, hired: 0 };
    stageGroups.set(app.stage, {
      total: existing.total + 1,
      hired: existing.hired + (app.status === 'hired' ? 1 : 0),
    });
  });

  const byStage = Array.from(stageGroups.entries()).map(([stage, data]) => ({
    stage,
    rate: Math.round((data.hired / data.total) * 100),
    count: data.total,
  }));

  // Funnel analysis
  const funnel = STAGE_ORDER.map((stage, index) => {
    const stageApps = applications.filter(app => {
      const appStageIndex = STAGE_ORDER.indexOf(app.stage);
      return appStageIndex >= index;
    });
    const count = stageApps.length;
    const rate = applications.length > 0
      ? Math.round((count / applications.length) * 100)
      : 0;
    return { stage, count, rate };
  }).filter(item => item.count > 0);

  return { overallRate, byStage, funnel };
}

export function analyzeSourceEffectiveness(applications: Application[]): SourceEffectiveness {
  // Mock sources since Application type doesn't have source field yet
  const sources = ['LinkedIn', 'Indeed', 'Company Website', 'Referral', 'Glassdoor', 'Other'];

  const sourceData = sources.map(source => {
    // Randomly assign applications to sources for mock data
    const sourceApps = applications.filter(() => Math.random() > 0.7);
    const hired = sourceApps.filter(app => app.status === 'hired');

    const conversionRate = sourceApps.length > 0
      ? Math.round((hired.length / sourceApps.length) * 100)
      : 0;

    const avgTimeToHire = hired.length > 0
      ? Math.round(
        hired.reduce((sum, app) =>
          sum + differenceInDays(app.updatedAt, app.appliedDate), 0
        ) / hired.length
      )
      : 0;

    return {
      source,
      count: sourceApps.length,
      conversionRate,
      avgTimeToHire,
    };
  }).filter(item => item.count > 0);

  const topPerforming = [...sourceData]
    .sort((a, b) => b.conversionRate - a.conversionRate)
    .slice(0, 3)
    .map(item => item.source);

  return { sources: sourceData, topPerforming };
}

export function analyzeRecruiterPerformance(applications: Application[]): RecruiterPerformance {
  const recruiterGroups = new Map<string, Application[]>();

  applications.forEach(app => {
    if (app.assignedTo && app.assignedToName) {
      const existing = recruiterGroups.get(app.assignedTo) || [];
      recruiterGroups.set(app.assignedTo, [...existing, app]);
    }
  });

  const recruiters = Array.from(recruiterGroups.entries()).map(([id, apps]) => {
    const hiredApps = apps.filter(app => app.status === 'hired');
    const activeApps = apps.filter(app =>
      app.status !== 'hired' && app.status !== 'rejected' && app.status !== 'withdrawn'
    );

    const avgTimeToHire = hiredApps.length > 0
      ? Math.round(
        hiredApps.reduce((sum, app) =>
          sum + differenceInDays(app.updatedAt, app.appliedDate), 0
        ) / hiredApps.length
      )
      : 0;

    const conversionRate = apps.length > 0
      ? Math.round((hiredApps.length / apps.length) * 100)
      : 0;

    return {
      id,
      name: apps[0].assignedToName || 'Unknown',
      applicationsProcessed: apps.length,
      avgTimeToHire,
      conversionRate,
      activeApplications: activeApps.length,
    };
  });

  const topPerformers = [...recruiters]
    .sort((a, b) => b.conversionRate - a.conversionRate)
    .slice(0, 3)
    .map(r => r.name);

  return { recruiters, topPerformers };
}

export function getApplicationVolumeOverTime(applications: Application[]) {
  const volumeByMonth: { month: string; count: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(new Date(), i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = startOfMonth(subMonths(new Date(), i - 1));

    const count = applications.filter(app => {
      return app.appliedDate >= monthStart && app.appliedDate < monthEnd;
    }).length;

    volumeByMonth.push({
      month: format(monthDate, 'MMM yyyy'),
      count,
    });
  }

  return volumeByMonth;
}

export function getStatusDistribution(applications: Application[]) {
  const statusCounts = new Map<string, number>();

  applications.forEach(app => {
    const count = statusCounts.get(app.status) || 0;
    statusCounts.set(app.status, count + 1);
  });

  return Array.from(statusCounts.entries()).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    count,
  }));
}
