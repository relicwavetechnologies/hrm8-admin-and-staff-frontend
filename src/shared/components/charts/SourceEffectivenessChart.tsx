import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { SourceEffectivenessMetrics } from "@/shared/lib/analyticsService";

interface SourceEffectivenessChartProps {
  data: SourceEffectivenessMetrics[];
}

export function SourceEffectivenessChart({ data }: SourceEffectivenessChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Source Effectiveness</CardTitle>
        <CardDescription>Candidate sources performance comparison</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="source"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload as SourceEffectivenessMetrics;
                return (
                  <div className="bg-background border rounded-lg p-3 shadow-lg">
                    <p className="font-medium mb-2">{data.source}</p>
                    <div className="space-y-1 text-sm">
                      <p>Total: {data.candidates} candidates</p>
                      <p>Hired: {data.hired} ({data.conversionRate}%)</p>
                      <p>Avg. Time to Hire: {data.averageTimeToHire} days</p>
                      <p>Avg. Rating: {data.averageRating}/5</p>
                    </div>
                  </div>
                );
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="candidates" fill="#8b5cf6" name="Total Candidates" radius={[4, 4, 0, 0]} barSize={45} />
            <Bar dataKey="hired" fill="#22c55e" name="Hired" radius={[4, 4, 0, 0]} barSize={45} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
