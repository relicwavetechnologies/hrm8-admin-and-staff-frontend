import { DashboardStatCard } from '@/shared/components/dashboard/DashboardStatCard';
import { getCohortSummaryMetrics } from '@/shared/lib/addons/cohortAnalytics';
import { useCurrencyFormat } from '@/contexts/CurrencyFormatContext';
import { DollarSign, Users, TrendingDown, Clock } from 'lucide-react';

export function CohortMetricsCards() {
  const { formatCurrency } = useCurrencyFormat();
  const metrics = getCohortSummaryMetrics();

  return (
    <>
      <DashboardStatCard
        title="Average Customer LTV"
        icon={<DollarSign className="h-4 w-4" />}
        value={formatCurrency(metrics.averageLTV)}
        trendValue="LTV:CAC Ratio"
        trend="up"
        variant="success"
      />
      
      <DashboardStatCard
        title="Total Active Customers"
        icon={<Users className="h-4 w-4" />}
        value={metrics.totalCustomers.toString()}
        trendValue="+8.5% this month"
        trend="up"
        variant="primary"
      />
      
      <DashboardStatCard
        title="Average Churn Rate"
        icon={<TrendingDown className="h-4 w-4" />}
        value={`${metrics.averageChurnRate}%`}
        trendValue="-1.2% improvement"
        trend="down"
        variant="warning"
      />
      
      <DashboardStatCard
        title="CAC Payback Period"
        icon={<Clock className="h-4 w-4" />}
        value={`${metrics.paybackPeriod} months`}
        trendValue={formatCurrency(metrics.customerAcquisitionCost)}
        trend="up"
        variant="neutral"
      />
    </>
  );
}
