import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { getClientAdoptionStats } from '@/shared/lib/addons/combinedAnalytics';

export function ClientAdoptionChart() {
  const stats = getClientAdoptionStats();

  const data = [
    { name: 'Using 1 Service', clients: stats.usingOne, fill: 'hsl(var(--chart-1))' },
    { name: 'Using 2 Services', clients: stats.usingTwo, fill: 'hsl(var(--chart-2))' },
    { name: 'Using All 3', clients: stats.usingAll, fill: 'hsl(var(--chart-3))' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Adoption Patterns</CardTitle>
        <CardDescription>How clients utilize add-on services</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))'
              }}
              cursor={{ fill: 'transparent' }}
              formatter={(value: number) => [`${value} clients`, 'Count']}
            />
            <Bar dataKey="clients" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
