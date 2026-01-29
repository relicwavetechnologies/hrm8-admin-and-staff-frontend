import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { skill: "React", count: 45 },
  { skill: "JavaScript", count: 42 },
  { skill: "Python", count: 38 },
  { skill: "Node.js", count: 35 },
  { skill: "TypeScript", count: 32 },
  { skill: "AWS", count: 28 },
  { skill: "SQL", count: 26 },
  { skill: "Docker", count: 24 },
  { skill: "Java", count: 22 },
  { skill: "Git", count: 20 },
];

export function TopSkillsDemandChart() {
  return (
    <Card className="shadow-md h-full">
      <CardHeader>
        <CardTitle>Top Skills in Demand</CardTitle>
        <CardDescription>Most common skills in candidate pool</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" className="text-xs" />
            <YAxis dataKey="skill" type="category" className="text-xs" width={80} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
