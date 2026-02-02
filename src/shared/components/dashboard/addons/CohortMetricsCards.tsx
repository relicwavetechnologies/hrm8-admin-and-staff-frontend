import { EnhancedStatCard } from '@/shared/components/dashboard/EnhancedStatCard';
import { getCohortSummaryMetrics } from '@/shared/lib/addons/cohortAnalytics';
import { useCurrencyFormat } from '@/contexts/CurrencyFormatContext';
import { DollarSign, Users, TrendingDown, Clock } from 'lucide-react';

export function CohortMetricsCards() {
  const { formatCurrency } = useCurrencyFormat();
  const metrics = getCohortSummaryMetrics();

  return (
    <>
      <EnhancedStatCard
        title="Average Customer LTV"
        icon={<DollarSign />}
        value={formatCurrency(metrics.averageLTV)}
        change="LTV:CAC Ratio"
        trend="up"
        variant="success"
      />
      
      <EnhancedStatCard
        title="Total Active Customers"
        icon={<Users />}
        value={metrics.totalCustomers.toString()}
        change="+8.5% this month"
        trend="up"
        variant="primary"
      />
      
      <EnhancedStatCard
        title="Average Churn Rate"
        icon={<TrendingDown />}
        value={`${metrics.averageChurnRate}%`}
        change="-1.2% improvement"
        trend="down"
        variant="warning"
      />
      
      <EnhancedStatCard
        title="CAC Payback Period"
        icon={<Clock />}
        value={`${metrics.paybackPeriod} months`}
        change={formatCurrency(metrics.customerAcquisitionCost)}
        trend="up"
        variant="neutral"
      />
    </>
  );
}
