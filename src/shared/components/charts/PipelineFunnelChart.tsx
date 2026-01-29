import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface PipelineFunnelChartProps {
  data: Array<{ stage: string; candidates: number; conversionRate: number }>;
}

const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe', '#f5f3ff'];

export function PipelineFunnelChart({ data }: PipelineFunnelChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Conversion Funnel</CardTitle>
        <CardDescription>Candidate progression through stages</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <YAxis
              dataKey="stage"
              type="category"
              width={100}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-background border rounded-lg p-3 shadow-lg">
                    <p className="font-medium">{data.stage}</p>
                    <p className="text-sm text-muted-foreground">
                      {data.candidates} candidates ({data.conversionRate}%)
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="candidates" radius={[0, 4, 4, 0]} barSize={32}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
