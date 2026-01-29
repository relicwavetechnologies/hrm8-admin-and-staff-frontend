import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ClientRevenueData } from '@/shared/types/businessMetrics';

interface TopClientsChartProps {
  data: ClientRevenueData[];
  title?: string;
  description?: string;
}

export function TopClientsChart({ data, title = "Top Clients by Revenue", description }: TopClientsChartProps) {
  return (
    <Card className="transition-[background,border-color,box-shadow,color] duration-500">
      <CardHeader>
        <CardTitle className="transition-colors duration-500">{title}</CardTitle>
        {description && <CardDescription className="transition-colors duration-500">{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" className="text-xs" />
            <YAxis 
              dataKey="clientName" 
              type="category" 
              className="text-xs"
              width={120}
            />
            <Tooltip 
              formatter={(value: number) => `$${value.toLocaleString()}`}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
