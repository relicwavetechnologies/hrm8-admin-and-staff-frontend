import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { getHealthMetrics } from '@/shared/lib/addons/customerHealthAnalytics';

export function HealthScoreDistributionChart() {
  const metrics = getHealthMetrics();
  
  const data = [
    { grade: 'Excellent', count: metrics.excellentHealth, range: '85-100', color: 'hsl(var(--chart-2))' },
    { grade: 'Good', count: metrics.goodHealth, range: '70-84', color: 'hsl(var(--chart-1))' },
    { grade: 'Fair', count: metrics.fairHealth, range: '50-69', color: 'hsl(var(--chart-3))' },
    { grade: 'Poor', count: metrics.poorHealth, range: '30-49', color: 'hsl(var(--orange))' },
    { grade: 'Critical', count: metrics.criticalHealth, range: '0-29', color: 'hsl(var(--destructive))' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Score Distribution</CardTitle>
        <CardDescription>
          Number of customers in each health grade
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="grade" 
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
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold mb-1">{data.grade}</p>
                      <p className="text-sm text-muted-foreground mb-1">Score: {data.range}</p>
                      <p className="text-sm">
                        <span className="font-medium">{data.count}</span> customers
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" name="Customers" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
