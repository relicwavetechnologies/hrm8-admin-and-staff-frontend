import { format, subMonths } from 'date-fns';
import type { RPOContractSummary, RPODashboardMetrics } from './rpoTrackingUtils';
import { getRPODashboardMetrics } from './rpoTrackingUtils';

export interface ContractPerformanceMetrics {
  contractId: string;
  contractName: string;
  clientName: string;
  clientLogo?: string;

  // Placement metrics
  targetPlacements: number;
  actualPlacements: number;
  placementSuccessRate: number; // percentage

  // Time metrics
  averageTimeToFill: number; // days
  fastestTimeToFill: number; // days
  slowestTimeToFill: number; // days

  // Quality metrics
  candidateQualityScore: number; // 0-100
  retentionRate: number; // percentage - candidates still employed after 90 days
  clientSatisfactionScore: number; // 0-100

  // Efficiency metrics
  candidatesScreened: number;
  candidatesInterviewed: number;
  screenToInterviewRate: number; // percentage
  interviewToOfferRate: number; // percentage
  offerAcceptanceRate: number; // percentage

  // Financial metrics
  costPerHire: number;
  monthlyRetainer: number;
  totalContractValue: number;

  // Status
  status: string;
  startDate: string;
  duration: number; // months
}

export interface YearOverYearComparison {
  metric: string;
  currentYear: number;
  previousYear: number;
  change: number; // percentage change
  trend: 'up' | 'down' | 'stable';
}

export interface MonthlyPerformanceTrend {
  month: string;
  monthLabel: string;
  placements: number;
  averageTimeToFill: number;
  satisfactionScore: number;
  activeContracts: number;
}

export interface PerformanceBenchmark {
  metric: string;
  contractValue: number;
  industryAverage: number;
  topPerformer: number;
  status: 'above' | 'at' | 'below';
}

function generateContractMetrics(contract: RPOContractSummary): ContractPerformanceMetrics {
  // Generate realistic performance data based on contract info
  const targetPlacements = contract.targetPlacements || Math.round(contract.duration * 2.5);
  const actualPlacements = contract.currentPlacements || Math.round(targetPlacements * (0.7 + Math.random() * 0.3));
  const placementSuccessRate = targetPlacements > 0 ? Math.round((actualPlacements / targetPlacements) * 100) : 0;

  // Time metrics (in days)
  const averageTimeToFill = Math.round(30 + Math.random() * 30); // 30-60 days
  const fastestTimeToFill = Math.round(averageTimeToFill * 0.6); // 60% of average
  const slowestTimeToFill = Math.round(averageTimeToFill * 1.6); // 160% of average

  // Quality scores
  const candidateQualityScore = Math.round(70 + Math.random() * 25); // 70-95
  const retentionRate = Math.round(75 + Math.random() * 20); // 75-95%
  const clientSatisfactionScore = Math.round(75 + Math.random() * 20); // 75-95

  // Efficiency funnel
  const candidatesScreened = actualPlacements * Math.round(15 + Math.random() * 10); // 15-25 per placement
  const candidatesInterviewed = Math.round(candidatesScreened * (0.25 + Math.random() * 0.15)); // 25-40% of screened
  const screenToInterviewRate = candidatesScreened > 0 ? Math.round((candidatesInterviewed / candidatesScreened) * 100) : 0;
  const interviewToOfferRate = candidatesInterviewed > 0 ? Math.round((actualPlacements * 1.2 / candidatesInterviewed) * 100) : 0; // Some offers declined
  const offerAcceptanceRate = Math.round(75 + Math.random() * 20); // 75-95%

  // Financial
  const costPerHire = contract.monthlyRetainer > 0
    ? Math.round(contract.monthlyRetainer * contract.duration / Math.max(1, actualPlacements))
    : 0;

  return {
    contractId: contract.id,
    contractName: contract.name,
    clientName: contract.clientName,
    clientLogo: contract.clientLogo,
    targetPlacements,
    actualPlacements,
    placementSuccessRate,
    averageTimeToFill,
    fastestTimeToFill,
    slowestTimeToFill,
    candidateQualityScore,
    retentionRate,
    clientSatisfactionScore,
    candidatesScreened,
    candidatesInterviewed,
    screenToInterviewRate,
    interviewToOfferRate,
    offerAcceptanceRate,
    costPerHire,
    monthlyRetainer: contract.monthlyRetainer,
    totalContractValue: contract.totalContractValue,
    status: contract.status,
    startDate: contract.startDate,
    duration: contract.duration,
  };
}

