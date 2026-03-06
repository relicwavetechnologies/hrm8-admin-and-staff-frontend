import { ChurnPrediction, ChurnRiskLevel, ChurnMetrics, InterventionStrategy } from '@/shared/types/churnPrediction';
import { subDays, addDays, format } from 'date-fns';

const serviceTypes = ['Background Checks', 'Skills Assessment', 'Video Interviewing', 'Reference Checks', 'Payroll'];
const companyNames = [
  'TechCorp Solutions', 'Global Industries Inc', 'Innovation Labs', 'Enterprise Systems',
  'Digital Dynamics', 'Future Tech Co', 'Apex Corporation', 'Nexus Solutions',
  'Vertex Systems', 'Quantum Enterprises', 'Stellar Corp', 'Prime Industries',
  'Catalyst Group', 'Momentum LLC', 'Synergy Partners', 'Elevation Corp'
];

const getRiskLevel = (probability: number): ChurnRiskLevel => {
  if (probability >= 75) return 'critical';
  if (probability >= 50) return 'high';
  if (probability >= 25) return 'medium';
  return 'low';
};

const generateInterventions = (riskLevel: ChurnRiskLevel, _probability: number): InterventionStrategy[] => {
  const baseInterventions: InterventionStrategy[] = [
    {
      id: 'int-1',
      type: 'outreach',
      title: 'Schedule Executive Check-in',
      description: 'Have a senior account manager reach out to understand concerns and discuss value delivery',
      priority: 'high',
      estimatedImpact: 15,
      cost: 'low',
      timeframe: 'This week'
    },
    {
      id: 'int-2',
      type: 'training',
      title: 'Product Training Session',
      description: 'Offer personalized training to increase feature adoption and engagement',
      priority: 'medium',
      estimatedImpact: 12,
      cost: 'low',
      timeframe: '1-2 weeks'
    },
    {
      id: 'int-3',
      type: 'discount',
      title: 'Loyalty Discount Offer',
      description: 'Provide 15% discount for early renewal to incentivize commitment',
      priority: 'medium',
      estimatedImpact: 20,
      cost: 'high',
      timeframe: 'Before renewal'
    },
    {
      id: 'int-4',
      type: 'upgrade',
      title: 'Feature Upgrade Trial',
      description: 'Offer free trial of premium features to demonstrate additional value',
      priority: 'medium',
      estimatedImpact: 18,
      cost: 'medium',
      timeframe: '2-4 weeks'
    },
    {
      id: 'int-5',
      type: 'support',
      title: 'Dedicated Support Assignment',
      description: 'Assign a dedicated support specialist for faster issue resolution',
      priority: 'high',
      estimatedImpact: 10,
      cost: 'medium',
      timeframe: 'Immediate'
    }
  ];

  if (riskLevel === 'critical') {
    return baseInterventions.slice(0, 4);
  } else if (riskLevel === 'high') {
    return baseInterventions.slice(0, 3);
  } else {
    return baseInterventions.slice(0, 2);
  }
};

