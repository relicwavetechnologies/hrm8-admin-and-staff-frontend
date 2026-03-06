import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { getServiceMixDistribution } from '@/shared/lib/addons/combinedAnalytics';
import { useCurrencyFormat } from '@/contexts/CurrencyFormatContext';

export function ServiceMixChart() {
  const { formatCurrency } = useCurrencyFormat();
  const data = getServiceMixDistribution();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Mix</CardTitle>
        <CardDescription>Revenue distribution by service type</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={false}
              outerRadius={80}
              fill="hsl(var(--primary))"
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))'
              }}
              formatter={(value: number, name: string, props: any) => [
                `${formatCurrency(value)} (${props.payload.count} services)`,
                name
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
