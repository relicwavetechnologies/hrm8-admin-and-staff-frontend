import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { Badge } from "@/shared/components/ui/badge";
import { TrendingUp, AlertCircle, Zap } from "lucide-react";
import type { PredictiveMetrics } from '@/shared/lib/backgroundChecks/analyticsService';

interface PredictiveInsightsProps {
  metrics: PredictiveMetrics;
}

export function PredictiveInsights({ metrics }: PredictiveInsightsProps) {
  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 80) return 'text-green-500';
    if (efficiency >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getEfficiencyLabel = (efficiency: number) => {
    if (efficiency >= 80) return 'Excellent';
    if (efficiency >= 60) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Process Efficiency
          </CardTitle>
          <CardDescription>Overall process health and performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Efficiency Score</span>
              <span className={`text-2xl font-bold ${getEfficiencyColor(metrics.efficiency)}`}>
                {metrics.efficiency}%
              </span>
            </div>
            <Progress value={metrics.efficiency} className="h-3" />
            <Badge className={getEfficiencyColor(metrics.efficiency)}>
              {getEfficiencyLabel(metrics.efficiency)}
            </Badge>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Predicted Completion Time</span>
            </div>
            <p className="text-2xl font-bold">{metrics.predictedCompletionTime} days</p>
            <p className="text-xs text-muted-foreground mt-1">Average for new checks</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Risk Factors
          </CardTitle>
          <CardDescription>Factors that may cause delays</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.riskFactors.map((risk, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{risk.factor}</span>
                  <span className="text-sm text-muted-foreground">
                    {risk.impact.toFixed(1)}% impact
                  </span>
                </div>
                <Progress value={risk.impact} className="h-2" />
              </div>
            ))}
            
            {metrics.riskFactors.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No significant risk factors detected</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
