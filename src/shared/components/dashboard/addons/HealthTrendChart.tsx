import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, ComposedChart } from 'recharts';
import { getHealthTrendData } from '@/shared/lib/addons/customerHealthAnalytics';

export function HealthTrendChart() {
  const data = getHealthTrendData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Score Trends</CardTitle>
        <CardDescription>
          Average health score and distribution over the last 12 weeks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12 }}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="averageScore" 
              name="Avg Score" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="excellent" 
              name="Excellent" 
              stroke="hsl(var(--chart-2))" 
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            <Line 
              type="monotone" 
              dataKey="critical" 
              name="Critical" 
              stroke="hsl(var(--destructive))" 
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
