import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { CheckCircle, TrendingUp, TrendingDown } from "lucide-react";
import { getBackgroundCheckStats } from '@/shared/lib/backgroundChecks/dashboardStats';

export function CompletionRateWidget() {
  const stats = getBackgroundCheckStats();
  const trend = stats.changeFromLastMonth.completionRate;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
        <CheckCircle className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.completionRate.toFixed(1)}%</div>
        <Progress value={stats.completionRate} className="h-2 mt-2" />
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
          {trend >= 0 ? (
            <>
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+{trend}%</span>
            </>
          ) : (
            <>
              <TrendingDown className="h-3 w-3 text-red-500" />
              <span className="text-red-500">{trend}%</span>
            </>
          )}
          <span>from last month</span>
        </p>
      </CardContent>
    </Card>
  );
}
