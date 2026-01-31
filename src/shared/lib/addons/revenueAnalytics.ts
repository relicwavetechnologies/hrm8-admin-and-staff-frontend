// import { getAIInterviewSessions } from '@/shared/lib/aiInterview/aiInterviewStorage';
// import { getAssessments } from '@/shared/lib/mockAssessmentStorage';
// import { getBackgroundChecks } from '@/shared/lib/mockBackgroundCheckStorage';
// import { calculateAIInterviewRevenue, calculateAssessmentRevenue, calculateBackgroundCheckRevenue } from './combinedAnalytics';

export interface MonthlyRevenue {
  month: string;
  year: number;
  aiInterviews: number;
  assessments: number;
  backgroundChecks: number;
  total: number;
  aiInterviewCount: number;
  assessmentCount: number;
  backgroundCheckCount: number;
}

export interface YoYComparison {
  month: string;
  currentYear: number;
  previousYear: number;
  growth: number;
  growthPercentage: number;
}

export interface ForecastData {
  month: string;
  actual?: number;
  forecast: number;
  lowerBound: number;
  upperBound: number;
}

// Generate mock historical data for the past 24 months
export function getHistoricalMRR(months: number = 24): MonthlyRevenue[] {
  const data: MonthlyRevenue[] = [];
  const today = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    // Simulate growth trend with some seasonality
    const baseGrowth = 1 + ((months - i) * 0.08); // 8% monthly compound growth
    const seasonality = 1 + (Math.sin((date.getMonth() / 12) * Math.PI * 2) * 0.15); // ±15% seasonal variation
    const randomVariation = 0.9 + (Math.random() * 0.2); // ±10% random variation

    const baseRevenue = 15000;
    const totalRevenue = baseRevenue * baseGrowth * seasonality * randomVariation;

    const aiShare = 0.35 + (Math.random() * 0.1);
    const assessmentShare = 0.40 + (Math.random() * 0.1);
    const checkShare = 1 - aiShare - assessmentShare;

    data.push({
      month: monthStr,
      year: date.getFullYear(),
      aiInterviews: Math.round(totalRevenue * aiShare),
      assessments: Math.round(totalRevenue * assessmentShare),
      backgroundChecks: Math.round(totalRevenue * checkShare),
      total: Math.round(totalRevenue),
      aiInterviewCount: Math.round(30 * baseGrowth * randomVariation),
      assessmentCount: Math.round(40 * baseGrowth * randomVariation),
      backgroundCheckCount: Math.round(25 * baseGrowth * randomVariation)
    });
  }

  return data;
}

// Calculate Year-over-Year growth comparison
export function getYoYComparison(): YoYComparison[] {
  const data = getHistoricalMRR(24);
  const comparisons: YoYComparison[] = [];

  // Get last 12 months
  const recentData = data.slice(-12);
  const previousYearData = data.slice(-24, -12);

  recentData.forEach((current, index) => {
    const previous = previousYearData[index];
    const growth = current.total - previous.total;
    const growthPercentage = (growth / previous.total) * 100;

    comparisons.push({
      month: new Date(current.year, 0, 1).toLocaleDateString('en-US', { month: 'short' }),
      currentYear: current.total,
      previousYear: previous.total,
      growth,
      growthPercentage
    });
  });

  return comparisons;
}

// Generate revenue forecast using linear regression with trend
export function getRevenueForecast(monthsAhead: number = 6): ForecastData[] {
  const historical = getHistoricalMRR(12);
  const forecast: ForecastData[] = [];

  // Calculate trend using simple linear regression
  const n = historical.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = historical.reduce((sum, d) => sum + d.total, 0);
  const sumXY = historical.reduce((sum, d, i) => sum + (i * d.total), 0);
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate standard deviation for confidence interval
  const predictions = historical.map((_, i) => intercept + slope * i);
  const squaredErrors = historical.map((d, i) => Math.pow(d.total - predictions[i], 2));
  const stdDev = Math.sqrt(squaredErrors.reduce((a, b) => a + b, 0) / n);

  const today = new Date();

  // Add last 3 months of actual data
  for (let i = Math.max(0, historical.length - 3); i < historical.length; i++) {
    const data = historical[i];
    const predicted = intercept + slope * i;

    forecast.push({
      month: data.month,
      actual: data.total,
      forecast: Math.round(predicted),
      lowerBound: Math.round(predicted - 1.96 * stdDev),
      upperBound: Math.round(predicted + 1.96 * stdDev)
    });
  }

  // Generate forecast
  for (let i = 0; i < monthsAhead; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() + i + 1, 1);
    const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const x = historical.length + i;
    const predicted = intercept + slope * x;

    // Increase uncertainty for further predictions
    const uncertaintyMultiplier = 1 + (i * 0.15);

    forecast.push({
      month: monthStr,
      forecast: Math.round(predicted),
      lowerBound: Math.round(predicted - 1.96 * stdDev * uncertaintyMultiplier),
      upperBound: Math.round(predicted + 1.96 * stdDev * uncertaintyMultiplier)
    });
  }

  return forecast;
}

// Calculate MRR metrics
export function getMRRMetrics() {
  const historical = getHistoricalMRR(13); // 13 months to calculate MoM growth
  const current = historical[historical.length - 1];
  const previous = historical[historical.length - 2];

  const mrr = current.total;
  const mrrGrowth = mrr - previous.total;
  const mrrGrowthRate = (mrrGrowth / previous.total) * 100;

  // Calculate Annual Recurring Revenue
  const arr = mrr * 12;

  // Calculate average revenue per service
  const totalServices = current.aiInterviewCount + current.assessmentCount + current.backgroundCheckCount;
  const avgRevenuePerService = mrr / totalServices;

  return {
    mrr,
    mrrGrowth,
    mrrGrowthRate,
    arr,
    avgRevenuePerService,
    breakdown: {
      aiInterviews: {
        revenue: current.aiInterviews,
        count: current.aiInterviewCount,
        avgRevenue: current.aiInterviews / current.aiInterviewCount
      },
      assessments: {
        revenue: current.assessments,
        count: current.assessmentCount,
        avgRevenue: current.assessments / current.assessmentCount
      },
      backgroundChecks: {
        revenue: current.backgroundChecks,
        count: current.backgroundCheckCount,
        avgRevenue: current.backgroundChecks / current.backgroundCheckCount
      }
    }
  };
}
