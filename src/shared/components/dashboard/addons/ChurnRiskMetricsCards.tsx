import { Card, CardContent } from '@/shared/components/ui/card';
import { TrendingDown, AlertTriangle, DollarSign, Target } from 'lucide-react';
import { getChurnMetrics } from '@/shared/lib/addons/churnPredictionAnalytics';

export function ChurnRiskMetricsCards() {
  const metrics = getChurnMetrics();

  const cards = [
    {
      title: 'At-Risk Customers',
      value: metrics.totalAtRisk.toString(),
      change: `${metrics.criticalRisk} critical, ${metrics.highRisk} high`,
      icon: AlertTriangle,
      color: 'text-destructive'
    },
    {
      title: 'At-Risk Revenue',
      value: `$${(metrics.atRiskRevenue / 1000).toFixed(0)}K`,
      change: `${metrics.monthlyChurnRate}% monthly churn rate`,
      icon: DollarSign,
      color: 'text-orange-600'
    },
    {
      title: 'Preventable Value',
      value: `$${(metrics.preventableChurnValue / 1000).toFixed(0)}K`,
      change: `${metrics.interventionSuccessRate}% intervention success`,
      icon: Target,
      color: 'text-green-600'
    },
    {
      title: 'Avg Churn Risk',
      value: `${metrics.averageChurnProbability}%`,
      change: 'Across all customers',
      icon: TrendingDown,
      color: 'text-yellow-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold mb-1">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.change}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
