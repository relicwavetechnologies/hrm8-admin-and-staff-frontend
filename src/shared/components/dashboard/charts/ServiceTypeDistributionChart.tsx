import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const data = [
  { name: 'Shortlisting', value: 12, color: 'hsl(var(--primary))' },
  { name: 'Full-Service', value: 8, color: 'hsl(var(--success))' },
  { name: 'Executive Search', value: 5, color: 'hsl(var(--warning))' },
  { name: 'RPO', value: 3, color: 'hsl(var(--info))' }
];

export function ServiceTypeDistributionChart() {
  return (
    <Card className="shadow-md h-full">
      <CardHeader>
        <CardTitle>Service Type Distribution</CardTitle>
        <CardDescription>Active projects by type</CardDescription>
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
              outerRadius={80}
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
