import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { TrendData } from '@/types/businessMetrics';

interface RevenueTrendsChartProps {
  data: TrendData[];
  title?: string;
  description?: string;
}

export function RevenueTrendsChart({ data, title = "Revenue & Volume Trends", description }: RevenueTrendsChartProps) {
  return (
    <Card className="transition-[background,border-color,box-shadow,color] duration-500">
      <CardHeader>
        <CardTitle className="transition-colors duration-500">{title}</CardTitle>
        {description && <CardDescription className="transition-colors duration-500">{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis yAxisId="left" className="text-xs" />
            <YAxis yAxisId="right" orientation="right" className="text-xs" />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name === 'Revenue' || name === 'Profit') {
                  return `$${value.toLocaleString()}`;
                }
                return value;
              }}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="revenue" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              name="Revenue"
              dot={{ fill: 'hsl(var(--primary))' }}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="profit" 
              stroke="hsl(var(--success))" 
              strokeWidth={2}
              name="Profit"
              dot={{ fill: 'hsl(var(--success))' }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="volume" 
              stroke="hsl(var(--warning))" 
              strokeWidth={2}
              name="Volume"
              dot={{ fill: 'hsl(var(--warning))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
