import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import { ArrowRight, TrendingUp, TrendingDown, AlertCircle, Minus } from 'lucide-react';
import { getCustomerHealthScores } from '@/shared/lib/addons/customerHealthAnalytics';
import { HealthGrade, HealthTrend } from '@/types/customerHealth';

export function CustomerHealthTable() {
  const healthScores = getCustomerHealthScores();

  const getGradeColor = (grade: HealthGrade) => {
    switch (grade) {
      case 'excellent': return 'bg-green-500 text-white';
      case 'good': return 'bg-blue-500 text-white';
      case 'fair': return 'bg-yellow-500 text-white';
      case 'poor': return 'bg-orange-500 text-white';
      case 'critical': return 'bg-destructive text-destructive-foreground';
    }
  };

  const getTrendIcon = (trend: HealthTrend) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-orange-600" />;
      case 'rapidly-declining': return <TrendingDown className="h-4 w-4 text-destructive" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

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
        <CardTitle>Customer Health Scores</CardTitle>
        <CardDescription>
          Overall health assessment for all customers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {healthScores.map((customer) => (
            <div key={customer.customerId} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{customer.companyName}</h4>
                    <Badge className={getGradeColor(customer.healthGrade)}>
                      {customer.healthGrade}
                    </Badge>
                    {customer.alerts.length > 0 && (
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {customer.alerts.length}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {customer.serviceType} • ${(customer.monthlyValue / 1000).toFixed(1)}K MRR • {customer.daysAsCustomer} days
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Health Score</span>
                    {getTrendIcon(customer.trend)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-lg ${getScoreColor(customer.overallScore)}`}>
                      {customer.overallScore}
                    </span>
                    {customer.scoreChange !== 0 && (
                      <span className={`text-xs ${customer.scoreChange > 0 ? 'text-green-600' : 'text-destructive'}`}>
                        {customer.scoreChange > 0 ? '+' : ''}{customer.scoreChange}
                      </span>
                    )}
                  </div>
                </div>
                <Progress 
                  value={customer.overallScore} 
                  className="h-2"
                />
              </div>

              <div className="grid grid-cols-5 gap-2 mt-3 pt-3 border-t">
                {customer.factors.map(factor => (
                  <div key={factor.id} className="text-center">
                    <p className="text-xs text-muted-foreground mb-1 truncate" title={factor.name}>
                      {factor.name.split(' ')[0]}
                    </p>
                    <p className={`text-sm font-medium ${getScoreColor(factor.score)}`}>
                      {factor.score}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
