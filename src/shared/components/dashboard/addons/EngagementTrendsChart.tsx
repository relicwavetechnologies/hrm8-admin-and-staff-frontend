import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getChurnTrendData } from '@/shared/lib/addons/churnPredictionAnalytics';

export function EngagementTrendsChart() {
  const data = getChurnTrendData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Churn & Prevention Trends</CardTitle>
        <CardDescription>
          Monthly churn rate and successful interventions over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="month" 
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
              dataKey="churnRate" 
              name="Churn Rate %" 
              stroke="hsl(var(--destructive))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--destructive))' }}
            />
            <Line 
              type="monotone" 
              dataKey="atRisk" 
              name="At-Risk Customers" 
              stroke="hsl(var(--orange))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--orange))' }}
            />
            <Line 
              type="monotone" 
              dataKey="prevented" 
              name="Churn Prevented" 
              stroke="hsl(var(--chart-2))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--chart-2))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
