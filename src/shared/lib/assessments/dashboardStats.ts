import { getAssessments } from '@/shared/lib/mockAssessmentStorage';
import type { Assessment } from '@/shared/types/assessment';
import { startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, format } from 'date-fns';

export interface AssessmentStats {
  total: number;
  active: number;
  completed: number;
  avgScore: number;
  passRate: number;
  avgCompletionTime: number;
  pendingInvitations: number;
  expiringSoon: number;
  needsReview: number;
  lowScores: number;
  changeFromLastMonth: {
    total: number;
    active: number;
    completed: number;
    avgScore: number;
  };
}

export function getAssessmentStats(
  dateRange?: { from: Date; to: Date },
  country?: string,
  region?: string
): AssessmentStats {
  let assessments = getAssessments();

  // Apply date range filter
  if (dateRange) {
    assessments = assessments.filter(a => {
      const date = new Date(a.invitedDate);
      return date >= dateRange.from && date <= dateRange.to;
    });
  }

  // Apply location filters
  if (country && country !== 'all') {
    assessments = assessments.filter(a => a.country === country);
  }
  if (region && region !== 'all') {
    assessments = assessments.filter(a => a.region === region);
  }

  const total = assessments.length;
  const active = assessments.filter(a => 
    a.status === 'invited' || a.status === 'in-progress'
  ).length;
  const completed = assessments.filter(a => a.status === 'completed').length;
  
  const completedAssessments = assessments.filter(a => a.status === 'completed' && a.overallScore);
  const avgScore = completedAssessments.length > 0
    ? completedAssessments.reduce((sum, a) => sum + (a.overallScore || 0), 0) / completedAssessments.length
    : 0;

  const passedCount = completedAssessments.filter(a => a.passed).length;
  const passRate = completedAssessments.length > 0 
    ? (passedCount / completedAssessments.length) * 100 
    : 0;

  const assessmentsWithTime = completedAssessments.filter(a => a.result?.timeSpent);
  const avgCompletionTime = assessmentsWithTime.length > 0
    ? assessmentsWithTime.reduce((sum, a) => sum + (a.result?.timeSpent || 0), 0) / assessmentsWithTime.length
    : 0;

  const now = new Date();
  const pendingInvitations = assessments.filter(a => a.status === 'pending-invitation').length;
  
  const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
  const expiringSoon = assessments.filter(a => {
    if (a.status === 'completed' || a.status === 'expired' || a.status === 'cancelled') return false;
    const expiryDate = new Date(a.expiryDate);
    return expiryDate <= threeDaysFromNow && expiryDate > now;
  }).length;

  const needsReview = completedAssessments.filter(a => 
    a.result?.status === 'needs-review'
  ).length;

  const lowScores = completedAssessments.filter(a => 
    (a.overallScore || 0) < 50
  ).length;

  // Calculate last month comparison
  const lastMonth = subMonths(now, 1);
  const lastMonthStart = startOfMonth(lastMonth);
  const lastMonthEnd = endOfMonth(lastMonth);
  
  const lastMonthAssessments = getAssessments().filter(a => {
    const date = new Date(a.invitedDate);
    return date >= lastMonthStart && date <= lastMonthEnd;
  });

  const lastMonthTotal = lastMonthAssessments.length;
  const lastMonthActive = lastMonthAssessments.filter(a => 
    a.status === 'invited' || a.status === 'in-progress'
  ).length;
  const lastMonthCompleted = lastMonthAssessments.filter(a => a.status === 'completed').length;
  
  const lastMonthCompletedAssessments = lastMonthAssessments.filter(a => a.status === 'completed' && a.overallScore);
  const lastMonthAvgScore = lastMonthCompletedAssessments.length > 0
    ? lastMonthCompletedAssessments.reduce((sum, a) => sum + (a.overallScore || 0), 0) / lastMonthCompletedAssessments.length
    : 0;

  return {
    total,
    active,
    completed,
    avgScore: Math.round(avgScore * 10) / 10,
    passRate: Math.round(passRate * 10) / 10,
    avgCompletionTime: Math.round(avgCompletionTime),
    pendingInvitations,
    expiringSoon,
    needsReview,
    lowScores,
    changeFromLastMonth: {
      total: lastMonthTotal > 0 ? Math.round(((total - lastMonthTotal) / lastMonthTotal) * 100) : 0,
      active: lastMonthActive > 0 ? Math.round(((active - lastMonthActive) / lastMonthActive) * 100) : 0,
      completed: lastMonthCompleted > 0 ? Math.round(((completed - lastMonthCompleted) / lastMonthCompleted) * 100) : 0,
      avgScore: lastMonthAvgScore > 0 ? Math.round(((avgScore - lastMonthAvgScore) / lastMonthAvgScore) * 100) : 0,
    }
  };
}

