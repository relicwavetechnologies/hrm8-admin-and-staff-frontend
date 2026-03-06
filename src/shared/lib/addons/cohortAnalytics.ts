// Cohort analysis for customer retention and lifetime value tracking

export interface CohortData {
  cohortMonth: string;
  cohortSize: number;
  retention: { [month: string]: number };
  revenue: { [month: string]: number };
  ltv: number;
  churnRate: number;
}

export interface ServiceLTV {
  service: 'aiInterviews' | 'assessments' | 'backgroundChecks';
  serviceName: string;
  averageLTV: number;
  customerCount: number;
  avgMonthlyRevenue: number;
  avgLifespan: number;
  churnRate: number;
}

export interface ChurnMetrics {
  month: string;
  totalChurn: number;
  aiInterviewsChurn: number;
  assessmentsChurn: number;
  backgroundChecksChurn: number;
  churnRate: number;
}

export interface RevenueRetention {
  month: string;
  retentionRate: number;
  grossRetention: number;
  netRetention: number;
  expansion: number;
  contraction: number;
}

// Generate cohort retention data
export function getCohortRetentionData(): CohortData[] {
  const cohorts: CohortData[] = [];
  const today = new Date();

  // Generate 12 cohorts (past year)
  for (let i = 11; i >= 0; i--) {
    const cohortDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const cohortMonth = cohortDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

    // Initial cohort size increases over time with some variation
    const baseCohortSize = 50 + (11 - i) * 8;
    const cohortSize = Math.round(baseCohortSize * (0.9 + Math.random() * 0.2));

    const retention: { [month: string]: number } = {};
    const revenue: { [month: string]: number } = {};

    // Calculate retention for each month after cohort start
    const monthsElapsed = i + 1;
    for (let m = 0; m < monthsElapsed; m++) {
      const monthLabel = `M${m}`;

      // Retention drops over time with some service stickiness
      // Month 0 (M0) is always 100%
      let retentionRate = 100;
      if (m > 0) {
        // Initial drop is steeper, then plateaus
        const baseRetention = 100 * Math.exp(-m * 0.08); // Exponential decay
        const randomVariation = -5 + (Math.random() * 5); // -5% to 0% variation
        retentionRate = Math.max(30, baseRetention + randomVariation); // Floor at 30%
      }

      retention[monthLabel] = Math.round(retentionRate);

      // Revenue per customer slightly increases over time (expansion)
      const baseRevenue = 75;
      const expansionFactor = 1 + (m * 0.03); // 3% expansion per month
      const revenuePerCustomer = baseRevenue * expansionFactor;
      const cohortRevenue = (cohortSize * (retentionRate / 100)) * revenuePerCustomer;
      revenue[monthLabel] = Math.round(cohortRevenue);
    }

    // Calculate LTV (sum of all revenue divided by cohort size)
    const totalRevenue = Object.values(revenue).reduce((sum, r) => sum + r, 0);
    const ltv = Math.round(totalRevenue / cohortSize);

    // Calculate churn rate (100 - final retention rate)
    const finalRetention = Object.values(retention)[Object.values(retention).length - 1];
    const churnRate = Math.round(100 - finalRetention);

    cohorts.push({
      cohortMonth,
      cohortSize,
      retention,
      revenue,
      ltv,
      churnRate
    });
  }

  return cohorts;
}

// Calculate LTV by service type
export function getLTVByService(): ServiceLTV[] {
  return [
    {
      service: 'aiInterviews',
      serviceName: 'AI Interviews',
      averageLTV: 2850,
      customerCount: 145,
      avgMonthlyRevenue: 285,
      avgLifespan: 10, // months
      churnRate: 8.5
    },
    {
      service: 'assessments',
      serviceName: 'Assessments',
      averageLTV: 3200,
      customerCount: 178,
      avgMonthlyRevenue: 320,
      avgLifespan: 10,
      churnRate: 7.2
    },
    {
      service: 'backgroundChecks',
      serviceName: 'Background Checks',
      averageLTV: 2400,
      customerCount: 132,
      avgMonthlyRevenue: 240,
      avgLifespan: 10,
      churnRate: 9.8
    }
  ];
}

// Track monthly churn by service
export function getChurnMetrics(): ChurnMetrics[] {
  const metrics: ChurnMetrics[] = [];
  const today = new Date();

  for (let i = 11; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const month = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    // Base churn with seasonal variation
    const seasonality = 1 + (Math.sin((date.getMonth() / 12) * Math.PI * 2) * 0.3);
    const trend = 1 - (i * 0.02); // Improving over time

    const baseChurn = 12;
    const totalCustomers = 150 + (11 - i) * 10;
    const churnCount = Math.round(baseChurn * seasonality * trend);

    metrics.push({
      month,
      totalChurn: churnCount,
      aiInterviewsChurn: Math.round(churnCount * 0.35),
      assessmentsChurn: Math.round(churnCount * 0.30),
      backgroundChecksChurn: Math.round(churnCount * 0.35),
      churnRate: Number(((churnCount / totalCustomers) * 100).toFixed(2))
    });
  }

  return metrics;
}

// Calculate revenue retention curves
export function getRevenueRetention(): RevenueRetention[] {
  const retention: RevenueRetention[] = [];
  const today = new Date();

  for (let i = 11; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const month = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    // Retention improves slightly over time
    const trend = 1 + ((11 - i) * 0.01);
    const seasonality = 1 + (Math.sin((date.getMonth() / 12) * Math.PI * 2) * 0.05);

    const baseGrossRetention = 92;
    const grossRetention = Math.min(98, baseGrossRetention * trend * seasonality);

    // Expansion from upsells and cross-sells
    const expansion = 8 + (Math.random() * 4); // 8-12%

    // Contraction from downgrades
    const contraction = 3 + (Math.random() * 2); // 3-5%

    // Net retention = Gross retention + Expansion - Contraction
    const netRetention = grossRetention + expansion - contraction;

    // Overall retention rate (customers retained)
    const retentionRate = 91 + (Math.random() * 5); // 91-96%

    retention.push({
      month,
      retentionRate: Number(retentionRate.toFixed(1)),
      grossRetention: Number(grossRetention.toFixed(1)),
      netRetention: Number(netRetention.toFixed(1)),
      expansion: Number(expansion.toFixed(1)),
      contraction: Number(contraction.toFixed(1))
    });
  }

  return retention;
}

// Helper: Calculate average metrics
export function getCohortSummaryMetrics() {
  // const cohorts = getCohortRetentionData();
  const churnMetrics = getChurnMetrics();
  const ltvData = getLTVByService();

  const avgLTV = ltvData.reduce((sum, s) => sum + s.averageLTV, 0) / ltvData.length;
  const avgChurnRate = churnMetrics.reduce((sum, m) => sum + m.churnRate, 0) / churnMetrics.length;
  const totalCustomers = ltvData.reduce((sum, s) => sum + s.customerCount, 0);

  // Calculate customer acquisition cost (mock)
  const cac = 180; // $180 average CAC
  const ltvCacRatio = avgLTV / cac;

  return {
    averageLTV: Math.round(avgLTV),
    averageChurnRate: Number(avgChurnRate.toFixed(2)),
    totalCustomers,
    customerAcquisitionCost: cac,
    ltvCacRatio: Number(ltvCacRatio.toFixed(2)),
    paybackPeriod: Number((cac / (avgLTV / 10)).toFixed(1)) // months
  };
}
