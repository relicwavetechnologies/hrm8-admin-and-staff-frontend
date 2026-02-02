import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ChartContainer, ChartConfig } from "@/shared/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

const data = [
  { month: "Jan", revenue: 2100, expenses: 1650 },
  { month: "Feb", revenue: 2250, expenses: 1700 },
  { month: "Mar", revenue: 2350, expenses: 1750 },
  { month: "Apr", revenue: 2200, expenses: 1800 },
  { month: "May", revenue: 2500, expenses: 1850 },
  { month: "Jun", revenue: 2400, expenses: 1800 },
];

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  expenses: {
    label: "Expenses",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function RevenueExpenseChart() {
  return (
    <Card className="shadow-md h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-4">
        <CardTitle>Revenue vs Expenses</CardTitle>
        <CardDescription>Revenue and expense trends (in thousands)</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4 min-h-0">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Revenue" />
            <Line type="monotone" dataKey="expenses" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Expenses" />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
