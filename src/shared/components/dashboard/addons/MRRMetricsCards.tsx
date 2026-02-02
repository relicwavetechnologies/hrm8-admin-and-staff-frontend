import { EnhancedStatCard } from '@/shared/components/dashboard/EnhancedStatCard';
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
      <EnhancedStatCard
        title="Monthly Recurring Revenue"
        icon={<DollarSign />}
        value={formatCurrency(metrics.mrr)}
        change={`${formatCurrency(Math.abs(metrics.mrrGrowth))} MoM`}
        trend={metrics.mrrGrowthRate >= 0 ? 'up' : 'down'}
        variant="success"
      />
      
      <EnhancedStatCard
        title="Annual Recurring Revenue"
        icon={<TrendingUp />}
        value={formatCurrency(metrics.arr)}
        change={`${metrics.mrrGrowthRate >= 0 ? '+' : ''}${(metrics.mrrGrowthRate * 12).toFixed(1)}%`}
        trend={metrics.mrrGrowthRate >= 0 ? 'up' : 'down'}
        variant="primary"
      />
      
      <EnhancedStatCard
        title="Avg Revenue per Service"
        icon={<Target />}
        value={formatCurrency(metrics.avgRevenuePerService)}
        change="+5.2%"
        trend="up"
        variant="warning"
      />
      
      <EnhancedStatCard
        title={`Top Service: ${topService.name}`}
        icon={<Zap />}
        value={formatCurrency(topService.revenue)}
        change={`${((topService.revenue / metrics.mrr) * 100).toFixed(1)}% of MRR`}
        trend="up"
        variant="neutral"
      />
    </>
  );
}
