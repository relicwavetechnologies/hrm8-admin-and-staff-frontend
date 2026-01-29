import type { PredictiveMetric, TrendAnalysis, DepartmentComparison, SkillGapAnalysis, WorkforceInsight } from '@/shared/types/advancedAnalytics';

// Mock data for predictive metrics
export const mockPredictiveMetrics: PredictiveMetric[] = [
  {
    id: '1',
    metricName: 'Employee Turnover Rate',
    currentValue: 12.5,
    predictedValue: 15.2,
    predictedDate: '2024-06-30',
    confidence: 78,
    trend: 'up',
    category: 'turnover'
  },
  {
    id: '2',
    metricName: 'Average Performance Score',
    currentValue: 4.2,
    predictedValue: 4.4,
    predictedDate: '2024-06-30',
    confidence: 82,
    trend: 'up',
    category: 'performance'
  },
  {
    id: '3',
    metricName: 'Employee Engagement Index',
    currentValue: 7.8,
    predictedValue: 7.5,
    predictedDate: '2024-06-30',
    confidence: 71,
    trend: 'down',
    category: 'engagement'
  }
];

export const mockTrendAnalysis: TrendAnalysis[] = [
  {
    id: '1',
    metric: 'Headcount',
    period: '6 months',
    dataPoints: [
      { date: '2024-01', value: 245 },
      { date: '2024-02', value: 251 },
      { date: '2024-03', value: 258 },
      { date: '2024-04', value: 264 },
      { date: '2024-05', value: 272 },
      { date: '2024-06', value: 280 }
    ],
    changePercent: 14.3,
    insights: ['Steady growth of 5.8 employees per month', 'Strongest growth in Engineering and Sales']
  }
];

export const mockDepartmentComparisons: DepartmentComparison[] = [
  {
    department: 'Engineering',
    headcount: 85,
    avgSalary: 95000,
    avgTenure: 3.2,
    turnoverRate: 8.5,
    performanceScore: 4.3,
    engagementScore: 8.1
  },
  {
    department: 'Sales',
    headcount: 62,
    avgSalary: 72000,
    avgTenure: 2.1,
    turnoverRate: 18.2,
    performanceScore: 4.0,
    engagementScore: 7.2
  },
  {
    department: 'Marketing',
    headcount: 28,
    avgSalary: 68000,
    avgTenure: 2.8,
    turnoverRate: 12.5,
    performanceScore: 4.2,
    engagementScore: 7.8
  },
  {
    department: 'HR',
    headcount: 15,
    avgSalary: 65000,
    avgTenure: 4.1,
    turnoverRate: 6.7,
    performanceScore: 4.4,
    engagementScore: 8.5
  }
];

export const mockSkillGaps: SkillGapAnalysis[] = [
  {
    id: '1',
    skillName: 'Machine Learning',
    requiredLevel: 4,
    currentLevel: 2,
    gap: 2,
    affectedEmployees: 12,
    departmentsAffected: ['Engineering', 'Data Science'],
    priority: 'high',
    recommendedActions: ['Enroll in ML certification program', 'Hire senior ML engineers', 'Partner with universities']
  },
  {
    id: '2',
    skillName: 'Cloud Architecture (AWS)',
    requiredLevel: 4,
    currentLevel: 3,
    gap: 1,
    affectedEmployees: 18,
    departmentsAffected: ['Engineering', 'DevOps'],
    priority: 'medium',
    recommendedActions: ['AWS certification training', 'Hands-on cloud migration projects']
  }
];

export const mockWorkforceInsights: WorkforceInsight[] = [
  {
    id: '1',
    type: 'risk',
    title: 'High Turnover Risk in Sales',
    description: 'Sales department showing 18% turnover, 2x company average. Exit interviews cite lack of career progression.',
    impact: 'high',
    actionable: true,
    suggestedActions: ['Implement sales career ladder', 'Increase training budget', 'Review compensation structure'],
    relatedMetrics: ['turnover', 'engagement'],
    createdAt: '2024-03-15'
  },
  {
    id: '2',
    type: 'opportunity',
    title: 'Strong Performance in Engineering',
    description: 'Engineering team exceeding performance targets with 8.1 engagement score. Consider expansion.',
    impact: 'medium',
    actionable: true,
    suggestedActions: ['Open 5-10 new engineering positions', 'Invest in advanced tools', 'Expand R&D budget'],
    relatedMetrics: ['performance', 'engagement'],
    createdAt: '2024-03-14'
  }
];

export function getPredictiveMetrics(): PredictiveMetric[] {
  return mockPredictiveMetrics;
}

export function getTrendAnalysis(): TrendAnalysis[] {
  return mockTrendAnalysis;
}

export function getDepartmentComparisons(): DepartmentComparison[] {
  return mockDepartmentComparisons;
}

export function getSkillGaps(): SkillGapAnalysis[] {
  return mockSkillGaps;
}

export function getWorkforceInsights(): WorkforceInsight[] {
  return mockWorkforceInsights;
}
