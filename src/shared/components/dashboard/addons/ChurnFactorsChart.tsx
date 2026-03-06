import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

export function ChurnFactorsChart() {
  const data = [
    { factor: 'Low Engagement', impact: 28, count: 12 },
    { factor: 'Poor Feature Usage', impact: 24, count: 15 },
    { factor: 'Payment Issues', impact: 18, count: 8 },
    { factor: 'Support Tickets', impact: 15, count: 18 },
    { factor: 'Low NPS Score', impact: 15, count: 10 }
  ];

  const COLORS = ['hsl(var(--destructive))', 'hsl(var(--orange))', 'hsl(var(--yellow))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Churn Risk Factors</CardTitle>
        <CardDescription>
          Primary indicators driving customer churn risk
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
            <YAxis dataKey="factor" type="category" width={150} stroke="hsl(var(--muted-foreground))" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend />
            <Bar dataKey="impact" name="Avg Impact %" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
