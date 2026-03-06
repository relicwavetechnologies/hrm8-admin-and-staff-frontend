import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TimeToHireData } from "@/shared/lib/analyticsService";

interface TimeToHireTrendChartProps {
  data: TimeToHireData[];
}

export function TimeToHireTrendChart({ data }: TimeToHireTrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Time-to-Hire Trend</CardTitle>
        <CardDescription>Average days to hire over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload as TimeToHireData;
                return (
                  <div className="bg-background border rounded-lg p-3 shadow-lg">
                    <p className="font-medium mb-1">{data.period}</p>
                    <p className="text-sm text-muted-foreground">
                      {data.averageDays} days average
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {data.candidates} hires
                    </p>
                  </div>
                );
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="averageDays"
              stroke="#8b5cf6"
              strokeWidth={2}
              name="Avg. Days to Hire"
              dot={{ fill: '#8b5cf6', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
