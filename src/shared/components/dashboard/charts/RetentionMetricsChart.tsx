import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import type { RetentionMetrics } from '@/types/businessMetrics';


interface RetentionMetricsChartProps {
  data: RetentionMetrics;
  title?: string;
  description?: string;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--destructive))',
];

export function RetentionMetricsChart({
  data,
  title = "Client Retention Metrics",
  description
}: RetentionMetricsChartProps) {
  const tenureData = data.clientsByTenure.map((item, index: number) => ({
    ...item,
    fill: COLORS[index % COLORS.length],
  }));

  return (
    <Card className="transition-[background,border-color,box-shadow,color] duration-500">
      <CardHeader>
        <CardTitle className="transition-colors duration-500">{title}</CardTitle>
        {description && <CardDescription className="transition-colors duration-500">{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Key Metrics */}
          <div className="space-y-4">
            <div className="rounded-lg border bg-card p-4 transition-[background,border-color,box-shadow,color] duration-500">
              <p className="text-sm text-muted-foreground">Total Clients</p>
              <p className="text-2xl font-bold">{data.totalClients}</p>
            </div>

            <div className="rounded-lg border bg-card p-4 transition-[background,border-color,box-shadow,color] duration-500">
              <p className="text-sm text-muted-foreground">Active Clients</p>
              <p className="text-2xl font-bold text-success">{data.activeClients}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {data.retentionRate.toFixed(1)}% retention rate
              </p>
            </div>

            <div className="rounded-lg border bg-card p-4 transition-[background,border-color,box-shadow,color] duration-500">
              <p className="text-sm text-muted-foreground">Churned Clients</p>
              <p className="text-2xl font-bold text-destructive">{data.churnedClients}</p>
            </div>

            <div className="rounded-lg border bg-card p-4 transition-[background,border-color,box-shadow,color] duration-500">
              <p className="text-sm text-muted-foreground">Avg. Client Lifespan</p>
              <p className="text-2xl font-bold">{data.averageClientLifespan.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground mt-1">months</p>
            </div>
          </div>

          {/* Tenure Distribution */}
          <div className="flex flex-col">
            <h4 className="text-sm font-medium mb-4">Clients by Tenure</h4>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={tenureData}
                  dataKey="count"
                  nameKey="tenure"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry: { tenure: string; count: number }) => `${entry.tenure}: ${entry.count}`}
                  labelLine={false}
                >
                  {tenureData.map((_entry, index: number) => (
                    <Cell key={`cell-${index}`} fill={tenureData[index].fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
