import { Card, CardContent } from '@/shared/components/ui/card';
import { Heart, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { getHealthMetrics } from '@/shared/lib/addons/customerHealthAnalytics';

export function CustomerHealthMetricsCards() {
  const metrics = getHealthMetrics();

  const cards = [
    {
      title: 'Average Health Score',
      value: metrics.averageScore.toString(),
      change: `${metrics.excellentHealth + metrics.goodHealth} healthy customers`,
      icon: Heart,
      color: 'text-green-600'
    },
    {
      title: 'Improving',
      value: metrics.improving.toString(),
      change: `${Math.round((metrics.improving / metrics.totalCustomers) * 100)}% of customers`,
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Declining',
      value: metrics.declining.toString(),
      change: `${metrics.criticalHealth} critical health`,
      icon: TrendingDown,
      color: 'text-destructive'
    },
    {
      title: 'Active Alerts',
      value: metrics.activeAlerts.toString(),
      change: `${metrics.criticalAlerts} critical alerts`,
      icon: AlertTriangle,
      color: 'text-orange-600'
    }
  ];

  return (
    <>
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
    </>
  );
}
