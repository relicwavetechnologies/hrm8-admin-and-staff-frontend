import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const data = [
  { stage: "Applied", count: 100, color: "hsl(var(--primary))" },
  { stage: "Screening", count: 75, color: "hsl(var(--chart-2))" },
  { stage: "Interview", count: 40, color: "hsl(var(--chart-3))" },
  { stage: "Offer", count: 15, color: "hsl(var(--chart-4))" },
  { stage: "Placed", count: 10, color: "hsl(var(--chart-5))" },
];

export function CandidatePipelineChart() {
  return (
    <Card className="shadow-md h-full">
      <CardHeader>
        <CardTitle>Candidate Pipeline</CardTitle>
        <CardDescription>Candidates at each recruitment stage</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="stage" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
