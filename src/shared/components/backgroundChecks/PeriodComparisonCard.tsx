import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown } from "lucide-react";
import type { PeriodComparison } from '@/shared/lib/backgroundChecks/periodComparison';

interface PeriodComparisonCardProps {
  comparison: PeriodComparison;
}

export function PeriodComparisonCard({ comparison }: PeriodComparisonCardProps) {
  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendBadge = (value: number, isTime: boolean = false) => {
    const isPositive = isTime ? value < 0 : value > 0;
    const isNegative = isTime ? value > 0 : value < 0;
    
    if (isPositive) {
      return (
        <Badge className="bg-green-500">
          <ArrowUp className="h-3 w-3 mr-1" />
          {Math.abs(value).toFixed(1)}%
        </Badge>
      );
    }
    if (isNegative) {
      return (
        <Badge variant="destructive">
          <ArrowDown className="h-3 w-3 mr-1" />
          {Math.abs(value).toFixed(1)}%
        </Badge>
      );
    }
    return (
      <Badge variant="outline">
        <Minus className="h-3 w-3 mr-1" />
        0%
      </Badge>
    );
  };

  const metrics = [
    {
      label: 'Total Checks',
      current: comparison.current.totalChecks,
      previous: comparison.previous.totalChecks,
      change: comparison.changes.totalChecks,
      changePercent: comparison.changes.totalChecksPercent,
    },
    {
      label: 'Completed',
      current: comparison.current.completed,
      previous: comparison.previous.completed,
      change: comparison.changes.completed,
      changePercent: comparison.changes.completedPercent,
    },
    {
      label: 'Completion Rate',
      current: `${comparison.current.completionRate.toFixed(1)}%`,
      previous: `${comparison.previous.completionRate.toFixed(1)}%`,
      change: comparison.changes.completionRate,
      changePercent: comparison.changes.completionRate,
      isRate: true,
    },
    {
      label: 'Avg. Completion Time',
      current: `${comparison.current.avgCompletionTime} days`,
      previous: `${comparison.previous.avgCompletionTime} days`,
      change: comparison.changes.avgCompletionTime,
      changePercent: comparison.changes.avgCompletionTimePercent,
      isTime: true,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Period-over-Period Comparison</CardTitle>
        <CardDescription>Compare current period performance with the previous equivalent period</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{metric.label}</span>
                {getTrendIcon(metric.isRate ? metric.change : metric.changePercent)}
              </div>
              
              <div className="space-y-1">
                <div className="text-2xl font-bold">{metric.current}</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Previous: {metric.previous}
                  </span>
                  {!metric.isRate && getTrendBadge(metric.changePercent, metric.isTime)}
                  {metric.isRate && (
                    <Badge variant={metric.change > 0 ? "default" : "secondary"} className="text-xs">
                      {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium mb-2">Current Period</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Total: {comparison.current.totalChecks} checks</p>
                <p>Active: {comparison.current.active} checks</p>
                <p>Issues: {comparison.current.issuesFound} checks</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Previous Period</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Total: {comparison.previous.totalChecks} checks</p>
                <p>Active: {comparison.previous.active} checks</p>
                <p>Issues: {comparison.previous.issuesFound} checks</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