export async function getAllContractPerformanceMetrics(): Promise<ContractPerformanceMetrics[]> {
  const metrics: RPODashboardMetrics = await getRPODashboardMetrics();
  return metrics.contracts
    .filter(c => c.status === 'active' || c.status === 'completed')
    .map(generateContractMetrics)
    .sort((a, b) => b.placementSuccessRate - a.placementSuccessRate);
}

export async function getPerformanceMetricsSummary() {
  const allMetrics = await getAllContractPerformanceMetrics();

  if (allMetrics.length === 0) {
    return {
      totalPlacements: 0,
      averagePlacementRate: 0,
      averageTimeToFill: 0,
      averageClientSatisfaction: 0,
      averageCostPerHire: 0,
      totalCandidatesScreened: 0,
      totalCandidatesInterviewed: 0,
      overallRetentionRate: 0,
      topPerformingContract: null,
    };
  }

  const totalPlacements = allMetrics.reduce((sum, m) => sum + m.actualPlacements, 0);
  const averagePlacementRate = Math.round(
    allMetrics.reduce((sum, m) => sum + m.placementSuccessRate, 0) / allMetrics.length
  );
  const averageTimeToFill = Math.round(
    allMetrics.reduce((sum, m) => sum + m.averageTimeToFill, 0) / allMetrics.length
  );
  const averageClientSatisfaction = Math.round(
    allMetrics.reduce((sum, m) => sum + m.clientSatisfactionScore, 0) / allMetrics.length
  );
  const averageCostPerHire = Math.round(
    allMetrics.reduce((sum, m) => sum + m.costPerHire, 0) / allMetrics.length
  );
  const totalCandidatesScreened = allMetrics.reduce((sum, m) => sum + m.candidatesScreened, 0);
  const totalCandidatesInterviewed = allMetrics.reduce((sum, m) => sum + m.candidatesInterviewed, 0);
  const overallRetentionRate = Math.round(
    allMetrics.reduce((sum, m) => sum + m.retentionRate, 0) / allMetrics.length
  );

  const topPerformingContract = allMetrics[0]; // Already sorted by placement rate

  return {
    totalPlacements,
    averagePlacementRate,
    averageTimeToFill,
    averageClientSatisfaction,
    averageCostPerHire,
    totalCandidatesScreened,
    totalCandidatesInterviewed,
    overallRetentionRate,
    topPerformingContract,
  };
}

