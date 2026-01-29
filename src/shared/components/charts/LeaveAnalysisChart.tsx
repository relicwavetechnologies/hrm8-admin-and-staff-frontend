import { StandardChartCard } from "./StandardChartCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Download, Eye, Calendar } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";

const data = [
  { month: "Jan", vacation: 15, sick: 8, personal: 5 },
  { month: "Feb", vacation: 12, sick: 10, personal: 4 },
  { month: "Mar", vacation: 18, sick: 7, personal: 6 },
  { month: "Apr", vacation: 20, sick: 9, personal: 7 },
  { month: "May", vacation: 25, sick: 6, personal: 5 },
  { month: "Jun", vacation: 30, sick: 8, personal: 8 },
];

export function LeaveAnalysisChart() {
  const { toast } = useToast();
  
  return (
    <StandardChartCard
      title="Leave Analysis"
      description="Leave trends and types"
      showDatePicker={true}
      onDownload={() => toast({ title: "Downloading leave data..." })}
      menuItems={[
        { label: "View Calendar", icon: <Calendar className="h-4 w-4" />, onClick: () => {} },
        { label: "View Details", icon: <Eye className="h-4 w-4" />, onClick: () => {} },
        { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => {} }
      ]}
    >
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="month" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip />
          <Legend />
          <Bar dataKey="vacation" fill="hsl(var(--chart-1))" name="Vacation" />
          <Bar dataKey="sick" fill="hsl(var(--chart-2))" name="Sick Leave" />
          <Bar dataKey="personal" fill="hsl(var(--chart-3))" name="Personal" />
        </BarChart>
      </ResponsiveContainer>
    </StandardChartCard>
  );
}
