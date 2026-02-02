import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { getChurnPredictions } from '@/shared/lib/addons/churnPredictionAnalytics';

export function ChurnRiskDistributionChart() {
  const predictions = getChurnPredictions();
  
  const data = [
    { name: 'Critical Risk', value: predictions.filter(p => p.riskLevel === 'critical').length, color: 'hsl(var(--destructive))' },
    { name: 'High Risk', value: predictions.filter(p => p.riskLevel === 'high').length, color: 'hsl(var(--orange))' },
    { name: 'Medium Risk', value: predictions.filter(p => p.riskLevel === 'medium').length, color: 'hsl(var(--yellow))' },
    { name: 'Low Risk', value: predictions.filter(p => p.riskLevel === 'low').length, color: 'hsl(var(--chart-2))' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Distribution</CardTitle>
        <CardDescription>
          Customer distribution across risk levels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
