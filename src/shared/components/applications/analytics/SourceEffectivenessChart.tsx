import { Card } from '@/shared/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ScatterChart, Scatter, ZAxis } from 'recharts';
import type { SourceEffectiveness } from '@/shared/lib/applications/analyticsService';

interface SourceEffectivenessChartProps {
  data: SourceEffectiveness;
}

export function SourceEffectivenessChart({ data }: SourceEffectivenessChartProps) {
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Applications by Source</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.sources} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="source" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              cursor={{ fill: 'transparent' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="count" fill="hsl(var(--chart-1))" name="Applications" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Source Performance Matrix</h3>
        <div className="mb-4 text-sm text-muted-foreground">
          Comparing conversion rate vs. time to hire (bubble size = application volume)
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="conversionRate"
              name="Conversion Rate"
              unit="%"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              label={{ value: 'Conversion Rate (%)', position: 'insideBottom', offset: -5 }}
              dy={10}
            />
            <YAxis
              dataKey="avgTimeToHire"
              name="Avg Time to Hire"
              unit=" days"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              label={{ value: 'Avg Time to Hire (days)', angle: -90, position: 'insideLeft' }}
            />
            <ZAxis dataKey="count" range={[50, 400]} name="Applications" />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(value: any, name: string) => {
                if (name === 'Conversion Rate') return [value + '%', name];
                if (name === 'Avg Time to Hire') return [value + ' days', name];
                return [value, name];
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Scatter
              data={data.sources}
              fill="hsl(var(--chart-3))"
              name="Source"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
