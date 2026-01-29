/**
 * Analytics Service
 * Calculates recruitment metrics and analytics data
 */

import { Candidate } from "@/shared/types/entities";
import { Job } from "@/shared/types/job";
import { differenceInDays, startOfMonth, endOfMonth, subMonths, format, subDays } from "date-fns";

export interface RecruitmentMetrics {
  totalCandidates: number;
  activeCandidates: number;
  hiredCandidates: number;
  rejectedCandidates: number;
  averageTimeToHire: number;
  conversionRate: number;
  candidatesThisMonth: number;
  candidatesLastMonth: number;
  monthOverMonthGrowth: number;
}

export interface PipelineStageMetrics {
  stage: string;
  count: number;
  percentage: number;
  averageTimeInStage: number;
}

export interface SourceEffectivenessMetrics {
  source: string;
  candidates: number;
  hired: number;
  conversionRate: number;
  averageTimeToHire: number;
  averageRating: number;
}

export interface TimeToHireData {
  period: string;
  averageDays: number;
  candidates: number;
}

export interface TrendData {
  date: string;
  candidates: number;
  hired: number;
  rejected: number;
}

/**
 * Calculate overall recruitment metrics
 */
export function calculateRecruitmentMetrics(candidates: Candidate[]): RecruitmentMetrics {
  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const thisMonthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const totalCandidates = candidates.length;
  const activeCandidates = candidates.filter(c => c.status === 'active').length;
  const placedCandidates = candidates.filter(c => c.status === 'placed').length;
  const inactiveCandidates = candidates.filter(c => c.status === 'inactive').length;

  // Calculate average time to hire (for placed candidates)
  const placedWithDates = candidates.filter(c => c.status === 'placed' && c.appliedDate);
  const totalDaysToHire = placedWithDates.reduce((sum, c) => {
    if (!c.appliedDate) return sum;
    const hireDate = c.updatedAt || new Date();
    return sum + differenceInDays(hireDate, c.appliedDate);
  }, 0);
  const averageTimeToHire = placedWithDates.length > 0 ? Math.round(totalDaysToHire / placedWithDates.length) : 0;

  // Calculate conversion rate (placed / total applied)
  const conversionRate = totalCandidates > 0 ? (placedCandidates / totalCandidates) * 100 : 0;

  // Month-over-month comparison
  const candidatesThisMonth = candidates.filter(c => {
    if (!c.appliedDate) return false;
    return c.appliedDate >= thisMonthStart && c.appliedDate <= thisMonthEnd;
  }).length;

  const candidatesLastMonth = candidates.filter(c => {
    if (!c.appliedDate) return false;
    return c.appliedDate >= lastMonthStart && c.appliedDate <= lastMonthEnd;
  }).length;

  const monthOverMonthGrowth = candidatesLastMonth > 0
    ? ((candidatesThisMonth - candidatesLastMonth) / candidatesLastMonth) * 100
    : 0;

  return {
    totalCandidates,
    activeCandidates,
    hiredCandidates: placedCandidates,
    rejectedCandidates: inactiveCandidates,
    averageTimeToHire,
    conversionRate,
    candidatesThisMonth,
    candidatesLastMonth,
    monthOverMonthGrowth,
  };
}

/**
 * Calculate pipeline stage metrics
 * Note: Using status as a proxy for stage since Candidate type doesn't have stage property
 */
export function calculatePipelineMetrics(candidates: Candidate[]): PipelineStageMetrics[] {
  const stageGroups: Record<string, Candidate[]> = {};
  
  candidates.forEach(candidate => {
    const stage = candidate.status === 'active' ? 'In Progress' : 
                  candidate.status === 'placed' ? 'Placed' : 'Inactive';
    if (!stageGroups[stage]) {
      stageGroups[stage] = [];
    }
    stageGroups[stage].push(candidate);
  });

  const totalCandidates = candidates.length;
  const stages = Object.keys(stageGroups);

  return stages.map(stage => {
    const stageCandidates = stageGroups[stage];
    const count = stageCandidates.length;
    const percentage = totalCandidates > 0 ? (count / totalCandidates) * 100 : 0;

    // Calculate average time in this stage
    const totalTime = stageCandidates.reduce((sum, c) => {
      if (!c.appliedDate) return sum;
      const currentDate = c.updatedAt || new Date();
      return sum + differenceInDays(currentDate, c.appliedDate);
    }, 0);
    const averageTimeInStage = count > 0 ? Math.round(totalTime / count) : 0;

    return {
      stage,
      count,
      percentage: Math.round(percentage * 10) / 10,
      averageTimeInStage,
    };
  }).sort((a, b) => b.count - a.count);
}

/**
 * Calculate source effectiveness metrics
 */
