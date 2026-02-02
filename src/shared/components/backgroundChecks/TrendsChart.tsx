import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/shared/hooks/use-toast';
import type { TrendDataPoint } from '@/shared/lib/backgroundChecks/analyticsService';

interface TrendsChartProps {
  data: TrendDataPoint[];
}

export function TrendsChart({ data }: TrendsChartProps) {
  const navigate = useNavigate();

  const handleDataPointClick = (data: any) => {
    if (!data || !data.activePayload || !data.activePayload[0]) return;

    const point = data.activePayload[0].payload;
    const date = point.date;

    // Navigate to main page with date filter
    const params = new URLSearchParams({
      dateFrom: date,
      dateTo: date,
    });

    navigate(`/background-checks?${params.toString()}`);

    toast({
      title: "Filters Applied",
      description: `Viewing checks from ${new Date(date).toLocaleDateString()}`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trends Over Time</CardTitle>
        <CardDescription>Check volume, completion rates, and average processing time. Click on any point to view those checks.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} onClick={handleDataPointClick} style={{ cursor: 'pointer' }} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              dy={10}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              cursor={false}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Line
              type="monotone"
              dataKey="totalChecks"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              name="Total Checks"
              dot={false}
              activeDot={false}
            />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="hsl(var(--success))"
              strokeWidth={3}
              name="Completed"
              dot={false}
              activeDot={false}
            />
            <Line
              type="monotone"
              dataKey="inProgress"
              stroke="hsl(var(--warning))"
              strokeWidth={3}
              name="In Progress"
              dot={false}
              activeDot={false}
            />
            <Line
              type="monotone"
              dataKey="avgCompletionTime"
              stroke="hsl(var(--info))"
              strokeWidth={3}
              name="Avg. Days to Complete"
              dot={false}
              activeDot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
