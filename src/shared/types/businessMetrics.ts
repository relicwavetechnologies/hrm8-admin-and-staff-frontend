export interface RevenueMetrics {
  totalRevenue: number;
  revenueByType: Record<string, number>;
  monthOverMonthGrowth: number;
  revenuePerClient: number;
  profitMargin: number;
}

export interface UsageMetrics {
  totalVolume: number;
  volumeByLocation: { country: string; region: string; count: number; revenue: number }[];
  clientAdoptionRate: number;
  topClients: { clientId: string; clientName: string; volume: number; revenue: number }[];
}

export interface ProfitabilityMetrics {
  providerCosts: number;
  internalCosts: number;
  netProfit: number;
  costPerUnit: number;
  marginPercentage: number;
}

export interface TrendData {
  month: string;
  revenue: number;
  volume: number;
  profit: number;
  newClients: number;
}

export interface ClientRevenueData {
  clientId: string;
  clientName: string;
  volume: number;
  revenue: number;
  avgPrice: number;
}

export interface GeographicData {
  country: string;
  region: string;
  count: number;
  revenue: number;
}

export interface TypeDistribution {
  type: string;
  revenue: number;
  volume: number;
  avgPrice: number;
  providerCost?: number;
  profit?: number;
}

export interface ConversionMetrics {
  totalAssessments: number;
  leadsToHire: number;
  conversionRate: number;
  revenuePerHire: number;
}

export interface ClientLifetimeValue {
  clientId: string;
  clientName: string;
  totalRevenue: number;
  monthsActive: number;
  averageMonthlyRevenue: number;
  predictedNextMonthRevenue: number;
  predictedAnnualRevenue: number;
  retentionProbability: number; // 0-100%
  lastPurchaseDate: string;
  totalTransactions: number;
  averageTransactionValue: number;
  trend: 'growing' | 'stable' | 'declining';
}

export interface RetentionMetrics {
  totalClients: number;
  activeClients: number;
  churnedClients: number;
  retentionRate: number; // percentage
  averageClientLifespan: number; // months
  clientsByTenure: { tenure: string; count: number }[];
}