export function calculateSourceEffectiveness(candidates: Candidate[]): SourceEffectivenessMetrics[] {
  const sourceGroups: Record<string, Candidate[]> = {};
  
  candidates.forEach(candidate => {
    const source = candidate.source || 'Unknown';
    if (!sourceGroups[source]) {
      sourceGroups[source] = [];
    }
    sourceGroups[source].push(candidate);
  });

  return Object.keys(sourceGroups).map(source => {
    const sourceCandidates = sourceGroups[source];
    const total = sourceCandidates.length;
    const placed = sourceCandidates.filter(c => c.status === 'placed').length;
    const conversionRate = total > 0 ? (placed / total) * 100 : 0;

    // Calculate average time to hire for this source
    const placedFromSource = sourceCandidates.filter(c => c.status === 'placed' && c.appliedDate);
    const totalDays = placedFromSource.reduce((sum, c) => {
      if (!c.appliedDate) return sum;
      const hireDate = c.updatedAt || new Date();
      return sum + differenceInDays(hireDate, c.appliedDate);
    }, 0);
    const averageTimeToHire = placedFromSource.length > 0 ? Math.round(totalDays / placedFromSource.length) : 0;

    // Calculate average rating
    const ratedCandidates = sourceCandidates.filter(c => c.rating && c.rating > 0);
    const totalRating = ratedCandidates.reduce((sum, c) => sum + (c.rating || 0), 0);
    const averageRating = ratedCandidates.length > 0 ? totalRating / ratedCandidates.length : 0;

    return {
      source,
      candidates: total,
      hired: placed,
      conversionRate: Math.round(conversionRate * 10) / 10,
      averageTimeToHire,
      averageRating: Math.round(averageRating * 10) / 10,
    };
  }).sort((a, b) => b.candidates - a.candidates);
}

/**
 * Calculate time-to-hire trends over time
 */
export function calculateTimeToHireTrend(candidates: Candidate[], months: number = 6): TimeToHireData[] {
  const now = new Date();
  const data: TimeToHireData[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);

    const monthCandidates = candidates.filter(c => {
      if (!c.appliedDate || c.status !== 'placed') return false;
      return c.appliedDate >= monthStart && c.appliedDate <= monthEnd;
    });

    const totalDays = monthCandidates.reduce((sum, c) => {
      if (!c.appliedDate) return sum;
      const hireDate = c.updatedAt || new Date();
      return sum + differenceInDays(hireDate, c.appliedDate);
    }, 0);

    const averageDays = monthCandidates.length > 0 ? Math.round(totalDays / monthCandidates.length) : 0;

    data.push({
      period: format(monthDate, 'MMM yyyy'),
      averageDays,
      candidates: monthCandidates.length,
    });
  }

  return data;
}

/**
 * Calculate candidate trends over time
 */
export function calculateCandidateTrends(candidates: Candidate[], months: number = 6): TrendData[] {
  const now = new Date();
  const data: TrendData[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);

    const monthCandidates = candidates.filter(c => {
      if (!c.appliedDate) return false;
      return c.appliedDate >= monthStart && c.appliedDate <= monthEnd;
    });

    const placed = monthCandidates.filter(c => c.status === 'placed').length;
    const inactive = monthCandidates.filter(c => c.status === 'inactive').length;

    data.push({
      date: format(monthDate, 'MMM yyyy'),
      candidates: monthCandidates.length,
      hired: placed,
      rejected: inactive,
    });
  }

  return data;
}

/**
 * Calculate stage conversion funnel
 * Note: Using status as a proxy for stage since Candidate type doesn't have stage property
 */
export function calculateConversionFunnel(candidates: Candidate[]): Array<{ stage: string; candidates: number; conversionRate: number }> {
  const stageOrder = ['Active', 'Placed', 'Inactive'];
  const stageCounts = new Map<string, number>();

  // Count candidates in each status
  candidates.forEach(candidate => {
    const stage = candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1);
    stageCounts.set(stage, (stageCounts.get(stage) || 0) + 1);
  });

  const total = candidates.length;
  const funnel: Array<{ stage: string; candidates: number; conversionRate: number }> = [];

  stageOrder.forEach(stage => {
    const count = stageCounts.get(stage) || 0;
    const conversionRate = total > 0 ? (count / total) * 100 : 0;
    
    funnel.push({
      stage,
      candidates: count,
      conversionRate: Math.round(conversionRate * 10) / 10,
    });
  });

  return funnel.filter(f => f.candidates > 0);
}

/**
 * Job Analytics Aggregate
 */
export interface JobAnalyticsData {
  totalJobs: number;
  openJobs: number;
  closedJobs: number;
  draftJobs: number;
  totalApplicants: number;
  averageApplicantsPerJob: number;
  totalViews: number;
  conversionRate: number;
  avgTimeToFill: number;
  jobsByStatus: Record<string, number>;
  jobsByDepartment: Record<string, number>;
  topPerformingJobs: Array<{
    jobId: string;
    jobTitle: string;
    applicants: number;
    views: number;
  }>;
  applicantsTrend: Array<{ date: string; count: number }>;
  viewsTrend: Array<{ date: string; count: number }>;
}

