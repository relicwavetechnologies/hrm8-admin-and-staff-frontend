import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Timer, TrendingUp, TrendingDown } from "lucide-react";
import { getBackgroundCheckStats } from '@/shared/lib/backgroundChecks/dashboardStats';

export function AvgCompletionTimeWidget() {
  const stats = getBackgroundCheckStats();
  const trend = stats.changeFromLastMonth.avgCompletionTime;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
        <Timer className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.avgCompletionTime} days</div>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
          {trend <= 0 ? (
            <>
              <TrendingDown className="h-3 w-3 text-green-500" />
              <span className="text-green-500">{Math.abs(trend)}%</span>
            </>
          ) : (
            <>
              <TrendingUp className="h-3 w-3 text-red-500" />
              <span className="text-red-500">+{trend}%</span>
            </>
          )}
          <span>from last month</span>
        </p>
      </CardContent>
    </Card>
  );
}
