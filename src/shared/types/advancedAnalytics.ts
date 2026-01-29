export interface PredictiveMetric {
  id: string;
  metricName: string;
  currentValue: number;
  predictedValue: number;
  predictedDate: string;
  confidence: number; // 0-100
  trend: 'up' | 'down' | 'stable';
  category: 'turnover' | 'performance' | 'engagement' | 'productivity' | 'cost';
}

export interface TrendAnalysis {
  id: string;
  metric: string;
  period: string;
  dataPoints: Array<{
    date: string;
    value: number;
  }>;
  changePercent: number;
  insights: string[];
}

export interface DepartmentComparison {
  department: string;
  headcount: number;
  avgSalary: number;
  avgTenure: number;
  turnoverRate: number;
  performanceScore: number;
  engagementScore: number;
}

export interface SkillGapAnalysis {
  id: string;
  skillName: string;
  requiredLevel: number; // 1-5
  currentLevel: number; // 1-5
  gap: number;
  affectedEmployees: number;
  departmentsAffected: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  recommendedActions: string[];
}

export interface WorkforceInsight {
  id: string;
  type: 'risk' | 'opportunity' | 'trend' | 'alert';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  suggestedActions?: string[];
  relatedMetrics?: string[];
  createdAt: string;
}
