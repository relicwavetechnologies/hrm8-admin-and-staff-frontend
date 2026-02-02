import { StandardChartCard } from "./StandardChartCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Download, Eye, BarChart3 } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";

const data = [
  { team: "Team A", billable: 85, non_billable: 15 },
  { team: "Team B", billable: 78, non_billable: 22 },
  { team: "Team C", billable: 92, non_billable: 8 },
  { team: "Team D", billable: 70, non_billable: 30 },
  { team: "Team E", billable: 88, non_billable: 12 },
];

export function ResourceAllocationChart() {
  const { toast } = useToast();
  
  return (
    <StandardChartCard
      title="Resource Allocation"
      description="Team allocation across projects (%)"
      showDatePicker={false}
      onDownload={() => toast({ title: "Downloading allocation data..." })}
      menuItems={[
        { label: "View Breakdown", icon: <Eye className="h-4 w-4" />, onClick: () => {} },
        { label: "View Report", icon: <BarChart3 className="h-4 w-4" />, onClick: () => {} },
        { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => {} }
      ]}
    >
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="team" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip />
          <Legend />
          <Bar dataKey="billable" stackId="a" fill="hsl(var(--chart-1))" name="Billable" />
          <Bar dataKey="non_billable" stackId="a" fill="hsl(var(--chart-2))" name="Non-Billable" />
        </BarChart>
      </ResponsiveContainer>
    </StandardChartCard>
  );
}
