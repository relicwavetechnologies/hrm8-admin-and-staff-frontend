export type HealthGrade = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
export type HealthTrend = 'improving' | 'stable' | 'declining' | 'rapidly-declining';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface HealthFactor {
  id: string;
  category: 'engagement' | 'usage' | 'satisfaction' | 'support' | 'financial';
  name: string;
  score: number; // 0-100
  weight: number; // 0-1 (contribution to overall score)
  trend: HealthTrend;
  details: string;
}

export interface HealthAlert {
  id: string;
  customerId: string;
  severity: AlertSeverity;
  type: 'score_drop' | 'engagement_drop' | 'support_spike' | 'nps_decline' | 'payment_issue';
  title: string;
  message: string;
  threshold: number;
  currentValue: number;
  triggeredAt: string;
  acknowledged: boolean;
  recommendedAction?: string;
}

export interface CustomerHealthScore {
  customerId: string;
  customerName: string;
  companyName: string;
  serviceType: string;
  overallScore: number; // 0-100
  healthGrade: HealthGrade;
  previousScore: number;
  scoreChange: number;
  trend: HealthTrend;
  factors: HealthFactor[];
  alerts: HealthAlert[];
  lastUpdated: string;
  monthlyValue: number;
  lifetimeValue: number;
  daysAsCustomer: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface HealthMetrics {
  totalCustomers: number;
  excellentHealth: number;
  goodHealth: number;
  fairHealth: number;
  poorHealth: number;
  criticalHealth: number;
  averageScore: number;
  improving: number;
  declining: number;
  activeAlerts: number;
  criticalAlerts: number;
}

export interface HealthTrendData {
  date: string;
  averageScore: number;
  excellent: number;
  good: number;
  fair: number;
  poor: number;
  critical: number;
}
