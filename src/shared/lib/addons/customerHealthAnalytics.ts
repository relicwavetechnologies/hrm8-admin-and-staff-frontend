import { CustomerHealthScore, HealthGrade, HealthTrend, HealthMetrics, HealthAlert, HealthFactor, HealthTrendData } from '@/shared/types/customerHealth';
import { subDays, format } from 'date-fns';

const serviceTypes = ['Background Checks', 'Skills Assessment', 'Video Interviewing', 'Reference Checks', 'Payroll'];
const companyNames = [
  'TechCorp Solutions', 'Global Industries Inc', 'Innovation Labs', 'Enterprise Systems',
  'Digital Dynamics', 'Future Tech Co', 'Apex Corporation', 'Nexus Solutions',
  'Vertex Systems', 'Quantum Enterprises', 'Stellar Corp', 'Prime Industries',
  'Catalyst Group', 'Momentum LLC', 'Synergy Partners', 'Elevation Corp',
  'Summit Technologies', 'Horizon Corp', 'Pinnacle Systems', 'Zenith Enterprises'
];

const getHealthGrade = (score: number): HealthGrade => {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'fair';
  if (score >= 30) return 'poor';
  return 'critical';
};

const getHealthTrend = (scoreChange: number): HealthTrend => {
  if (scoreChange <= -10) return 'rapidly-declining';
  if (scoreChange < -3) return 'declining';
  if (scoreChange > 3) return 'improving';
  return 'stable';
};

const getRiskLevel = (score: number): 'low' | 'medium' | 'high' | 'critical' => {
  if (score < 30) return 'critical';
  if (score < 50) return 'high';
  if (score < 70) return 'medium';
  return 'low';
};

const generateHealthFactors = (baseScore: number): HealthFactor[] => {
  const variation = (Math.random() * 20) - 10;
  
  return [
    {
      id: 'hf-1',
      category: 'engagement',
      name: 'Login Frequency',
      score: Math.max(0, Math.min(100, baseScore + variation)),
      weight: 0.25,
      trend: baseScore > 70 ? 'stable' : baseScore > 50 ? 'declining' : 'rapidly-declining',
      details: `${Math.floor(baseScore / 10)} logins per month`
    },
    {
      id: 'hf-2',
      category: 'usage',
      name: 'Feature Adoption',
      score: Math.max(0, Math.min(100, baseScore + (Math.random() * 15 - 7))),
      weight: 0.30,
      trend: baseScore > 65 ? 'improving' : 'stable',
      details: `${Math.floor((baseScore + variation) / 100 * 12)} of 12 features used`
    },
    {
      id: 'hf-3',
      category: 'satisfaction',
      name: 'NPS Score',
      score: Math.max(0, Math.min(100, baseScore + (Math.random() * 10 - 5))),
      weight: 0.20,
      trend: baseScore > 60 ? 'stable' : 'declining',
      details: `Score: ${Math.floor(baseScore * 0.9 - 40)}`
    },
    {
      id: 'hf-4',
      category: 'support',
      name: 'Support Satisfaction',
      score: Math.max(0, Math.min(100, baseScore + (Math.random() * 12 - 6))),
      weight: 0.15,
      trend: 'stable',
      details: `${Math.floor(5 - (baseScore / 25))} open tickets`
    },
    {
      id: 'hf-5',
      category: 'financial',
      name: 'Payment Health',
      score: Math.max(0, Math.min(100, baseScore + (Math.random() * 8 - 4))),
      weight: 0.10,
      trend: baseScore > 80 ? 'stable' : 'declining',
      details: baseScore > 70 ? 'All payments on-time' : 'Recent late payment'
    }
  ];
};

const generateHealthAlerts = (score: number, scoreChange: number, customerId: string): HealthAlert[] => {
  const alerts: HealthAlert[] = [];
  
  if (scoreChange < -10) {
    alerts.push({
      id: `alert-${customerId}-1`,
      customerId,
      severity: 'critical',
      type: 'score_drop',
      title: 'Significant Health Score Drop',
      message: `Health score dropped ${Math.abs(scoreChange).toFixed(1)} points in the last 30 days`,
      threshold: -10,
      currentValue: scoreChange,
      triggeredAt: new Date().toISOString(),
      acknowledged: false,
      recommendedAction: 'Schedule immediate check-in call with customer success team'
    });
  }
  
  if (score < 50) {
    alerts.push({
      id: `alert-${customerId}-2`,
      customerId,
      severity: score < 30 ? 'critical' : 'warning',
      type: 'engagement_drop',
      title: 'Low Engagement Detected',
      message: 'Customer engagement has fallen below acceptable levels',
      threshold: 50,
      currentValue: score,
      triggeredAt: subDays(new Date(), Math.floor(Math.random() * 5)).toISOString(),
      acknowledged: Math.random() > 0.5,
      recommendedAction: 'Initiate re-engagement campaign with product training offer'
    });
  }
  
  if (Math.random() > 0.7 && score < 70) {
    alerts.push({
      id: `alert-${customerId}-3`,
      customerId,
      severity: 'warning',
      type: 'support_spike',
      title: 'Increased Support Activity',
      message: 'Support ticket volume has increased by 150% this month',
      threshold: 50,
      currentValue: 150,
      triggeredAt: subDays(new Date(), Math.floor(Math.random() * 10)).toISOString(),
      acknowledged: false,
      recommendedAction: 'Review common issues and provide proactive solutions'
    });
  }
  
  return alerts;
};