export async function getYearOverYearComparison(): Promise<YearOverYearComparison[]> {
  // In a real system, this would compare actual data from previous year
  // For now, generating realistic comparison data

  const currentYearMetrics = await getPerformanceMetricsSummary();

  // Simulate previous year data with slight variations
  const generatePreviousYear = (current: number, variance: number = 0.1) => {
    return Math.round(current * (0.9 + Math.random() * variance));
  };

  const comparisons: YearOverYearComparison[] = [
    {
      metric: 'Total Placements',
      currentYear: currentYearMetrics.totalPlacements,
      previousYear: generatePreviousYear(currentYearMetrics.totalPlacements, 0.2),
      change: 0,
      trend: 'stable',
    },
    {
      metric: 'Placement Success Rate',
      currentYear: currentYearMetrics.averagePlacementRate,
      previousYear: generatePreviousYear(currentYearMetrics.averagePlacementRate, 0.15),
      change: 0,
      trend: 'stable',
    },
    {
      metric: 'Average Time-to-Fill (days)',
      currentYear: currentYearMetrics.averageTimeToFill,
      previousYear: generatePreviousYear(currentYearMetrics.averageTimeToFill, 0.2),
      change: 0,
      trend: 'stable',
    },
    {
      metric: 'Client Satisfaction',
      currentYear: currentYearMetrics.averageClientSatisfaction,
      previousYear: generatePreviousYear(currentYearMetrics.averageClientSatisfaction, 0.1),
      change: 0,
      trend: 'stable',
    },
    {
      metric: 'Cost Per Hire',
      currentYear: currentYearMetrics.averageCostPerHire,
      previousYear: generatePreviousYear(currentYearMetrics.averageCostPerHire, 0.15),
      change: 0,
      trend: 'stable',
    },
  ];

  // Calculate change and trend
  return comparisons.map(comp => {
    const change = comp.previousYear > 0
      ? Math.round(((comp.currentYear - comp.previousYear) / comp.previousYear) * 100)
      : 0;

    let trend: 'up' | 'down' | 'stable';
    // For time-to-fill and cost, down is good; for others, up is good
    const isInverseMetric = comp.metric.includes('Time-to-Fill') || comp.metric.includes('Cost');

    if (Math.abs(change) <= 5) {
      trend = 'stable';
    } else if (change > 0) {
      trend = isInverseMetric ? 'down' : 'up'; // Good if increasing non-cost metrics
    } else {
      trend = isInverseMetric ? 'up' : 'down'; // Bad if decreasing non-cost metrics
    }

    return { ...comp, change, trend };
  });
}

export function getMonthlyPerformanceTrend(months: number = 12): MonthlyPerformanceTrend[] {
  const trends: MonthlyPerformanceTrend[] = [];
  const now = new Date();

  // Generate data for past 12 months
  for (let i = months - 1; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const monthLabel = format(monthDate, 'MMM yyyy');
    const month = format(monthDate, 'yyyy-MM');

    // Generate realistic trending data
    const basePlacements = 15;
    const baseTimeToFill = 45;
    const baseSatisfaction = 85;

    // Add some trend and seasonality
    const trend = (months - i) * 0.5; // Slight improvement over time
    const seasonality = Math.sin((i / 12) * Math.PI * 2) * 3; // Seasonal variation

    trends.push({
      month,
      monthLabel,
      placements: Math.round(basePlacements + trend + seasonality),
      averageTimeToFill: Math.round(baseTimeToFill - trend + seasonality),
      satisfactionScore: Math.round(baseSatisfaction + (trend / 2) + seasonality),
      activeContracts: Math.round(3 + (i / 4)), // Growing number of contracts
    });
  }

  return trends;
}

export async function getPerformanceBenchmarks(): Promise<PerformanceBenchmark[]> {
  const summary = await getPerformanceMetricsSummary();

  const benchmarks: PerformanceBenchmark[] = [
    {
      metric: 'Placement Success Rate',
      contractValue: summary.averagePlacementRate,
      industryAverage: 82,
      topPerformer: 95,
      status: 'at',
    },
    {
      metric: 'Time-to-Fill (days)',
      contractValue: summary.averageTimeToFill,
      industryAverage: 42,
      topPerformer: 28,
      status: 'at',
    },
    {
      metric: 'Client Satisfaction',
      contractValue: summary.averageClientSatisfaction,
      industryAverage: 80,
      topPerformer: 92,
      status: 'at',
    },
    {
      metric: 'Retention Rate (90 days)',
      contractValue: summary.overallRetentionRate,
      industryAverage: 85,
      topPerformer: 95,
      status: 'at',
    },
  ];

  return benchmarks.map(bench => {
    let status: 'above' | 'at' | 'below';

    // For time-to-fill, lower is better
    if (bench.metric.includes('Time-to-Fill')) {
      if (bench.contractValue < bench.industryAverage * 0.95) {
        status = 'above';
      } else if (bench.contractValue > bench.industryAverage * 1.05) {
        status = 'below';
      } else {
        status = 'at';
      }
    } else {
      // For other metrics, higher is better
      if (bench.contractValue > bench.industryAverage * 1.05) {
        status = 'above';
      } else if (bench.contractValue < bench.industryAverage * 0.95) {
        status = 'below';
      } else {
        status = 'at';
      }
    }

    return { ...bench, status };
  });
}
