import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const data = [
  { name: "LinkedIn", value: 35, color: "hsl(var(--chart-1))" },
  { name: "Job Boards", value: 28, color: "hsl(var(--chart-2))" },
  { name: "Referrals", value: 20, color: "hsl(var(--chart-3))" },
  { name: "Direct Apply", value: 12, color: "hsl(var(--chart-4))" },
  { name: "Agencies", value: 5, color: "hsl(var(--chart-5))" },
];

export function CandidateSourceDistributionChart() {
  return (
    <Card className="shadow-md h-full">
      <CardHeader>
        <CardTitle>Candidate Sources</CardTitle>
        <CardDescription>Distribution by source channel</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
