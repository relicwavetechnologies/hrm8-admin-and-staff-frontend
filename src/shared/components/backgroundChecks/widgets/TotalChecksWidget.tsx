import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Shield, TrendingUp, TrendingDown } from "lucide-react";
import { getBackgroundCheckStats } from '@/shared/lib/backgroundChecks/dashboardStats';

export function TotalChecksWidget() {
  const stats = getBackgroundCheckStats();
  const trend = stats.changeFromLastMonth.total;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Background Checks</CardTitle>
        <Shield className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.total}</div>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
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
