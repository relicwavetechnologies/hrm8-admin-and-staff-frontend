import { getBackgroundChecks } from '../mockBackgroundCheckStorage';
import type {
  RevenueMetrics,
  UsageMetrics,
  ProfitabilityMetrics,
  TrendData,
  ClientRevenueData,
  GeographicData,
  TypeDistribution,
  ClientLifetimeValue,
  RetentionMetrics
} from '@/shared/types/businessMetrics';

// Background check pricing by type
export const BACKGROUND_CHECK_PRICING = {
  'reference': 69,
  'criminal-record': 49,
  'qualification': 59,
  'identity': 39,
  'employment': 55,
  'education': 49,
};

// Provider costs for third-party checks
const PROVIDER_COSTS = {
  'checkr': 30,
  'sterling': 35,
  'hireright': 32,
  'goodhire': 28,
  'certn': 30,
  'internal': 15, // Internal cost for HRM8 native reference checks
};

// function _getCheckPrice(checkType: string): number {
//   return BACKGROUND_CHECK_PRICING[checkType as keyof typeof BACKGROUND_CHECK_PRICING] || 49;
// }

function getProviderCost(provider: string): number {
  return PROVIDER_COSTS[provider as keyof typeof PROVIDER_COSTS] || 25;
}

export function getBackgroundCheckRevenueMetrics(
  dateRange?: { from: Date; to: Date },
  country?: string,
  region?: string
): RevenueMetrics {
  let checks = getBackgroundChecks().filter(c => c.status === 'completed');

  // Apply filters
  if (dateRange) {
    checks = checks.filter(c => {
      const completedDate = new Date(c.completedDate || c.createdAt);
      return completedDate >= dateRange.from && completedDate <= dateRange.to;
    });
  }

  if (country && country !== 'all') {
    checks = checks.filter(c => c.country === country);
  }

  if (region && region !== 'all') {
    checks = checks.filter(c => c.region === region);
  }

  const totalRevenue = checks.reduce((sum, c) => sum + (c.cost || 0), 0);
  const totalCosts = checks.reduce((sum, c) => sum + getProviderCost(c.provider), 0);
  const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0;

  // Calculate revenue by type
  const revenueByType: Record<string, number> = {};
  checks.forEach(c => {
    // Use the first check type as primary type for revenue breakdown
    const type = c.checkTypes[0]?.type || 'unknown';
    revenueByType[type] = (revenueByType[type] || 0) + (c.cost || 0);
  });

  // Calculate unique clients
  const uniqueClients = new Set(checks.map(c => c.billedTo)).size;
  const revenuePerClient = uniqueClients > 0 ? totalRevenue / uniqueClients : 0;

  // Mock month-over-month growth
  const monthOverMonthGrowth = 15.3;

  return {
    totalRevenue,
    revenueByType,
    monthOverMonthGrowth,
    revenuePerClient,
    profitMargin,
  };
}

