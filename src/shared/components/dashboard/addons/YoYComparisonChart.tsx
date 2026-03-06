import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts';
import { getYoYComparison } from '@/shared/lib/addons/revenueAnalytics';
import { useCurrencyFormat } from '@/contexts/CurrencyFormatContext';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function YoYComparisonChart() {
  const { formatCurrency } = useCurrencyFormat();
  const data = getYoYComparison();

  // Calculate overall YoY growth
  const totalCurrentYear = data.reduce((sum, d) => sum + d.currentYear, 0);
  const totalPreviousYear = data.reduce((sum, d) => sum + d.previousYear, 0);
  const overallGrowth = ((totalCurrentYear - totalPreviousYear) / totalPreviousYear) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Year-over-Year Growth
          <span className={`flex items-center gap-1 text-sm font-normal ${overallGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {overallGrowth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {overallGrowth >= 0 ? '+' : ''}{overallGrowth.toFixed(1)}%
          </span>
        </CardTitle>
        <CardDescription>Comparing last 12 months to previous year</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
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
              cursor={{ fill: 'transparent' }}
              formatter={(value: number, name: string) => {
                const nameMap: Record<string, string> = {
                  currentYear: 'Current Year',
                  previousYear: 'Previous Year'
                };
                return [formatCurrency(value), nameMap[name] || name];
              }}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => {
                const nameMap: Record<string, string> = {
                  currentYear: 'Current Year',
                  previousYear: 'Previous Year'
                };
                return nameMap[value] || value;
              }}
            />
            <Bar
              dataKey="previousYear"
              fill="hsl(var(--chart-4))"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="currentYear"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.growthPercentage >= 0 ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
