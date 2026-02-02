import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ClientLifetimeValue } from '@/types/businessMetrics';

interface ClientLifetimeValueChartProps {
  data: ClientLifetimeValue[];
  title?: string;
  description?: string;
  showPredictions?: boolean;
}

export function ClientLifetimeValueChart({ 
  data, 
  title = "Client Lifetime Value", 
  description,
  showPredictions = false 
}: ClientLifetimeValueChartProps) {
  const topClients = data.slice(0, 10);

  const chartData = topClients.map(client => ({
    name: client.clientName,
    actual: client.totalRevenue,
    predicted: showPredictions ? client.predictedAnnualRevenue : undefined,
    trend: client.trend,
    retention: client.retentionProbability,
  }));

  const getTrendIcon = (trend: 'growing' | 'stable' | 'declining') => {
    switch (trend) {
      case 'growing':
        return <TrendingUp className="h-3 w-3 text-success" />;
      case 'declining':
        return <TrendingDown className="h-3 w-3 text-destructive" />;
      default:
        return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: 'growing' | 'stable' | 'declining') => {
    switch (trend) {
      case 'growing':
        return 'hsl(var(--success))';
      case 'declining':
        return 'hsl(var(--destructive))';
      default:
        return 'hsl(var(--muted-foreground))';
    }
  };

  return (
    <Card className="transition-[background,border-color,box-shadow,color] duration-500">
      <CardHeader>
        <CardTitle className="transition-colors duration-500">{title}</CardTitle>
        {description && <CardDescription className="transition-colors duration-500">{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" className="text-xs" />
            <YAxis 
              dataKey="name" 
              type="category" 
              className="text-xs"
              width={120}
            />
            <Tooltip 
              formatter={(value: number) => `$${value.toLocaleString()}`}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold text-sm mb-2">{data.name}</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Total Revenue:</span>
                          <span className="font-medium">${data.actual.toLocaleString()}</span>
                        </div>
                        {showPredictions && data.predicted && (
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Predicted Annual:</span>
                            <span className="font-medium">${data.predicted.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Retention:</span>
                          <span className="font-medium">{data.retention.toFixed(0)}%</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Trend:</span>
                          <span className="flex items-center gap-1">
                            {getTrendIcon(data.trend)}
                            <span className="capitalize">{data.trend}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="actual" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getTrendColor(entry.trend)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3 w-3 text-success" />
            <span className="text-muted-foreground">Growing</span>
          </div>
          <div className="flex items-center gap-2">
            <Minus className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Stable</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingDown className="h-3 w-3 text-destructive" />
            <span className="text-muted-foreground">Declining</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
