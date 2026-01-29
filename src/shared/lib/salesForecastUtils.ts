import { SalesOpportunity } from '@/shared/types/salesOpportunity';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ForecastItem extends SalesOpportunity {
  weightedValue: number;
  confidenceLevel: ConfidenceLevel;
  quarter: string;
}

export function calculateWeightedValue(opportunity: SalesOpportunity): number {
  return (opportunity.estimatedValue * opportunity.probability) / 100;
}

export function getConfidenceLevel(opportunity: SalesOpportunity): ConfidenceLevel {
  // High confidence: negotiation or later stage with >60% probability
  if ((opportunity.stage === 'negotiation' || opportunity.stage === 'closed-won') && opportunity.probability >= 60) {
    return 'high';
  }
  
  // Medium confidence: proposal stage or 30-60% probability
  if (opportunity.stage === 'proposal' || (opportunity.probability >= 30 && opportunity.probability < 60)) {
    return 'medium';
  }
  
  // Low confidence: early stage or <30% probability
  return 'low';
}

export function getQuarterFromDate(dateString: string): string {
  const date = new Date(dateString);
  const month = date.getMonth();
  const year = date.getFullYear();
  const quarter = Math.floor(month / 3) + 1;
  return `Q${quarter} ${year}`;
}

export function transformToForecastItems(opportunities: SalesOpportunity[]): ForecastItem[] {
  return opportunities
    .filter(opp => opp.stage !== 'closed-lost' && opp.stage !== 'closed-won')
    .map(opp => ({
      ...opp,
      weightedValue: calculateWeightedValue(opp),
      confidenceLevel: getConfidenceLevel(opp),
      quarter: getQuarterFromDate(opp.expectedCloseDate),
    }));
}

export function getForecastByQuarter(opportunities: SalesOpportunity[]): Record<string, {
  totalValue: number;
  weightedValue: number;
  count: number;
  opportunities: ForecastItem[];
}> {
  const forecastItems = transformToForecastItems(opportunities);
  const byQuarter: Record<string, {
    totalValue: number;
    weightedValue: number;
    count: number;
    opportunities: ForecastItem[];
  }> = {};
  
  forecastItems.forEach(item => {
    if (!byQuarter[item.quarter]) {
      byQuarter[item.quarter] = {
        totalValue: 0,
        weightedValue: 0,
        count: 0,
        opportunities: [],
      };
    }
    
    byQuarter[item.quarter].totalValue += item.estimatedValue;
    byQuarter[item.quarter].weightedValue += item.weightedValue;
    byQuarter[item.quarter].count += 1;
    byQuarter[item.quarter].opportunities.push(item);
  });
  
  return byQuarter;
}

export function getBestCaseScenario(opportunities: SalesOpportunity[]): number {
  const activeOpportunities = opportunities.filter(
    opp => opp.stage !== 'closed-lost' && opp.stage !== 'closed-won'
  );
  // Best case: assume 30% higher values and 100% win rate
  return activeOpportunities.reduce((sum, opp) => sum + (opp.estimatedValue * 1.3), 0);
}

export function getWorstCaseScenario(opportunities: SalesOpportunity[]): number {
  const activeOpportunities = opportunities.filter(
    opp => opp.stage !== 'closed-lost' && opp.stage !== 'closed-won'
  );
  // Worst case: assume 30% lower values and only high-probability deals close
  return activeOpportunities
    .filter(opp => opp.probability >= 70)
    .reduce((sum, opp) => sum + (opp.estimatedValue * 0.7), 0);
}

export function getMostLikelyScenario(opportunities: SalesOpportunity[]): number {
  const activeOpportunities = opportunities.filter(
    opp => opp.stage !== 'closed-lost' && opp.stage !== 'closed-won'
  );
  // Most likely: weighted pipeline value
  return activeOpportunities.reduce((sum, opp) => sum + calculateWeightedValue(opp), 0);
}

export function getForecastStats(opportunities: SalesOpportunity[]) {
  const activeOpportunities = opportunities.filter(
    opp => opp.stage !== 'closed-lost' && opp.stage !== 'closed-won'
  );
  
  const totalPipeline = activeOpportunities.reduce((sum, opp) => sum + opp.estimatedValue, 0);
  const weightedForecast = getMostLikelyScenario(opportunities);
  const bestCase = getBestCaseScenario(opportunities);
  const worstCase = getWorstCaseScenario(opportunities);
  
  return {
    totalPipeline,
    weightedForecast,
    bestCase,
    worstCase,
    opportunityCount: activeOpportunities.length,
  };
}
