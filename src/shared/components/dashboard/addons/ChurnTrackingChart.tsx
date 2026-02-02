import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { getChurnMetrics } from '@/shared/lib/addons/cohortAnalytics';
import { Badge } from "@/shared/components/ui/badge";
import { AlertTriangle, TrendingDown } from 'lucide-react';

export function ChurnTrackingChart() {
  const data = getChurnMetrics();

  // Calculate trend
  const recentChurn = data.slice(-3).reduce((sum, d) => sum + d.churnRate, 0) / 3;
  const olderChurn = data.slice(0, 3).reduce((sum, d) => sum + d.churnRate, 0) / 3;
  const trend = ((recentChurn - olderChurn) / olderChurn) * 100;
  const isImproving = trend < 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Churn Rate Tracking
              {!isImproving && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Attention Needed
                </Badge>
              )}
              {isImproving && (
                <Badge variant="default" className="gap-1 bg-green-600">
                  <TrendingDown className="h-3 w-3" />
                  Improving
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Monthly customer churn by service type</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{recentChurn.toFixed(2)}%</div>
            <div className={`text-sm ${isImproving ? 'text-green-600' : 'text-red-600'}`}>
              {isImproving ? '↓' : '↑'} {Math.abs(trend).toFixed(1)}% vs 9mo ago
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              label={{ value: 'Customers Lost', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
              cursor={false}
              formatter={(value: number, name: string) => {
                const nameMap: Record<string, string> = {
                  aiInterviewsChurn: 'AI Interviews',
                  assessmentsChurn: 'Assessments',
                  backgroundChecksChurn: 'Background Checks',
                  totalChurn: 'Total Churned'
                };
                return [value, nameMap[name] || name];
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => {
                const nameMap: Record<string, string> = {
                  aiInterviewsChurn: 'AI Interviews',
                  assessmentsChurn: 'Assessments',
                  backgroundChecksChurn: 'Background Checks'
                };
                return nameMap[value] || value;
              }}
            />
            <Area
              type="monotone"
              dataKey="aiInterviewsChurn"
              stackId="1"
              stroke="hsl(var(--chart-1))"
              fill="hsl(var(--chart-1))"
              fillOpacity={0.6}
              strokeWidth={3}
            />
            <Area
              type="monotone"
              dataKey="assessmentsChurn"
              stackId="1"
              stroke="hsl(var(--chart-2))"
              fill="hsl(var(--chart-2))"
              fillOpacity={0.6}
              strokeWidth={3}
            />
            <Area
              type="monotone"
              dataKey="backgroundChecksChurn"
              stackId="1"
              stroke="hsl(var(--chart-3))"
              fill="hsl(var(--chart-3))"
              fillOpacity={0.6}
              strokeWidth={3}
            />
            <Line
              type="monotone"
              dataKey="totalChurn"
              stroke="hsl(var(--destructive))"
              strokeWidth={3}
              dot={false}
              activeDot={false}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Churn Rate Trend */}
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={data}>
              <XAxis dataKey="month" hide />
              <YAxis domain={[0, 'auto']} hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                cursor={false}
                formatter={(value: number) => [`${value}%`, 'Churn Rate']}
              />
              <Line
                type="monotone"
                dataKey="churnRate"
                stroke="hsl(var(--destructive))"
                strokeWidth={3}
                dot={false}
                activeDot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-center text-muted-foreground mt-1">Churn Rate Trend (%)</p>
        </div>
      </CardContent>
    </Card>
  );
}
