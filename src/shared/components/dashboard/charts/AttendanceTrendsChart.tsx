import { StandardChartCard } from "./StandardChartCard";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Download, Calendar, BarChart3 } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";

const data = [
  { month: "Jan", attendance: 92, target: 95 },
  { month: "Feb", attendance: 93, target: 95 },
  { month: "Mar", attendance: 94, target: 95 },
  { month: "Apr", attendance: 94.5, target: 95 },
  { month: "May", attendance: 94.2, target: 95 },
  { month: "Jun", attendance: 93.8, target: 95 },
];

export function AttendanceTrendsChart() {
  const { toast } = useToast();
  
  return (
    <StandardChartCard
      title="Attendance Trends"
      description="Daily attendance patterns over time"
      showDatePicker={true}
      onDownload={() => toast({ title: "Downloading attendance data..." })}
      menuItems={[
        { label: "View Full Report", icon: <BarChart3 className="h-4 w-4" />, onClick: () => {} },
        { label: "Compare Periods", icon: <Calendar className="h-4 w-4" />, onClick: () => {} },
        { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => {} }
      ]}
    >
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="month" className="text-xs" />
          <YAxis className="text-xs" domain={[90, 100]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="attendance" stroke="hsl(var(--primary))" strokeWidth={2} name="Actual" />
          <Line type="monotone" dataKey="target" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" name="Target" />
        </LineChart>
      </ResponsiveContainer>
    </StandardChartCard>
  );
}
