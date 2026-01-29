import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { month: 'Jul', revenue: 180, target: 150 },
  { month: 'Aug', revenue: 200, target: 175 },
  { month: 'Sep', revenue: 220, target: 200 },
  { month: 'Oct', revenue: 240, target: 225 },
  { month: 'Nov', revenue: 280, target: 250 },
  { month: 'Dec', revenue: 320, target: 275 },
  { month: 'Jan', revenue: 350, target: 300 }
];

export function ServiceRevenueTrendsChart() {
  return (
    <Card className="shadow-md h-full">
      <CardHeader>
        <CardTitle>Service Revenue Trends</CardTitle>
        <CardDescription>Revenue over time (in thousands)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="month" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))' }}
              name="Actual Revenue"
            />
            <Line 
              type="monotone" 
              dataKey="target" 
              stroke="hsl(var(--muted-foreground))" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: 'hsl(var(--muted-foreground))' }}
              name="Target"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