export const getChurnPredictions = (): ChurnPrediction[] => {
  return Array.from({ length: 16 }, (_, i) => {
    const churnProbability = Math.max(10, Math.min(95, 70 - (i * 5) + (Math.random() * 20 - 10)));
    const riskLevel = getRiskLevel(churnProbability);
    const daysUntilRenewal = Math.floor(Math.random() * 90) + 10;
    const monthlyValue = Math.floor(Math.random() * 8000) + 2000;
    const loginFrequency = Math.max(1, Math.floor((100 - churnProbability) / 5) + (Math.random() * 5 - 2));
    const featureUsage = Math.max(10, Math.floor((100 - churnProbability) + (Math.random() * 20 - 10)));

    const prediction: ChurnPrediction = {
      customerId: `cust-${1000 + i}`,
      customerName: `Customer ${i + 1}`,
      companyName: companyNames[i],
      serviceType: serviceTypes[i % serviceTypes.length],
      churnProbability: Math.round(churnProbability),
      riskLevel,
      monthlyValue,
      lifetimeValue: monthlyValue * (12 + Math.floor(Math.random() * 24)),
      contractEndDate: format(addDays(new Date(), daysUntilRenewal), 'yyyy-MM-dd'),
      daysUntilRenewal,
      riskFactors: [
        {
          id: 'rf-1',
          category: 'engagement',
          name: 'Login Frequency',
          impact: Math.round(churnProbability * 0.3),
          trend: loginFrequency < 5 ? 'decreasing' : 'stable',
          value: `${loginFrequency} per month`
        },
        {
          id: 'rf-2',
          category: 'usage',
          name: 'Feature Adoption',
          impact: Math.round(churnProbability * 0.25),
          trend: featureUsage < 40 ? 'decreasing' : 'stable',
          value: `${featureUsage}%`
        },
        {
          id: 'rf-3',
          category: 'payment',
          name: 'Payment History',
          impact: Math.round(churnProbability * 0.2),
          trend: Math.random() > 0.7 ? 'increasing' : 'stable',
          value: Math.random() > 0.8 ? 'Late payments' : 'On-time'
        },
        {
          id: 'rf-4',
          category: 'support',
          name: 'Support Tickets',
          impact: Math.round(churnProbability * 0.15),
          trend: Math.random() > 0.6 ? 'increasing' : 'stable',
          value: `${Math.floor(Math.random() * 8)} this month`
        },
        {
          id: 'rf-5',
          category: 'satisfaction',
          name: 'NPS Score',
          impact: Math.round(churnProbability * 0.1),
          trend: Math.random() > 0.5 ? 'decreasing' : 'stable',
          value: `${Math.floor(Math.random() * 30) + 20}`
        }
      ],
      engagement: {
        loginFrequency,
        featureUsage,
        lastActivity: format(subDays(new Date(), Math.floor(Math.random() * 30)), 'yyyy-MM-dd'),
        activityTrend: Math.round((Math.random() * 60) - 30),
        supportTickets: Math.floor(Math.random() * 8),
        npsScore: Math.floor(Math.random() * 30) + 20
      },
      interventions: generateInterventions(riskLevel, churnProbability),
      predictedChurnDate: churnProbability > 60
        ? format(addDays(new Date(), daysUntilRenewal + Math.floor(Math.random() * 30)), 'yyyy-MM-dd')
        : undefined,
      confidenceScore: Math.round(75 + Math.random() * 20),
      lastUpdated: new Date().toISOString()
    };

    return prediction;
  }).sort((a, b) => b.churnProbability - a.churnProbability);
};

export const getChurnMetrics = (): ChurnMetrics => {
  const predictions = getChurnPredictions();
  const atRisk = predictions.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical');

  return {
    totalAtRisk: atRisk.length,
    criticalRisk: predictions.filter(p => p.riskLevel === 'critical').length,
    highRisk: predictions.filter(p => p.riskLevel === 'high').length,
    atRiskRevenue: atRisk.reduce((sum, p) => sum + p.monthlyValue, 0),
    averageChurnProbability: Math.round(
      predictions.reduce((sum, p) => sum + p.churnProbability, 0) / predictions.length
    ),
    preventableChurnValue: Math.round(atRisk.reduce((sum, p) => sum + p.lifetimeValue, 0) * 0.65),
    interventionSuccessRate: 68,
    monthlyChurnRate: 4.2
  };
};

export const getChurnTrendData = () => {
  const months = 6;
  return Array.from({ length: months }, (_, i) => {
    const date = subDays(new Date(), (months - i - 1) * 30);
    return {
      month: format(date, 'MMM yyyy'),
      churnRate: 3 + Math.random() * 3,
      atRisk: Math.floor(10 + Math.random() * 15),
      prevented: Math.floor(5 + Math.random() * 10)
    };
  });
};

export const getEngagementTrendData = (_customerId: string) => {
  const weeks = 12;
  return Array.from({ length: weeks }, (_, i) => {
    const date = subDays(new Date(), (weeks - i - 1) * 7);
    return {
      week: format(date, 'MMM dd'),
      logins: Math.floor(2 + Math.random() * 8),
      featureUsage: Math.floor(40 + Math.random() * 40),
      supportTickets: Math.floor(Math.random() * 3)
    };
  });
};
