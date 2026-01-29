import { TrendData } from '@/shared/types/businessMetrics';

export interface ForecastPoint {
  month: string;
  actual?: number;
  predicted: number;
  upperBound: number;
  lowerBound: number;
  confidence: number; // 0-100
}

export interface ForecastResult {
  historicalData: ForecastPoint[];
  forecastData: ForecastPoint[];
  accuracy: number; // 0-100
  trend: 'growing' | 'stable' | 'declining';
  averageGrowthRate: number; // percentage
}

/**
 * Calculate linear regression for trend analysis
 */
function calculateLinearRegression(data: number[]): { slope: number; intercept: number } {
  const n = data.length;
  const indices = Array.from({ length: n }, (_, i) => i);
  
  const sumX = indices.reduce((sum, x) => sum + x, 0);
  const sumY = data.reduce((sum, y) => sum + y, 0);
  const sumXY = indices.reduce((sum, x, i) => sum + x * data[i], 0);
  const sumX2 = indices.reduce((sum, x) => sum + x * x, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return { slope, intercept };
}

/**
 * Calculate standard deviation for confidence intervals
 */
function calculateStdDev(data: number[]): number {
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const squaredDiffs = data.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / data.length;
  return Math.sqrt(variance);
}

/**
 * Generate revenue forecast based on historical trends
 */
export function generateRevenueForecast(
  historicalTrends: TrendData[],
  monthsToForecast: number = 6
): ForecastResult {
  // Extract revenue data
  const revenueData = historicalTrends.map(t => t.revenue);
  const monthLabels = historicalTrends.map(t => t.month);
  
  // Calculate regression for trend
  const { slope, intercept } = calculateLinearRegression(revenueData);
  const stdDev = calculateStdDev(revenueData);
  
  // Determine trend direction
  const averageGrowthRate = (slope / (revenueData[0] || 1)) * 100;
  let trend: 'growing' | 'stable' | 'declining' = 'stable';
  if (averageGrowthRate > 2) trend = 'growing';
  else if (averageGrowthRate < -2) trend = 'declining';
  
  // Calculate accuracy based on how well regression fits historical data
  const predictions = revenueData.map((_, i) => slope * i + intercept);
  const errors = revenueData.map((actual, i) => Math.abs(actual - predictions[i]));
  const meanError = errors.reduce((sum, err) => sum + err, 0) / errors.length;
  const accuracy = Math.max(0, Math.min(100, 100 - (meanError / (revenueData.reduce((sum, r) => sum + r, 0) / revenueData.length)) * 100));
  
  // Create historical data points with actuals
  const historicalData: ForecastPoint[] = historicalTrends.map((trend, i) => {
    const predicted = slope * i + intercept;
    return {
      month: trend.month,
      actual: trend.revenue,
      predicted,
      upperBound: predicted + stdDev * 1.96, // 95% confidence
      lowerBound: Math.max(0, predicted - stdDev * 1.96),
      confidence: 100
    };
  });
  
  // Generate forecast data points
  const forecastData: ForecastPoint[] = [];
  const lastIndex = revenueData.length - 1;
  
  for (let i = 1; i <= monthsToForecast; i++) {
    const futureIndex = lastIndex + i;
    const predicted = slope * futureIndex + intercept;
    
    // Confidence decreases as we predict further into the future
    const confidence = Math.max(50, 100 - (i * 8));
    
    // Confidence interval widens over time
    const intervalMultiplier = 1.96 + (i * 0.1);
    
    forecastData.push({
      month: generateFutureMonth(monthLabels[lastIndex], i),
      predicted: Math.max(0, predicted),
      upperBound: Math.max(0, predicted + stdDev * intervalMultiplier),
      lowerBound: Math.max(0, predicted - stdDev * intervalMultiplier),
      confidence
    });
  }
  
  return {
    historicalData,
    forecastData,
    accuracy: Math.round(accuracy),
    trend,
    averageGrowthRate: Math.round(averageGrowthRate * 10) / 10
  };
}

/**
 * Generate future month label based on last known month
 */
function generateFutureMonth(lastMonth: string, offset: number): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Try to parse the last month
  const monthMatch = lastMonth.match(/^([A-Za-z]+)\s*'?(\d{2})?$/);
  if (!monthMatch) return `Month +${offset}`;
  
  const monthName = monthMatch[1];
  const year = monthMatch[2] || '24';
  
  const currentMonthIndex = months.findIndex(m => m.toLowerCase() === monthName.toLowerCase());
  if (currentMonthIndex === -1) return `Month +${offset}`;
  
  const futureMonthIndex = (currentMonthIndex + offset) % 12;
  const yearOffset = Math.floor((currentMonthIndex + offset) / 12);
  const futureYear = String(parseInt(year) + yearOffset).padStart(2, '0');
  
  return `${months[futureMonthIndex]} '${futureYear}`;
}

/**
 * Get forecast summary statistics
 */
export function getForecastSummary(forecast: ForecastResult): {
  projectedRevenue: number;
  projectedGrowth: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  riskLevel: 'low' | 'medium' | 'high';
} {
  const projectedRevenue = forecast.forecastData.reduce((sum, point) => sum + point.predicted, 0);
  const lastActual = forecast.historicalData[forecast.historicalData.length - 1]?.actual || 0;
  const projectedGrowth = lastActual > 0 ? ((projectedRevenue / forecast.forecastData.length - lastActual) / lastActual) * 100 : 0;
  
  let confidenceLevel: 'high' | 'medium' | 'low' = 'medium';
  if (forecast.accuracy > 80) confidenceLevel = 'high';
  else if (forecast.accuracy < 60) confidenceLevel = 'low';
  
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (forecast.trend === 'declining') riskLevel = 'high';
  else if (forecast.trend === 'stable' && forecast.averageGrowthRate < 1) riskLevel = 'medium';
  
  return {
    projectedRevenue: Math.round(projectedRevenue),
    projectedGrowth: Math.round(projectedGrowth * 10) / 10,
    confidenceLevel,
    riskLevel
  };
}