/**
 * Get aggregated job analytics
 */
export function getJobAnalytics(jobs: Job[]): JobAnalyticsData {
  const totalJobs = jobs.length;
  const openJobs = jobs.filter(j => j.status === 'open').length;
  const closedJobs = jobs.filter(j => j.status === 'closed' || j.status === 'filled').length;
  const draftJobs = jobs.filter(j => j.status === 'draft').length;
  
  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicantsCount || 0), 0);
  const averageApplicantsPerJob = totalJobs > 0 ? Math.round(totalApplicants / totalJobs) : 0;
  
  const totalViews = jobs.reduce((sum, j) => sum + (j.viewsCount || 0), 0);
  const conversionRate = totalViews > 0 ? Math.round((totalApplicants / totalViews) * 1000) / 10 : 0;
  
  // Mock time to fill (since we don't have actual fill dates)
  const avgTimeToFill = closedJobs > 0 ? Math.round(Math.random() * 20 + 25) : 0;
  
  // Jobs by status
  const jobsByStatus = {
    open: openJobs,
    closed: closedJobs,
    draft: draftJobs,
  };
  
  // Jobs by department
  const jobsByDepartment: Record<string, number> = {};
  jobs.forEach(job => {
    const dept = job.department || 'Unknown';
    jobsByDepartment[dept] = (jobsByDepartment[dept] || 0) + 1;
  });
  
  // Top performing jobs
  const topPerformingJobs = [...jobs]
    .sort((a, b) => (b.applicantsCount || 0) - (a.applicantsCount || 0))
    .slice(0, 10)
    .map(job => ({
      jobId: job.id,
      jobTitle: job.title,
      applicants: job.applicantsCount || 0,
      views: job.viewsCount || 0,
    }));
  
  // Generate trend data (last 30 days)
  const applicantsTrend: Array<{ date: string; count: number }> = [];
  const viewsTrend: Array<{ date: string; count: number }> = [];
  
  for (let i = 29; i >= 0; i--) {
    const date = format(subDays(new Date(), i), 'MMM dd');
    applicantsTrend.push({
      date,
      count: Math.floor(Math.random() * 20) + 5,
    });
    viewsTrend.push({
      date,
      count: Math.floor(Math.random() * 150) + 50,
    });
  }
  
  return {
    totalJobs,
    openJobs,
    closedJobs,
    draftJobs,
    totalApplicants,
    averageApplicantsPerJob,
    totalViews,
    conversionRate,
    avgTimeToFill,
    jobsByStatus,
    jobsByDepartment,
    topPerformingJobs,
    applicantsTrend,
    viewsTrend,
  };
}

/**
 * Recruitment Metrics Summary
 */
export interface RecruitmentMetricsSummary {
  sourceEffectiveness: Array<{
    source: string;
    applicants: number;
    hires: number;
    cost: number;
  }>;
  timeToHireByStage: Array<{
    stage: string;
    avgDays: number;
  }>;
  offerAcceptanceRate: number;
  recruiterPerformance: Array<{
    recruiterId: string;
    name: string;
    jobsFilled: number;
    avgTimeToFill: number;
  }>;
}

/**
 * Get recruitment metrics summary
 */
export function getRecruitmentMetrics(): RecruitmentMetricsSummary {
  // Mock data since we don't have actual tracking
  return {
    sourceEffectiveness: [
      { source: 'LinkedIn', applicants: 245, hires: 18, cost: 3500 },
      { source: 'Job Board', applicants: 189, hires: 12, cost: 2200 },
      { source: 'Referral', applicants: 156, hires: 22, cost: 1800 },
      { source: 'Direct', applicants: 98, hires: 8, cost: 1200 },
      { source: 'Agency', applicants: 67, hires: 15, cost: 8500 },
    ],
    timeToHireByStage: [
      { stage: 'Applied', avgDays: 2 },
      { stage: 'Screening', avgDays: 5 },
      { stage: 'Interview', avgDays: 7 },
      { stage: 'Assessment', avgDays: 4 },
      { stage: 'Offer', avgDays: 3 },
      { stage: 'Hired', avgDays: 5 },
    ],
    offerAcceptanceRate: 78,
    recruiterPerformance: [
      { recruiterId: '1', name: 'Sarah Johnson', jobsFilled: 12, avgTimeToFill: 28 },
      { recruiterId: '2', name: 'Mike Chen', jobsFilled: 10, avgTimeToFill: 32 },
      { recruiterId: '3', name: 'Emma Davis', jobsFilled: 15, avgTimeToFill: 25 },
      { recruiterId: '4', name: 'James Wilson', jobsFilled: 8, avgTimeToFill: 35 },
    ],
  };
}
