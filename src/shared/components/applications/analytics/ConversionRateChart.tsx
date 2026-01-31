import { Card } from '@/shared/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import type { ConversionRateMetrics } from '@/shared/lib/applications/analyticsService';

interface ConversionRateChartProps {
  data: ConversionRateMetrics;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function ConversionRateChart({ data }: ConversionRateChartProps) {
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Conversion Funnel</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data.funnel} layout="vertical" margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="stage" width={150} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              cursor={{ fill: 'transparent' }}
              formatter={(value: any, name: string) => {
                if (name === 'count') return [value, 'Candidates'];
                return [value + '%', 'Conversion Rate'];
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="count" fill="hsl(var(--chart-1))" name="Candidates" radius={[0, 4, 4, 0]}>
              {data.funnel.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Conversion Rate by Stage</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.byStage} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="stage" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={100} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} label={{ value: 'Conversion %', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              cursor={{ fill: 'transparent' }}
              formatter={(value: any) => [value + '%', 'Conversion Rate']}
            />
            <Bar dataKey="rate" fill="hsl(var(--chart-2))" name="Conversion %" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
