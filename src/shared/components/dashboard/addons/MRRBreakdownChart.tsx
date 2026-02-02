import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { getHistoricalMRR } from '@/shared/lib/addons/revenueAnalytics';
import { useCurrencyFormat } from '@/contexts/CurrencyFormatContext';
import { useState } from 'react';

export function MRRBreakdownChart() {
  const { formatCurrency } = useCurrencyFormat();
  const [timeRange, setTimeRange] = useState<'6' | '12' | '24'>('12');
  const data = getHistoricalMRR(parseInt(timeRange));

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Monthly Recurring Revenue</CardTitle>
            <CardDescription>Revenue breakdown by service over time</CardDescription>
          </div>
          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
            <TabsList>
              <TabsTrigger value="6">6M</TabsTrigger>
              <TabsTrigger value="12">12M</TabsTrigger>
              <TabsTrigger value="24">24M</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
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
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
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
                  aiInterviews: 'AI Interviews',
                  assessments: 'Assessments',
                  backgroundChecks: 'Background Checks',
                  total: 'Total Revenue'
                };
                return [formatCurrency(value), nameMap[name] || name];
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => {
                const nameMap: Record<string, string> = {
                  aiInterviews: 'AI Interviews',
                  assessments: 'Assessments',
                  backgroundChecks: 'Background Checks'
                };
                return nameMap[value] || value;
              }}
            />
            <Area
              type="monotone"
              dataKey="aiInterviews"
              stackId="1"
              stroke="hsl(var(--chart-1))"
              fill="hsl(var(--chart-1))"
              fillOpacity={0.8}
              strokeWidth={3}
            />
            <Area
              type="monotone"
              dataKey="assessments"
              stackId="1"
              stroke="hsl(var(--chart-2))"
              fill="hsl(var(--chart-2))"
              fillOpacity={0.8}
              strokeWidth={3}
            />
            <Area
              type="monotone"
              dataKey="backgroundChecks"
              stackId="1"
              stroke="hsl(var(--chart-3))"
              fill="hsl(var(--chart-3))"
              fillOpacity={0.8}
              strokeWidth={3}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={false}
              activeDot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
