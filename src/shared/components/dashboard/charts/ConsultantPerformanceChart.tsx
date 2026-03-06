import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { consultant: 'John Smith', projects: 8, placements: 15, revenue: 250 },
  { consultant: 'Sarah Johnson', projects: 6, placements: 12, revenue: 200 },
  { consultant: 'Michael Chen', projects: 5, placements: 8, revenue: 180 },
  { consultant: 'Emily Davis', projects: 7, placements: 14, revenue: 220 },
  { consultant: 'David Wilson', projects: 4, placements: 7, revenue: 150 }
];

export function ConsultantPerformanceChart() {
  return (
    <Card className="shadow-md h-full">
      <CardHeader>
        <CardTitle>Consultant Performance</CardTitle>
        <CardDescription>Active projects and placements by consultant</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="consultant" 
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
            <Bar dataKey="projects" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Projects" />
            <Bar dataKey="placements" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} name="Placements" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