export function getBackgroundCheckUsageMetrics(
  dateRange?: { from: Date; to: Date },
  country?: string,
  region?: string
): UsageMetrics {
  let checks = getBackgroundChecks();

  // Apply filters
  if (dateRange) {
    checks = checks.filter(c => {
      const createdDate = new Date(c.createdAt);
      return createdDate >= dateRange.from && createdDate <= dateRange.to;
    });
  }

  if (country && country !== 'all') {
    checks = checks.filter(c => c.country === country);
  }

  if (region && region !== 'all') {
    checks = checks.filter(c => c.region === region);
  }

  const totalVolume = checks.length;

  // Calculate volume by location
  const locationMap = new Map<string, GeographicData>();
  checks.forEach(c => {
    const key = `${c.country || 'Unknown'}-${c.region || 'Unknown'}`;
    const existing = locationMap.get(key);
    const revenue = c.status === 'completed' ? (c.cost || 0) : 0;

    if (existing) {
      existing.count++;
      existing.revenue += revenue;
    } else {
      locationMap.set(key, {
        country: c.country || 'Unknown',
        region: c.region || 'Unknown',
        count: 1,
        revenue,
      });
    }
  });

  const volumeByLocation = Array.from(locationMap.values())
    .sort((a, b) => b.revenue - a.revenue);

  // Calculate top clients
  const clientMap = new Map<string, ClientRevenueData>();
  checks.forEach(c => {
    const clientId = c.billedTo || 'unknown';
    const clientName = c.billedToName || 'Unknown Client';
    const existing = clientMap.get(clientId);
    const revenue = c.status === 'completed' ? (c.cost || 0) : 0;

    if (existing) {
      existing.volume++;
      existing.revenue += revenue;
      existing.avgPrice = existing.revenue / existing.volume;
    } else {
      clientMap.set(clientId, {
        clientId,
        clientName,
        volume: 1,
        revenue,
        avgPrice: revenue,
      });
    }
  });

  const topClients = Array.from(clientMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Mock client adoption rate
  const totalPossibleClients = 100;
  const activeClients = new Set(checks.map(c => c.billedTo)).size;
  const clientAdoptionRate = (activeClients / totalPossibleClients) * 100;

  return {
    totalVolume,
    volumeByLocation,
    clientAdoptionRate,
    topClients,
  };
}

export function getBackgroundCheckProfitability(
  dateRange?: { from: Date; to: Date },
  country?: string,
  region?: string
): ProfitabilityMetrics {
  let checks = getBackgroundChecks().filter(c => c.status === 'completed');

  // Apply filters
  if (dateRange) {
    checks = checks.filter(c => {
      const completedDate = new Date(c.completedDate || c.createdAt);
      return completedDate >= dateRange.from && completedDate <= dateRange.to;
    });
  }

  if (country && country !== 'all') {
    checks = checks.filter(c => c.country === country);
  }

  if (region && region !== 'all') {
    checks = checks.filter(c => c.region === region);
  }

  const totalRevenue = checks.reduce((sum, c) => sum + (c.cost || 0), 0);
  const providerCosts = checks.reduce((sum, c) => sum + getProviderCost(c.provider), 0);
  const internalCosts = checks.length * 8; // Mock internal operational cost per check
  const netProfit = totalRevenue - providerCosts - internalCosts;
  const costPerUnit = checks.length > 0 ? (providerCosts + internalCosts) / checks.length : 0;
  const marginPercentage = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return {
    providerCosts,
    internalCosts,
    netProfit,
    costPerUnit,
    marginPercentage,
  };
}

export function getBackgroundCheckRevenueTrends(): TrendData[] {
  const checks = getBackgroundChecks();
  const monthMap = new Map<string, TrendData>();

  // Generate last 6 months
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    months.push(monthKey);
    monthMap.set(monthKey, {
      month: monthKey,
      revenue: 0,
      volume: 0,
      profit: 0,
      newClients: 0,
    });
  }

  // Populate with check data
  checks.forEach(c => {
    const date = new Date(c.completedDate || c.createdAt);
    const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const data = monthMap.get(monthKey);

    if (data && c.status === 'completed') {
      const revenue = c.cost || 0;
      const cost = getProviderCost(c.provider) + 8;
      data.revenue += revenue;
      data.volume++;
      data.profit += (revenue - cost);
    }
  });

  // Mock new clients per month
  monthMap.forEach((data) => {
    data.newClients = Math.floor(Math.random() * 4) + 1;
  });

  return months.map(m => monthMap.get(m)!);
}

export function getRevenueByTypeDistribution(): TypeDistribution[] {
  const checks = getBackgroundChecks().filter(c => c.status === 'completed');
  const typeMap = new Map<string, TypeDistribution>();

  checks.forEach(c => {
    // Use the first check type as primary type for revenue breakdown
    const type = c.checkTypes[0]?.type || 'unknown';
    const existing = typeMap.get(type);
    const revenue = c.cost || 0;
    const providerCost = getProviderCost(c.provider);

    if (existing) {
      existing.revenue += revenue;
      existing.volume++;
      existing.providerCost = (existing.providerCost || 0) + providerCost;
      existing.profit = existing.revenue - (existing.providerCost || 0);
      existing.avgPrice = existing.revenue / existing.volume;
    } else {
      typeMap.set(type, {
        type: type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        revenue,
        volume: 1,
        avgPrice: revenue,
        providerCost,
        profit: revenue - providerCost,
      });
    }
  });

  return Array.from(typeMap.values()).sort((a, b) => b.revenue - a.revenue);
}

