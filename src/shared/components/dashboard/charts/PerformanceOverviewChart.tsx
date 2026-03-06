import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
  { department: "Eng", excellent: 45, good: 55, average: 15, poor: 5 },
  { department: "Sales", excellent: 30, good: 35, average: 10, poor: 3 },
  { department: "Mkt", excellent: 20, good: 20, average: 5, poor: 0 },
  { department: "Ops", excellent: 25, good: 25, average: 5, poor: 1 },
  { department: "HR", excellent: 15, good: 10, average: 3, poor: 0 },
];

export function PerformanceOverviewChart() {
  return (
    <Card className="shadow-md h-full">
      <CardHeader>
        <CardTitle>Performance Overview</CardTitle>
        <CardDescription>Employee performance metrics by department</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="department" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip />
            <Legend />
            <Bar dataKey="excellent" stackId="a" fill="hsl(var(--chart-1))" name="Excellent" />
            <Bar dataKey="good" stackId="a" fill="hsl(var(--chart-2))" name="Good" />
            <Bar dataKey="average" stackId="a" fill="hsl(var(--chart-3))" name="Average" />
            <Bar dataKey="poor" stackId="a" fill="hsl(var(--chart-4))" name="Needs Improvement" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
