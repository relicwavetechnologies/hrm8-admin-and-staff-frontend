import { differenceInDays } from 'date-fns';
import type { RPOContractSummary, RPODashboardMetrics } from './rpoTrackingUtils';
import { getRPODashboardMetrics } from './rpoTrackingUtils';

export type RenewalUrgency = 'critical' | 'urgent' | 'upcoming';
export type RenewalRecommendation = 'strongly-recommend' | 'recommend' | 'review-needed' | 'not-recommended';

export interface ContractPerformanceMetrics {
  placementSuccessRate: number; // percentage
  averageTimeToFill: number; // days
  candidateQualityScore: number; // 0-100
  clientSatisfactionScore: number; // 0-100
  budgetAdherence: number; // percentage
  communicationRating: number; // 0-5
}

export interface RenewalAlert {
  contract: RPOContractSummary;
  daysUntilExpiry: number;
  urgency: RenewalUrgency;
  expiryDate: string;

  // Performance data
  performance: ContractPerformanceMetrics;

  // Renewal recommendation
  recommendation: RenewalRecommendation;
  recommendationReason: string;

  // Suggested actions
  suggestedActions: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    description: string;
  }>;

  // Financial projections
  currentContractValue: number;
  projectedRenewalValue: number;
  potentialRevenueImpact: number; // if not renewed
}

function generatePerformanceMetrics(contract: RPOContractSummary): ContractPerformanceMetrics {
  // In a real system, these would come from actual tracking data
  // For now, generating realistic-looking metrics based on contract data

  const placementRate = contract.targetPlacements
    ? Math.min(100, (contract.currentPlacements / contract.targetPlacements) * 100)
    : 75 + Math.random() * 20; // 75-95%

  return {
    placementSuccessRate: Math.round(placementRate),
    averageTimeToFill: Math.round(30 + Math.random() * 30), // 30-60 days
    candidateQualityScore: Math.round(70 + Math.random() * 25), // 70-95
    clientSatisfactionScore: Math.round(75 + Math.random() * 20), // 75-95
    budgetAdherence: Math.round(90 + Math.random() * 10), // 90-100%
    communicationRating: 3.5 + Math.random() * 1.5, // 3.5-5.0
  };
}

function determineRecommendation(
  performance: ContractPerformanceMetrics,
  _contract: RPOContractSummary
): { recommendation: RenewalRecommendation; reason: string } {
  const avgScore = (
    performance.placementSuccessRate +
    performance.candidateQualityScore +
    performance.clientSatisfactionScore
  ) / 3;

  if (avgScore >= 85 && performance.communicationRating >= 4.0) {
    return {
      recommendation: 'strongly-recommend',
      reason: 'Excellent performance metrics and high client satisfaction. Strong partnership opportunity.'
    };
  } else if (avgScore >= 75 && performance.communicationRating >= 3.5) {
    return {
      recommendation: 'recommend',
      reason: 'Solid performance with good client satisfaction. Recommend renewal with potential improvements.'
    };
  } else if (avgScore >= 65) {
    return {
      recommendation: 'review-needed',
      reason: 'Mixed performance results. Recommend detailed review and discussion with client before renewal.'
    };
  } else {
    return {
      recommendation: 'not-recommended',
      reason: 'Below-target performance. Recommend addressing issues before considering renewal.'
    };
  }
}

