import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrencyNumber } from "@/shared/lib/currencyUtils";

const data = [
  { level: "Entry", min: 45000, avg: 55000, max: 65000 },
  { level: "Mid", min: 65000, avg: 85000, max: 105000 },
  { level: "Senior", min: 95000, avg: 125000, max: 155000 },
  { level: "Executive", min: 140000, avg: 180000, max: 220000 },
];

export function SalaryExpectationsChart() {
  return (
    <Card className="shadow-md h-full">
      <CardHeader>
        <CardTitle>Salary Expectations</CardTitle>
        <CardDescription>Salary ranges by experience level</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="level" className="text-xs" />
            <YAxis 
              className="text-xs" 
              tickFormatter={(value) => `$${formatCurrencyNumber(value)}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
              formatter={(value: number) => `$${formatCurrencyNumber(value)}`}
            />
            <Bar dataKey="min" fill="hsl(var(--chart-3))" radius={[8, 8, 0, 0]} name="Min" />
            <Bar dataKey="avg" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} name="Average" />
            <Bar dataKey="max" fill="hsl(var(--chart-4))" radius={[8, 8, 0, 0]} name="Max" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
