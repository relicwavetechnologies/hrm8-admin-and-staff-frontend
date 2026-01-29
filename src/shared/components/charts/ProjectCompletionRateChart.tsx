import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jul', rate: 75 },
  { month: 'Aug', rate: 78 },
  { month: 'Sep', rate: 82 },
  { month: 'Oct', rate: 85 },
  { month: 'Nov', rate: 83 },
  { month: 'Dec', rate: 87 },
  { month: 'Jan', rate: 89 }
];

export function ProjectCompletionRateChart() {
  return (
    <Card className="shadow-md h-full">
      <CardHeader>
        <CardTitle>Project Completion Rate</CardTitle>
        <CardDescription>Completion rate trends over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="month" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              domain={[0, 100]}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
              formatter={(value: number) => `${value}%`}
            />
            <Area 
              type="monotone" 
              dataKey="rate" 
              stroke="hsl(var(--success))" 
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRate)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
