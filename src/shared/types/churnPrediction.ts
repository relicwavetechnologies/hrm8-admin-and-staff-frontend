export type ChurnRiskLevel = 'critical' | 'high' | 'medium' | 'low';
export type InterventionType = 'outreach' | 'discount' | 'training' | 'upgrade' | 'support';

export interface ChurnRiskFactor {
  id: string;
  category: 'engagement' | 'usage' | 'payment' | 'support' | 'satisfaction';
  name: string;
  impact: number; // 0-100
  trend: 'increasing' | 'stable' | 'decreasing';
  value: string;
}

export interface InterventionStrategy {
  id: string;
  type: InterventionType;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: number; // percentage points reduction in churn probability
  cost: 'low' | 'medium' | 'high';
  timeframe: string;
}

export interface CustomerEngagement {
  loginFrequency: number; // per month
  featureUsage: number; // 0-100
  lastActivity: string;
  activityTrend: number; // percentage change
  supportTickets: number;
  npsScore?: number;
}

export interface ChurnPrediction {
  customerId: string;
  customerName: string;
  companyName: string;
  serviceType: string;
  churnProbability: number; // 0-100
  riskLevel: ChurnRiskLevel;
  monthlyValue: number;
  lifetimeValue: number;
  contractEndDate: string;
  daysUntilRenewal: number;
  riskFactors: ChurnRiskFactor[];
  engagement: CustomerEngagement;
  interventions: InterventionStrategy[];
  predictedChurnDate?: string;
  confidenceScore: number; // 0-100
  lastUpdated: string;
}

export interface ChurnMetrics {
  totalAtRisk: number;
  criticalRisk: number;
  highRisk: number;
  atRiskRevenue: number;
  averageChurnProbability: number;
  preventableChurnValue: number;
  interventionSuccessRate: number;
  monthlyChurnRate: number;
}
