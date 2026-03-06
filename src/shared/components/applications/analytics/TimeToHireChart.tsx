import { Card } from '@/shared/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { TimeToHireMetrics } from '@/shared/lib/applications/analyticsService';

interface TimeToHireChartProps {
  data: TimeToHireMetrics;
}

export function TimeToHireChart({ data }: TimeToHireChartProps) {
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Time to Hire Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} label={{ value: 'Days', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              cursor={false}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Line
              type="monotone"
              dataKey="averageDays"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              name="Avg Days to Hire"
              dot={false}
              activeDot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Average Time to Hire by Final Stage</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.byStage} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="stage" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={100} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} label={{ value: 'Days', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              cursor={{ fill: 'transparent' }}
            />
            <Bar dataKey="averageDays" fill="hsl(var(--chart-1))" name="Avg Days" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
