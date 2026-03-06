import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { getAddonRevenueTrends } from '@/shared/lib/addons/combinedAnalytics';
import { useCurrencyFormat } from '@/contexts/CurrencyFormatContext';

export function CombinedRevenueChart() {
  const { formatCurrency } = useCurrencyFormat();
  const data = getAddonRevenueTrends(6);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add-on Revenue Trends</CardTitle>
        <CardDescription>Combined revenue from all add-on services</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tickFormatter={(value) => {
                const date = new Date(value + '-01');
                return date.toLocaleDateString('en-US', { month: 'short' });
              }}
            />
            <YAxis 
              className="text-xs"
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))', 
                border: '1px solid hsl(var(--border))' 
              }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="aiInterviews" 
              stackId="1"
              stroke="hsl(var(--chart-1))" 
              fill="hsl(var(--chart-1))"
              name="AI Interviews"
            />
            <Area 
              type="monotone" 
              dataKey="assessments" 
              stackId="1"
              stroke="hsl(var(--chart-2))" 
              fill="hsl(var(--chart-2))"
              name="Assessments"
            />
            <Area 
              type="monotone" 
              dataKey="backgroundChecks" 
              stackId="1"
              stroke="hsl(var(--chart-3))" 
              fill="hsl(var(--chart-3))"
              name="Background Checks"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