export const getCustomerHealthScores = (): CustomerHealthScore[] => {
  return companyNames.map((company, i) => {
    const baseScore = Math.max(20, Math.min(95, 75 - (i * 3) + (Math.random() * 25 - 12)));
    const previousScore = baseScore + (Math.random() * 15 - 7);
    const scoreChange = baseScore - previousScore;
    const daysAsCustomer = 30 + Math.floor(Math.random() * 700);
    const monthlyValue = Math.floor(Math.random() * 8000) + 2000;
    
    const healthScore: CustomerHealthScore = {
      customerId: `cust-${1000 + i}`,
      customerName: `Customer ${i + 1}`,
      companyName: company,
      serviceType: serviceTypes[i % serviceTypes.length],
      overallScore: Math.round(baseScore),
      healthGrade: getHealthGrade(baseScore),
      previousScore: Math.round(previousScore),
      scoreChange: Math.round(scoreChange),
      trend: getHealthTrend(scoreChange),
      factors: generateHealthFactors(baseScore),
      alerts: generateHealthAlerts(baseScore, scoreChange, `cust-${1000 + i}`),
      lastUpdated: new Date().toISOString(),
      monthlyValue,
      lifetimeValue: monthlyValue * Math.floor(daysAsCustomer / 30),
      daysAsCustomer,
      riskLevel: getRiskLevel(baseScore)
    };
    
    return healthScore;
  }).sort((a, b) => a.overallScore - b.overallScore);
};

export const getHealthMetrics = (): HealthMetrics => {
  const scores = getCustomerHealthScores();
  
  return {
    totalCustomers: scores.length,
    excellentHealth: scores.filter(s => s.healthGrade === 'excellent').length,
    goodHealth: scores.filter(s => s.healthGrade === 'good').length,
    fairHealth: scores.filter(s => s.healthGrade === 'fair').length,
    poorHealth: scores.filter(s => s.healthGrade === 'poor').length,
    criticalHealth: scores.filter(s => s.healthGrade === 'critical').length,
    averageScore: Math.round(scores.reduce((sum, s) => sum + s.overallScore, 0) / scores.length),
    improving: scores.filter(s => s.trend === 'improving').length,
    declining: scores.filter(s => s.trend === 'declining' || s.trend === 'rapidly-declining').length,
    activeAlerts: scores.reduce((sum, s) => sum + s.alerts.filter(a => !a.acknowledged).length, 0),
    criticalAlerts: scores.reduce((sum, s) => sum + s.alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length, 0)
  };
};

export const getHealthTrendData = (): HealthTrendData[] => {
  const weeks = 12;
  return Array.from({ length: weeks }, (_, i) => {
    const date = subDays(new Date(), (weeks - i - 1) * 7);
    const avgScore = 72 + (Math.random() * 10 - 5);
    
    return {
      date: format(date, 'MMM dd'),
      averageScore: Math.round(avgScore),
      excellent: Math.floor(3 + Math.random() * 3),
      good: Math.floor(6 + Math.random() * 4),
      fair: Math.floor(4 + Math.random() * 3),
      poor: Math.floor(2 + Math.random() * 2),
      critical: Math.floor(1 + Math.random() * 2)
    };
  });
};

export const getAllHealthAlerts = (): HealthAlert[] => {
  const scores = getCustomerHealthScores();
  return scores
    .flatMap(s => s.alerts)
    .filter(a => !a.acknowledged)
    .sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
};

export const getHealthFactorAverages = () => {
  const scores = getCustomerHealthScores();
  const factorsByCategory: { [key: string]: number[] } = {};
  
  scores.forEach(score => {
    score.factors.forEach(factor => {
      if (!factorsByCategory[factor.name]) {
        factorsByCategory[factor.name] = [];
      }
      factorsByCategory[factor.name].push(factor.score);
    });
  });
  
  return Object.entries(factorsByCategory).map(([name, scores]) => ({
    name,
    average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    category: name
  })).sort((a, b) => b.average - a.average);
};
