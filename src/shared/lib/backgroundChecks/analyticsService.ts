import { getBackgroundChecks } from '@/shared/lib/mockBackgroundCheckStorage';
import { calculateSLAStatus } from './slaService';
import type { BackgroundCheck } from '@/shared/types/backgroundCheck';

export interface TrendDataPoint {
  date: string;
  totalChecks: number;
  completed: number;
  inProgress: number;
  avgCompletionTime: number;
  completionRate: number;
}

export interface CheckTypeMetrics {
  type: string;
  total: number;
  completed: number;
  avgTime: number;
  successRate: number;
  cost: number;
}

export interface RecruiterPerformance {
  recruiterId: string;
  recruiterName: string;
  totalInitiated: number;
  avgCompletionTime: number;
  completionRate: number;
  onTimeRate: number;
  qualityScore: number;
}

export interface BottleneckInsight {
  stage: string;
  avgDuration: number;
  checksAffected: number;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface PredictiveMetrics {
  predictedCompletionTime: number;
  riskFactors: { factor: string; impact: number }[];
  bottlenecks: BottleneckInsight[];
  efficiency: number;
}

export function getTrendsData(days: number = 30): TrendDataPoint[] {
  const checks = getBackgroundChecks();
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
  
  const dataPoints: TrendDataPoint[] = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    
    const checksUpToDate = checks.filter(c => new Date(c.initiatedDate) <= date);
    const completedUpToDate = checksUpToDate.filter(c => c.completedDate && new Date(c.completedDate) <= date);
    const inProgressAtDate = checksUpToDate.filter(c => 
      !c.completedDate || new Date(c.completedDate) > date
    );
    
    const avgTime = completedUpToDate.length > 0
      ? completedUpToDate.reduce((sum, c) => {
          const initiated = new Date(c.initiatedDate);
          const completed = new Date(c.completedDate!);
          return sum + Math.floor((completed.getTime() - initiated.getTime()) / (1000 * 60 * 60 * 24));
        }, 0) / completedUpToDate.length
      : 0;
    
    dataPoints.push({
      date: dateStr,
      totalChecks: checksUpToDate.length,
      completed: completedUpToDate.length,
      inProgress: inProgressAtDate.length,
      avgCompletionTime: Math.round(avgTime),
      completionRate: checksUpToDate.length > 0 ? (completedUpToDate.length / checksUpToDate.length) * 100 : 0
    });
  }
  
  return dataPoints;
}

export function getCheckTypeComparison(): CheckTypeMetrics[] {
  const checks = getBackgroundChecks();
  const typeMap = new Map<string, BackgroundCheck[]>();
  
  checks.forEach(check => {
    check.checkTypes.forEach(ct => {
      if (!typeMap.has(ct.type)) {
        typeMap.set(ct.type, []);
      }
      typeMap.get(ct.type)!.push(check);
    });
  });
  
  const metrics: CheckTypeMetrics[] = [];
  
  typeMap.forEach((checksWithType, type) => {
    const completed = checksWithType.filter(c => c.status === 'completed');
    const avgTime = completed.length > 0
      ? completed.reduce((sum, c) => {
          const initiated = new Date(c.initiatedDate);
          const completedDate = new Date(c.completedDate!);
          return sum + Math.floor((completedDate.getTime() - initiated.getTime()) / (1000 * 60 * 60 * 24));
        }, 0) / completed.length
      : 0;
    
    const clear = checksWithType.filter(c => c.overallStatus === 'clear');
    
    const costMap: Record<string, number> = {
      'reference': 69,
      'criminal': 49,
      'identity': 39,
      'education': 59,
      'employment': 59,
      'credit': 59,
      'drug-screen': 89,
      'professional-license': 59
    };
    
    metrics.push({
      type: formatCheckType(type),
      total: checksWithType.length,
      completed: completed.length,
      avgTime: Math.round(avgTime),
      successRate: checksWithType.length > 0 ? (clear.length / checksWithType.length) * 100 : 0,
      cost: costMap[type] || 59
    });
  });
  
  return metrics.sort((a, b) => b.total - a.total);
}

