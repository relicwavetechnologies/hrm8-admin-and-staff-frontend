import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { getHealthFactorAverages } from '@/shared/lib/addons/customerHealthAnalytics';

export function HealthFactorsBreakdown() {
  const factors = getHealthFactorAverages();

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    if (score >= 30) return 'text-orange-600';
    return 'text-destructive';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Factor Breakdown</CardTitle>
        <CardDescription>
          Average scores across all health factors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {factors.map((factor) => (
            <div key={factor.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{factor.name}</span>
                <span className={`text-sm font-bold ${getScoreColor(factor.average)}`}>
                  {factor.average}
                </span>
              </div>
              <Progress value={factor.average} className="h-2" />
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t space-y-3">
          <h4 className="font-semibold text-sm">Score Ranges</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-600" />
              <span>85-100: Excellent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600" />
              <span>70-84: Good</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-600" />
              <span>50-69: Fair</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-600" />
              <span>30-49: Poor</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <span>0-29: Critical</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
