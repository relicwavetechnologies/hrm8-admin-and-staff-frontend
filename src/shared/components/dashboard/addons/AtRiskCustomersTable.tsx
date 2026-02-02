import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import { ArrowRight, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { getChurnPredictions } from '@/shared/lib/addons/churnPredictionAnalytics';
import { ChurnRiskLevel } from '@/types/churnPrediction';

export function AtRiskCustomersTable() {
  const predictions = getChurnPredictions().filter(p => 
    p.riskLevel === 'critical' || p.riskLevel === 'high'
  ).slice(0, 10);

  const getRiskColor = (level: ChurnRiskLevel) => {
    switch (level) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      default: return 'bg-green-500 text-white';
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend < -5) return <TrendingDown className="h-3 w-3 text-destructive" />;
    if (trend > 5) return <TrendingUp className="h-3 w-3 text-green-600" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>High-Risk Customers</CardTitle>
        <CardDescription>
          Customers most likely to churn in the next 90 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {predictions.map((prediction) => (
            <div key={prediction.customerId} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{prediction.companyName}</h4>
                    <Badge className={getRiskColor(prediction.riskLevel)}>
                      {prediction.riskLevel}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {prediction.serviceType} • ${(prediction.monthlyValue / 1000).toFixed(1)}K MRR
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  View Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Churn Probability</span>
                  <span className="font-medium">{prediction.churnProbability}%</span>
                </div>
                <Progress value={prediction.churnProbability} className="h-2" />
              </div>

              <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Engagement</p>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">{prediction.engagement.featureUsage}%</span>
                    {getTrendIcon(prediction.engagement.activityTrend)}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Renewal</p>
                  <p className="text-sm font-medium">{prediction.daysUntilRenewal}d</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Interventions</p>
                  <p className="text-sm font-medium">{prediction.interventions.length} available</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