export function getRecruiterPerformance(): RecruiterPerformance[] {
  const checks = getBackgroundChecks();
  const recruiterMap = new Map<string, BackgroundCheck[]>();
  
  checks.forEach(check => {
    const key = check.initiatedBy;
    if (!recruiterMap.has(key)) {
      recruiterMap.set(key, []);
    }
    recruiterMap.get(key)!.push(check);
  });
  
  const performance: RecruiterPerformance[] = [];
  
  recruiterMap.forEach((recruiterChecks, recruiterId) => {
    const completed = recruiterChecks.filter(c => c.status === 'completed');
    const avgTime = completed.length > 0
      ? completed.reduce((sum, c) => {
          const initiated = new Date(c.initiatedDate);
          const completedDate = new Date(c.completedDate!);
          return sum + Math.floor((completedDate.getTime() - initiated.getTime()) / (1000 * 60 * 60 * 24));
        }, 0) / completed.length
      : 0;
    
    const completionRate = recruiterChecks.length > 0
      ? (completed.length / recruiterChecks.length) * 100
      : 0;
    
    const onTimeChecks = completed.filter(c => {
      const slaStatus = calculateSLAStatus(c);
      return slaStatus?.slaStatus === 'on-track' || c.status === 'completed';
    });
    
    const onTimeRate = completed.length > 0
      ? (onTimeChecks.length / completed.length) * 100
      : 0;
    
    const clearChecks = recruiterChecks.filter(c => c.overallStatus === 'clear');
    const qualityScore = recruiterChecks.length > 0
      ? (clearChecks.length / recruiterChecks.length) * 100
      : 0;
    
    performance.push({
      recruiterId,
      recruiterName: recruiterChecks[0]?.initiatedByName || 'Unknown',
      totalInitiated: recruiterChecks.length,
      avgCompletionTime: Math.round(avgTime),
      completionRate,
      onTimeRate,
      qualityScore
    });
  });
  
  return performance.sort((a, b) => b.totalInitiated - a.totalInitiated);
}

export function getBottleneckInsights(): BottleneckInsight[] {
  const checks = getBackgroundChecks();
  
  const insights: BottleneckInsight[] = [];
  
  // Analyze consent stage
  const consentChecks = checks.filter(c => c.status === 'pending-consent' || c.consentGiven);
  const consentDurations = consentChecks
    .filter(c => c.consentDate)
    .map(c => {
      const initiated = new Date(c.initiatedDate);
      const consent = new Date(c.consentDate!);
      return Math.floor((consent.getTime() - initiated.getTime()) / (1000 * 60 * 60 * 24));
    });
  
  if (consentDurations.length > 0) {
    const avgConsentTime = consentDurations.reduce((a, b) => a + b, 0) / consentDurations.length;
    insights.push({
      stage: 'Consent Collection',
      avgDuration: Math.round(avgConsentTime),
      checksAffected: consentChecks.length,
      severity: avgConsentTime > 3 ? 'high' : avgConsentTime > 2 ? 'medium' : 'low',
      recommendation: avgConsentTime > 3 
        ? 'Consider automated reminders and simplified consent process'
        : 'Consent collection is efficient'
    });
  }
  
  // Analyze verification stage
  const inProgressChecks = checks.filter(c => c.status === 'in-progress');
  const verificationDurations = checks
    .filter(c => c.completedDate && c.consentDate)
    .map(c => {
      const consent = new Date(c.consentDate!);
      const completed = new Date(c.completedDate!);
      return Math.floor((completed.getTime() - consent.getTime()) / (1000 * 60 * 60 * 24));
    });
  
  if (verificationDurations.length > 0) {
    const avgVerificationTime = verificationDurations.reduce((a, b) => a + b, 0) / verificationDurations.length;
    insights.push({
      stage: 'Verification Process',
      avgDuration: Math.round(avgVerificationTime),
      checksAffected: inProgressChecks.length,
      severity: avgVerificationTime > 7 ? 'high' : avgVerificationTime > 5 ? 'medium' : 'low',
      recommendation: avgVerificationTime > 7
        ? 'Review provider response times and consider additional automation'
        : 'Verification times are within acceptable range'
    });
  }
  
  // Analyze review stage
  const reviewChecks = checks.filter(c => 
    c.status === 'issues-found' || 
    (c.overallStatus === 'conditional' && !c.reviewedBy)
  );
  
  if (reviewChecks.length > 0) {
    insights.push({
      stage: 'Review & Decision',
      avgDuration: 0,
      checksAffected: reviewChecks.length,
      severity: reviewChecks.length > 5 ? 'high' : reviewChecks.length > 2 ? 'medium' : 'low',
      recommendation: reviewChecks.length > 5
        ? 'Assign dedicated reviewers to clear backlog faster'
        : 'Review queue is manageable'
    });
  }
  
  return insights.sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
}

