import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/shared/hooks/use-toast';
import type { CheckTypeMetrics } from '@/shared/lib/backgroundChecks/analyticsService';

interface CheckTypeComparisonChartProps {
  data: CheckTypeMetrics[];
}

export function CheckTypeComparisonChart({ data }: CheckTypeComparisonChartProps) {
  const navigate = useNavigate();

  const handleBarClick = (data: any) => {
    if (!data || !data.type) return;

    // Convert display name back to type key
    const typeMap: Record<string, string> = {
      'Reference': 'reference',
      'Criminal': 'criminal',
      'Identity': 'identity',
      'Education': 'education',
      'Employment': 'employment',
      'Credit': 'credit',
      'Drug Screen': 'drug-screen',
      'Professional License': 'professional-license',
    };

    const checkType = typeMap[data.type] || data.type.toLowerCase();

    // Navigate to main page with check type filter
    const params = new URLSearchParams({
      checkType,
    });

    navigate(`/background-checks?${params.toString()}`);

    toast({
      title: "Filters Applied",
      description: `Viewing ${data.type} checks`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Check Type Comparison</CardTitle>
        <CardDescription>Volume, completion time, and success rate by check type. Click on any bar to view those checks.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="type" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={100} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              cursor={{ fill: 'transparent' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar
              dataKey="total"
              fill="hsl(var(--primary))"
              name="Total Checks"
              onClick={handleBarClick}
              cursor="pointer"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="completed"
              fill="hsl(var(--success))"
              name="Completed"
              onClick={handleBarClick}
              cursor="pointer"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="avgTime"
              fill="hsl(var(--warning))"
              name="Avg. Days"
              onClick={handleBarClick}
              cursor="pointer"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
