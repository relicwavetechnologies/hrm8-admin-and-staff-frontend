import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendData } from "@/shared/lib/analyticsService";

interface CandidateTrendChartProps {
  data: TrendData[];
}

export function CandidateTrendChart({ data }: CandidateTrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Candidate Activity Trends</CardTitle>
        <CardDescription>Monthly candidate inflow and outcomes</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload as TrendData;
                return (
                  <div className="bg-background border rounded-lg p-3 shadow-lg">
                    <p className="font-medium mb-2">{data.date}</p>
                    <div className="space-y-1 text-sm">
                      <p className="text-purple-600">Total: {data.candidates}</p>
                      <p className="text-green-600">Hired: {data.hired}</p>
                      <p className="text-red-600">Rejected: {data.rejected}</p>
                    </div>
                  </div>
                );
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="candidates" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              name="Total Candidates"
              dot={{ fill: '#8b5cf6', r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="hired" 
              stroke="#22c55e" 
              strokeWidth={2}
              name="Hired"
              dot={{ fill: '#22c55e', r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="rejected" 
              stroke="#ef4444" 
              strokeWidth={2}
              name="Rejected"
              dot={{ fill: '#ef4444', r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