export function getAssessmentVolumeData(
  dateRange?: { from: Date; to: Date },
  country?: string,
  region?: string
) {
  let assessments = getAssessments();

  // Apply location filters
  if (country && country !== 'all') {
    assessments = assessments.filter(a => a.country === country);
  }
  if (region && region !== 'all') {
    assessments = assessments.filter(a => a.region === region);
  }

  const now = new Date();
  const sixMonthsAgo = subMonths(now, 6);
  const months = eachMonthOfInterval({ start: sixMonthsAgo, end: now });

  return months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const monthAssessments = assessments.filter(a => {
      const date = new Date(a.invitedDate);
      return date >= monthStart && date <= monthEnd;
    });

    return {
      month: format(month, 'MMM yyyy'),
      total: monthAssessments.length,
      completed: monthAssessments.filter(a => a.status === 'completed').length,
      inProgress: monthAssessments.filter(a => a.status === 'in-progress').length,
      invited: monthAssessments.filter(a => a.status === 'invited').length,
    };
  });
}

export function getAssessmentTypeDistribution(
  dateRange?: { from: Date; to: Date },
  country?: string,
  region?: string
) {
  let assessments = getAssessments();

  // Apply date range filter
  if (dateRange) {
    assessments = assessments.filter(a => {
      const date = new Date(a.invitedDate);
      return date >= dateRange.from && date <= dateRange.to;
    });
  }

  // Apply location filters
  if (country && country !== 'all') {
    assessments = assessments.filter(a => a.country === country);
  }
  if (region && region !== 'all') {
    assessments = assessments.filter(a => a.region === region);
  }

  const distribution: Record<string, number> = {};
  
  assessments.forEach(a => {
    distribution[a.assessmentType] = (distribution[a.assessmentType] || 0) + 1;
  });

  return Object.entries(distribution).map(([type, count]) => ({
    type,
    count,
    percentage: Math.round((count / assessments.length) * 100)
  }));
}

export function getProviderPerformanceData(
  dateRange?: { from: Date; to: Date },
  country?: string,
  region?: string
) {
  let assessments = getAssessments();

  // Apply date range filter
  if (dateRange) {
    assessments = assessments.filter(a => {
      const date = new Date(a.invitedDate);
      return date >= dateRange.from && date <= dateRange.to;
    });
  }

  // Apply location filters
  if (country && country !== 'all') {
    assessments = assessments.filter(a => a.country === country);
  }
  if (region && region !== 'all') {
    assessments = assessments.filter(a => a.region === region);
  }

  const providerStats: Record<string, { total: number; completed: number; avgScore: number; scores: number[] }> = {};

  assessments.forEach(a => {
    if (!providerStats[a.provider]) {
      providerStats[a.provider] = { total: 0, completed: 0, avgScore: 0, scores: [] };
    }
    providerStats[a.provider].total++;
    if (a.status === 'completed') {
      providerStats[a.provider].completed++;
      if (a.overallScore) {
        providerStats[a.provider].scores.push(a.overallScore);
      }
    }
  });

  return Object.entries(providerStats).map(([provider, stats]) => ({
    provider,
    total: stats.total,
    completionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
    avgScore: stats.scores.length > 0 
      ? Math.round((stats.scores.reduce((sum, s) => sum + s, 0) / stats.scores.length) * 10) / 10
      : 0
  }));
}

export function getScoreDistributionData(
  dateRange?: { from: Date; to: Date },
  country?: string,
  region?: string
) {
  let assessments = getAssessments().filter(a => a.status === 'completed' && a.overallScore);

  // Apply date range filter
  if (dateRange) {
    assessments = assessments.filter(a => {
      const date = new Date(a.invitedDate);
      return date >= dateRange.from && date <= dateRange.to;
    });
  }

  // Apply location filters
  if (country && country !== 'all') {
    assessments = assessments.filter(a => a.country === country);
  }
  if (region && region !== 'all') {
    assessments = assessments.filter(a => a.region === region);
  }

  const ranges = [
    { label: '0-20', min: 0, max: 20 },
    { label: '21-40', min: 21, max: 40 },
    { label: '41-60', min: 41, max: 60 },
    { label: '61-80', min: 61, max: 80 },
    { label: '81-100', min: 81, max: 100 },
  ];

  return ranges.map(range => ({
    range: range.label,
    count: assessments.filter(a => 
      (a.overallScore || 0) >= range.min && (a.overallScore || 0) <= range.max
    ).length
  }));
}

export function getRecentActivity() {
  const assessments = getAssessments()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 10);

  return assessments.map(a => {
    let type = '';
    if (a.status === 'invited') type = 'assessment-invited';
    else if (a.status === 'in-progress') type = 'assessment-started';
    else if (a.status === 'completed') type = 'assessment-completed';
    else if (a.status === 'expired') type = 'assessment-expired';
    else if (a.remindersSent > 0) type = 'reminder-sent';

    return {
      type,
      candidateName: a.candidateName,
      timestamp: a.updatedAt,
      assessmentId: a.id,
      assessmentType: a.assessmentType,
    };
  });
}