export function getPredictiveMetrics(): PredictiveMetrics {
  const checks = getBackgroundChecks();
  const completedChecks = checks.filter(c => c.completedDate);
  
  const avgCompletionTime = completedChecks.length > 0
    ? completedChecks.reduce((sum, c) => {
        const initiated = new Date(c.initiatedDate);
        const completed = new Date(c.completedDate!);
        return sum + Math.floor((completed.getTime() - initiated.getTime()) / (1000 * 60 * 60 * 24));
      }, 0) / completedChecks.length
    : 10;
  
  const riskFactors = [
    {
      factor: 'Delayed Consent',
      impact: checks.filter(c => c.status === 'pending-consent').length / checks.length * 100
    },
    {
      factor: 'Referee Non-Response',
      impact: Math.random() * 30 // Mock data
    },
    {
      factor: 'Provider Delays',
      impact: Math.random() * 20 // Mock data
    },
    {
      factor: 'Manual Review Backlog',
      impact: checks.filter(c => c.status === 'issues-found').length / checks.length * 100
    }
  ].filter(f => f.impact > 5);
  
  const bottlenecks = getBottleneckInsights();
  
  const efficiency = Math.max(0, 100 - riskFactors.reduce((sum, f) => sum + f.impact, 0));
  
  return {
    predictedCompletionTime: Math.round(avgCompletionTime * 1.2), // 20% buffer
    riskFactors,
    bottlenecks,
    efficiency: Math.round(efficiency)
  };
}

export function getCompletionRateByStatus() {
  const checks = getBackgroundChecks();
  const statusCounts = {
    'not-started': 0,
    'pending-consent': 0,
    'in-progress': 0,
    'completed': 0,
    'issues-found': 0,
    'cancelled': 0
  };
  
  checks.forEach(c => {
    statusCounts[c.status]++;
  });
  
  return Object.entries(statusCounts).map(([status, count]) => ({
    status: formatStatus(status),
    count,
    percentage: checks.length > 0 ? (count / checks.length) * 100 : 0
  }));
}

export function getTimeToCompletionDistribution() {
  const checks = getBackgroundChecks().filter(c => c.completedDate);
  
  const buckets = {
    '0-3 days': 0,
    '4-7 days': 0,
    '8-14 days': 0,
    '15-21 days': 0,
    '22+ days': 0
  };
  
  checks.forEach(c => {
    const initiated = new Date(c.initiatedDate);
    const completed = new Date(c.completedDate!);
    const days = Math.floor((completed.getTime() - initiated.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days <= 3) buckets['0-3 days']++;
    else if (days <= 7) buckets['4-7 days']++;
    else if (days <= 14) buckets['8-14 days']++;
    else if (days <= 21) buckets['15-21 days']++;
    else buckets['22+ days']++;
  });
  
  return Object.entries(buckets).map(([range, count]) => ({
    range,
    count,
    percentage: checks.length > 0 ? (count / checks.length) * 100 : 0
  }));
}

function formatCheckType(type: string): string {
  return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function formatStatus(status: string): string {
  return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
