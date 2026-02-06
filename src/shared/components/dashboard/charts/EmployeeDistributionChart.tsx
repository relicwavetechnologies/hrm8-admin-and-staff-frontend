import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const data = [
  { name: "Engineering", value: 120 },
  { name: "Marketing", value: 45 },
  { name: "Sales", value: 78 },
  { name: "Operations", value: 56 },
  { name: "HR", value: 28 },
  { name: "Finance", value: 15 },
];

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--muted-foreground))",
];

export function EmployeeDistributionChart() {
  return (
    <Card className="shadow-md h-full">
      <CardHeader>
        <CardTitle>Employee Distribution</CardTitle>
        <CardDescription>Employees by department</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="hsl(var(--primary))"
              dataKey="value"
            >
              {data.map((entry, index) => {
                void entry;
                return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
              })}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
