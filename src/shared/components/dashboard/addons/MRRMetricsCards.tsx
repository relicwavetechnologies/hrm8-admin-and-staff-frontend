import { DashboardStatCard } from '@/shared/components/dashboard/DashboardStatCard';
import { getMRRMetrics } from '@/shared/lib/addons/revenueAnalytics';
import { useCurrencyFormat } from '@/contexts/CurrencyFormatContext';
import { DollarSign, TrendingUp, Target, Zap } from 'lucide-react';

export function MRRMetricsCards() {
  const { formatCurrency } = useCurrencyFormat();
  const metrics = getMRRMetrics();

  const topService = metrics.breakdown.assessments.revenue > metrics.breakdown.aiInterviews.revenue && 
    metrics.breakdown.assessments.revenue > metrics.breakdown.backgroundChecks.revenue
      ? { name: 'Assessments', revenue: metrics.breakdown.assessments.revenue }
      : metrics.breakdown.aiInterviews.revenue > metrics.breakdown.backgroundChecks.revenue
      ? { name: 'AI Interviews', revenue: metrics.breakdown.aiInterviews.revenue }
      : { name: 'Background Checks', revenue: metrics.breakdown.backgroundChecks.revenue };

  return (
    <>
      <DashboardStatCard
        title="Monthly Recurring Revenue"
        icon={<DollarSign className="h-4 w-4" />}
        value={formatCurrency(metrics.mrr)}
        trendValue={`${formatCurrency(Math.abs(metrics.mrrGrowth))} MoM`}
        trend={metrics.mrrGrowthRate >= 0 ? 'up' : 'down'}
        variant="success"
      />
      
      <DashboardStatCard
        title="Annual Recurring Revenue"
        icon={<TrendingUp className="h-4 w-4" />}
        value={formatCurrency(metrics.arr)}
        trendValue={`${metrics.mrrGrowthRate >= 0 ? '+' : ''}${(metrics.mrrGrowthRate * 12).toFixed(1)}%`}
        trend={metrics.mrrGrowthRate >= 0 ? 'up' : 'down'}
        variant="primary"
      />
      
      <DashboardStatCard
        title="Avg Revenue per Service"
        icon={<Target className="h-4 w-4" />}
        value={formatCurrency(metrics.avgRevenuePerService)}
        trendValue="+5.2%"
        trend="up"
        variant="warning"
      />
      
      <DashboardStatCard
        title={`Top Service: ${topService.name}`}
        icon={<Zap className="h-4 w-4" />}
        value={formatCurrency(topService.revenue)}
        trendValue={`${((topService.revenue / metrics.mrr) * 100).toFixed(1)}% of MRR`}
        trend="up"
        variant="neutral"
      />
    </>
  );
}
