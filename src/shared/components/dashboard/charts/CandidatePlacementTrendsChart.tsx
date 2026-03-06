import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

const data = [
  { month: "Jan", placements: 8 },
  { month: "Feb", placements: 12 },
  { month: "Mar", placements: 10 },
  { month: "Apr", placements: 15 },
  { month: "May", placements: 18 },
  { month: "Jun", placements: 14 },
  { month: "Jul", placements: 20 },
  { month: "Aug", placements: 22 },
  { month: "Sep", placements: 19 },
  { month: "Oct", placements: 25 },
  { month: "Nov", placements: 28 },
  { month: "Dec", placements: 24 },
];

export function CandidatePlacementTrendsChart() {
  return (
    <Card className="shadow-md h-full">
      <CardHeader>
        <CardTitle>Placement Trends</CardTitle>
        <CardDescription>Successful placements over the last 12 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPlacements" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="placements" 
              stroke="hsl(var(--primary))" 
              fillOpacity={1} 
              fill="url(#colorPlacements)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
