import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { GeographicData } from '@/shared/types/businessMetrics';

interface GeographicRevenueChartProps {
  data: GeographicData[];
  title?: string;
  description?: string;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function GeographicRevenueChart({ data, title = "Geographic Revenue Distribution", description }: GeographicRevenueChartProps) {
  return (
    <Card className="transition-[background,border-color,box-shadow,color] duration-500">
      <CardHeader>
        <CardTitle className="transition-colors duration-500">{title}</CardTitle>
        {description && <CardDescription className="transition-colors duration-500">{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="revenue"
              nameKey="country"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={(entry) => `${entry.country}: $${entry.revenue.toLocaleString()}`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => `$${value.toLocaleString()}`}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--popover))',
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
