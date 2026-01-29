import { getAIInterviewSessions } from '@/shared/lib/aiInterview/aiInterviewStorage';
import { getAssessments } from '@/shared/lib/mockAssessmentStorage';
import { getBackgroundChecks } from '@/shared/lib/mockBackgroundCheckStorage';
import type { AIInterviewSession } from '@/shared/types/aiInterview';
import type { Assessment } from '@/shared/types/assessment';
import type { BackgroundCheck } from '@/shared/types/backgroundCheck';

// Mock pricing - in production, these would come from pricing config
const PRICING = {
  aiInterview: { base: 50, perMinute: 2 },
  assessment: { technical: 75, personality: 50, skills: 60 },
  backgroundCheck: { 
    criminal: 100, 
    employment: 75, 
    education: 60, 
    reference: 50,
    credit: 90,
    identity: 40
  }
};

interface CombinedMetrics {
  totalRevenue: number;
  totalServices: number;
  avgMargin: number;
  clientAdoptionRate: number;
  breakdown: {
    aiInterviews: { count: number; revenue: number };
    assessments: { count: number; revenue: number };
    backgroundChecks: { count: number; revenue: number };
  };
}

interface RevenueTrend {
  date: string;
  aiInterviews: number;
  assessments: number;
  backgroundChecks: number;
  total: number;
}

export function calculateAIInterviewRevenue(session: AIInterviewSession): number {
  if (session.status !== 'completed') return 0;
  const duration = session.duration || 30;
  return PRICING.aiInterview.base + (duration * PRICING.aiInterview.perMinute);
}

export function calculateAssessmentRevenue(assessment: Assessment): number {
  if (assessment.status !== 'completed') return 0;
  const type = assessment.assessmentType;
  if (type.includes('technical')) return PRICING.assessment.technical;
  if (type.includes('personality')) return PRICING.assessment.personality;
  return PRICING.assessment.skills;
}

export function calculateBackgroundCheckRevenue(check: BackgroundCheck): number {
  if (check.status !== 'completed') return 0;
  return check.checkTypes.reduce((sum, type) => {
    const checkType = type.type;
    return sum + (PRICING.backgroundCheck[checkType as keyof typeof PRICING.backgroundCheck] || 0);
  }, 0);
}

export function getCombinedAddonMetrics(): CombinedMetrics {
  const aiSessions = getAIInterviewSessions();
  const assessments = getAssessments();
  const checks = getBackgroundChecks();

  const aiRevenue = aiSessions.reduce((sum, s) => sum + calculateAIInterviewRevenue(s), 0);
  const assessmentRevenue = assessments.reduce((sum, a) => sum + calculateAssessmentRevenue(a), 0);
  const checkRevenue = checks.reduce((sum, c) => sum + calculateBackgroundCheckRevenue(c), 0);

  const totalRevenue = aiRevenue + assessmentRevenue + checkRevenue;
  const totalServices = aiSessions.length + assessments.length + checks.length;

  // Calculate profit margin (mock: assume 60% margin on add-ons)
  const avgMargin = 60;

  // Calculate client adoption - mock: count unique client IDs
  const uniqueClients = new Set([
    ...aiSessions.map(s => s.candidateId),
    ...assessments.map(a => a.candidateId),
    ...checks.map(c => c.candidateId)
  ]);
  
  // Mock: assume 150 total clients
  const clientAdoptionRate = (uniqueClients.size / 150) * 100;

  return {
    totalRevenue,
    totalServices,
    avgMargin,
    clientAdoptionRate,
    breakdown: {
      aiInterviews: { count: aiSessions.length, revenue: aiRevenue },
      assessments: { count: assessments.length, revenue: assessmentRevenue },
      backgroundChecks: { count: checks.length, revenue: checkRevenue }
    }
  };
}

export function getAddonRevenueTrends(months: number = 6): RevenueTrend[] {
  const trends: RevenueTrend[] = [];
  const today = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const dateStr = date.toISOString().slice(0, 7);

    // Mock data - in production, filter by date
    const baseRevenue = 5000 + Math.random() * 3000;
    const growth = 1 + (i * 0.15);

    trends.push({
      date: dateStr,
      aiInterviews: Math.round(baseRevenue * 0.35 * growth),
      assessments: Math.round(baseRevenue * 0.4 * growth),
      backgroundChecks: Math.round(baseRevenue * 0.25 * growth),
      total: Math.round(baseRevenue * growth)
    });
  }

  return trends;
}

export function getServiceMixDistribution() {
  const metrics = getCombinedAddonMetrics();
  
  return [
    { 
      name: 'AI Interviews', 
      value: metrics.breakdown.aiInterviews.revenue,
      count: metrics.breakdown.aiInterviews.count,
      color: 'hsl(var(--chart-1))'
    },
    { 
      name: 'Assessments', 
      value: metrics.breakdown.assessments.revenue,
      count: metrics.breakdown.assessments.count,
      color: 'hsl(var(--chart-2))'
    },
    { 
      name: 'Background Checks', 
      value: metrics.breakdown.backgroundChecks.revenue,
      count: metrics.breakdown.backgroundChecks.count,
      color: 'hsl(var(--chart-3))'
    }
  ];
}

export function getClientAdoptionStats() {
  // Mock data for client adoption patterns
  return {
    usingOne: 45,
    usingTwo: 32,
    usingAll: 23,
    breakdown: {
      aiOnly: 18,
      assessmentOnly: 15,
      checkOnly: 12,
      aiAndAssessment: 15,
      aiAndCheck: 10,
      assessmentAndCheck: 7,
      allThree: 23
    }
  };
}
