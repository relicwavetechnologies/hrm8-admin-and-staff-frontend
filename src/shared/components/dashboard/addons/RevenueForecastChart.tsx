import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ResponsiveContainer, LineChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { getRevenueForecast } from '@/shared/lib/addons/revenueAnalytics';
import { useCurrencyFormat } from '@/contexts/CurrencyFormatContext';
import { Badge } from "@/shared/components/ui/badge";
import { TrendingUp } from 'lucide-react';

export function RevenueForecastChart() {
  const { formatCurrency } = useCurrencyFormat();
  const data = getRevenueForecast(6);

  // Calculate projected growth
  const lastActual = data.find(d => d.actual !== undefined);
  const lastForecast = data[data.length - 1];
  const projectedGrowth = lastActual && lastForecast
    ? ((lastForecast.forecast - lastActual.actual) / lastActual.actual) * 100
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Revenue Forecast
              <Badge variant="outline" className="gap-1">
                <TrendingUp className="h-3 w-3" />
                +{projectedGrowth.toFixed(1)}% projected
              </Badge>
            </CardTitle>
            <CardDescription>6-month revenue projection with 95% confidence interval</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
              cursor={false}
              formatter={(value: number, name: string) => {
                const nameMap: Record<string, string> = {
                  actual: 'Actual',
                  forecast: 'Forecast',
                  upperBound: 'Upper Bound',
                  lowerBound: 'Lower Bound'
                };
                return [value ? formatCurrency(value) : 'N/A', nameMap[name] || name];
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => {
                const nameMap: Record<string, string> = {
                  actual: 'Actual Revenue',
                  forecast: 'Forecasted Revenue',
                  upperBound: 'Upper Bound (95%)',
                  lowerBound: 'Lower Bound (95%)'
                };
                return nameMap[value] || value;
              }}
            />

            {/* Confidence interval area */}
            <Area
              type="monotone"
              dataKey="upperBound"
              stroke="none"
              fill="hsl(var(--primary))"
              fillOpacity={0.1}
            />
            <Area
              type="monotone"
              dataKey="lowerBound"
              stroke="none"
              fill="hsl(var(--background))"
              fillOpacity={1}
            />

            {/* Actual revenue line */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="hsl(var(--chart-1))"
              strokeWidth={3}
              dot={false}
              activeDot={false}
              connectNulls={false}
            />

            {/* Forecast line */}
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={false}
              activeDot={false}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-4 text-xs text-muted-foreground">
          <p>* Forecast based on historical trend analysis using linear regression</p>
          <p>* Confidence interval represents 95% probability range</p>
        </div>
      </CardContent>
    </Card>
  );
}