function generateSuggestedActions(
  performance: ContractPerformanceMetrics,
  recommendation: RenewalRecommendation,
  daysUntilExpiry: number
): Array<{ action: string; priority: 'high' | 'medium' | 'low'; description: string }> {
  const actions: Array<{ action: string; priority: 'high' | 'medium' | 'low'; description: string }> = [];

  // Time-based actions
  if (daysUntilExpiry <= 30) {
    actions.push({
      action: 'Schedule Renewal Meeting',
      priority: 'high',
      description: 'Arrange immediate meeting with client to discuss renewal terms and address any concerns.'
    });
  } else if (daysUntilExpiry <= 60) {
    actions.push({
      action: 'Initiate Renewal Discussion',
      priority: 'high',
      description: 'Start preliminary discussions about contract renewal and gather client feedback.'
    });
  }

  // Performance-based actions
  if (performance.placementSuccessRate < 80) {
    actions.push({
      action: 'Review Placement Strategy',
      priority: 'high',
      description: 'Analyze and improve recruitment strategies to increase placement success rate.'
    });
  }

  if (performance.clientSatisfactionScore < 80) {
    actions.push({
      action: 'Client Satisfaction Survey',
      priority: 'high',
      description: 'Conduct detailed satisfaction survey to identify areas for improvement.'
    });
  }

  if (performance.averageTimeToFill > 45) {
    actions.push({
      action: 'Optimize Time-to-Fill',
      priority: 'medium',
      description: 'Review and streamline recruitment process to reduce time-to-fill metrics.'
    });
  }

  if (performance.communicationRating < 4.0) {
    actions.push({
      action: 'Improve Communication',
      priority: 'medium',
      description: 'Establish more frequent touchpoints and improve reporting cadence.'
    });
  }

  // Recommendation-based actions
  if (recommendation === 'strongly-recommend' || recommendation === 'recommend') {
    actions.push({
      action: 'Prepare Renewal Proposal',
      priority: 'high',
      description: 'Create comprehensive renewal proposal highlighting achievements and value delivered.'
    });

    actions.push({
      action: 'Explore Expansion Opportunities',
      priority: 'medium',
      description: 'Identify potential for expanding service scope or adding new positions.'
    });
  }

  if (recommendation === 'review-needed' || recommendation === 'not-recommended') {
    actions.push({
      action: 'Performance Improvement Plan',
      priority: 'high',
      description: 'Develop and implement action plan to address performance gaps.'
    });

    actions.push({
      action: 'Executive Review Meeting',
      priority: 'high',
      description: 'Schedule senior leadership meeting to review contract status and recovery strategies.'
    });
  }

  // Financial actions
  actions.push({
    action: 'Review Pricing Structure',
    priority: 'medium',
    description: 'Analyze current rates and market conditions to prepare competitive renewal pricing.'
  });

  return actions.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

export async function getRenewalAlerts(): Promise<RenewalAlert[]> {
  const metrics: RPODashboardMetrics = await getRPODashboardMetrics();
  const activeContracts = metrics.contracts.filter(c => c.status === 'active' && c.endDate);

  const alerts: RenewalAlert[] = [];

  for (const contract of activeContracts) {
    if (!contract.endDate) continue;

    const daysUntilExpiry = differenceInDays(new Date(contract.endDate), new Date());

    // Only include contracts expiring within 60 days
    if (daysUntilExpiry <= 60 && daysUntilExpiry > 0) {
      const performance = generatePerformanceMetrics(contract);
      const { recommendation, reason } = determineRecommendation(performance, contract);
      const suggestedActions = generateSuggestedActions(performance, recommendation, daysUntilExpiry);

      let urgency: RenewalUrgency;
      if (daysUntilExpiry <= 30) {
        urgency = 'critical';
      } else if (daysUntilExpiry <= 45) {
        urgency = 'urgent';
      } else {
        urgency = 'upcoming';
      }

      // Calculate financial impact
      const monthlyRevenueLoss = contract.monthlyRetainer;
      // const remainingMonthsInYear = Math.min(12, Math.ceil(daysUntilExpiry / 30));
      const potentialRevenueImpact = monthlyRevenueLoss * 12; // Annual impact

      // Estimate renewal value (typically similar or slightly higher)
      const projectedRenewalValue = contract.totalContractValue * 1.05; // 5% increase

      alerts.push({
        contract,
        daysUntilExpiry,
        urgency,
        expiryDate: contract.endDate,
        performance,
        recommendation,
        recommendationReason: reason,
        suggestedActions,
        currentContractValue: contract.totalContractValue,
        projectedRenewalValue,
        potentialRevenueImpact,
      });
    }
  }

  // Sort by urgency and then by days until expiry
  return alerts.sort((a, b) => {
    const urgencyOrder = { critical: 0, urgent: 1, upcoming: 2 };
    if (a.urgency !== b.urgency) {
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    }
    return a.daysUntilExpiry - b.daysUntilExpiry;
  });
}

export async function getRenewalAlertsSummary() {
  const alerts = await getRenewalAlerts();

  return {
    total: alerts.length,
    critical: alerts.filter(a => a.urgency === 'critical').length,
    urgent: alerts.filter(a => a.urgency === 'urgent').length,
    upcoming: alerts.filter(a => a.urgency === 'upcoming').length,
    stronglyRecommended: alerts.filter(a => a.recommendation === 'strongly-recommend').length,
    recommended: alerts.filter(a => a.recommendation === 'recommend').length,
    reviewNeeded: alerts.filter(a => a.recommendation === 'review-needed').length,
    notRecommended: alerts.filter(a => a.recommendation === 'not-recommended').length,
    totalPotentialRevenue: alerts.reduce((sum, a) => sum + a.projectedRenewalValue, 0),
    totalRevenueAtRisk: alerts.reduce((sum, a) => sum + a.potentialRevenueImpact, 0),
  };
}