export function getTopClientsByRevenue(limit: number = 10): ClientRevenueData[] {
  const checks = getBackgroundChecks().filter(c => c.status === 'completed');
  const clientMap = new Map<string, ClientRevenueData>();

  checks.forEach(c => {
    const clientId = c.billedTo || 'unknown';
    const clientName = c.billedToName || 'Unknown Client';
    const existing = clientMap.get(clientId);
    const revenue = c.cost || 0;

    if (existing) {
      existing.volume++;
      existing.revenue += revenue;
      existing.avgPrice = existing.revenue / existing.volume;
    } else {
      clientMap.set(clientId, {
        clientId,
        clientName,
        volume: 1,
        revenue,
        avgPrice: revenue,
      });
    }
  });

  return Array.from(clientMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export function getGeographicRevenueDistribution(): GeographicData[] {
  const checks = getBackgroundChecks().filter(c => c.status === 'completed');
  const locationMap = new Map<string, GeographicData>();

  checks.forEach(c => {
    const key = c.country || 'Unknown';
    const existing = locationMap.get(key);
    const revenue = c.cost || 0;

    if (existing) {
      existing.count++;
      existing.revenue += revenue;
    } else {
      locationMap.set(key, {
        country: c.country || 'Unknown',
        region: c.region || 'Unknown',
        count: 1,
        revenue,
      });
    }
  });

  return Array.from(locationMap.values())
    .sort((a, b) => b.revenue - a.revenue);
}

export function getClientLifetimeValues(): ClientLifetimeValue[] {
  const checks = getBackgroundChecks();
  const clientMap = new Map<string, {
    name: string;
    revenue: number;
    transactions: number;
    firstDate: Date;
    lastDate: Date;
  }>();

  // Group by client
  checks.forEach((check) => {
    const clientId = check.billedTo || 'unknown';
    const clientName = check.billedToName || 'Unknown Client';
    const revenue = check.status === 'completed' ? (check.cost || 0) : 0;
    const date = new Date(check.createdAt);

    if (!clientMap.has(clientId)) {
      clientMap.set(clientId, {
        name: clientName,
        revenue: 0,
        transactions: 0,
        firstDate: date,
        lastDate: date,
      });
    }

    const client = clientMap.get(clientId)!;
    client.revenue += revenue;
    client.transactions += 1;
    client.lastDate = date > client.lastDate ? date : client.lastDate;
    client.firstDate = date < client.firstDate ? date : client.firstDate;
  });

  // Calculate CLV metrics
  const clvData: ClientLifetimeValue[] = [];
  clientMap.forEach((data, clientId) => {
    const monthsActive = Math.max(1,
      Math.floor((data.lastDate.getTime() - data.firstDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
    );
    const avgMonthlyRevenue = data.revenue / monthsActive;
    const avgTransactionValue = data.revenue / data.transactions;

    // Simple prediction: average monthly revenue * growth factor
    const growthFactor = data.transactions > 5 ? 1.1 : data.transactions > 2 ? 1.05 : 1.0;
    const predictedNextMonth = avgMonthlyRevenue * growthFactor;
    const predictedAnnual = predictedNextMonth * 12;

    // Retention probability based on recency and frequency
    const daysSinceLastPurchase = Math.floor((Date.now() - data.lastDate.getTime()) / (1000 * 60 * 60 * 24));
    const retentionProbability = Math.max(20, Math.min(95,
      100 - (daysSinceLastPurchase / 10) + (data.transactions * 2)
    ));

    // Determine trend
    let trend: 'growing' | 'stable' | 'declining' = 'stable';
    if (growthFactor > 1.05) trend = 'growing';
    else if (daysSinceLastPurchase > 60) trend = 'declining';

    clvData.push({
      clientId,
      clientName: data.name,
      totalRevenue: data.revenue,
      monthsActive,
      averageMonthlyRevenue: avgMonthlyRevenue,
      predictedNextMonthRevenue: predictedNextMonth,
      predictedAnnualRevenue: predictedAnnual,
      retentionProbability,
      lastPurchaseDate: data.lastDate.toISOString(),
      totalTransactions: data.transactions,
      averageTransactionValue: avgTransactionValue,
      trend,
    });
  });

  return clvData.sort((a, b) => b.totalRevenue - a.totalRevenue);
}

export function getRetentionMetrics(): RetentionMetrics {
  const clvData = getClientLifetimeValues();
  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

  const activeClients = clvData.filter(c =>
    new Date(c.lastPurchaseDate).getTime() > thirtyDaysAgo
  ).length;

  const churnedClients = clvData.length - activeClients;
  const retentionRate = clvData.length > 0 ? (activeClients / clvData.length) * 100 : 0;
  const avgLifespan = clvData.reduce((sum, c) => sum + c.monthsActive, 0) / clvData.length;

  // Group by tenure
  const tenureBuckets = {
    '0-3 months': 0,
    '3-6 months': 0,
    '6-12 months': 0,
    '12+ months': 0,
  };

  clvData.forEach(c => {
    if (c.monthsActive <= 3) tenureBuckets['0-3 months']++;
    else if (c.monthsActive <= 6) tenureBuckets['3-6 months']++;
    else if (c.monthsActive <= 12) tenureBuckets['6-12 months']++;
    else tenureBuckets['12+ months']++;
  });

  return {
    totalClients: clvData.length,
    activeClients,
    churnedClients,
    retentionRate,
    averageClientLifespan: avgLifespan,
    clientsByTenure: Object.entries(tenureBuckets).map(([tenure, count]) => ({ tenure, count })),
  };
}
