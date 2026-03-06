import { StandardChartCard } from "./StandardChartCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Download, Eye, Filter } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";

const data = [
  { status: "Lead", count: 15 },
  { status: "Proposal", count: 12 },
  { status: "Negotiation", count: 8 },
  { status: "Active", count: 32 },
  { status: "Completed", count: 45 },
];

export function ProjectPipelineChart() {
  const { toast } = useToast();
  
  return (
    <StandardChartCard
      title="Project Pipeline"
      description="Projects by status"
      showDatePicker={false}
      onDownload={() => toast({ title: "Downloading pipeline data..." })}
      menuItems={[
        { label: "View Details", icon: <Eye className="h-4 w-4" />, onClick: () => {} },
        { label: "Filter", icon: <Filter className="h-4 w-4" />, onClick: () => {} },
        { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => {} }
      ]}
    >
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="status" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="hsl(var(--primary))" name="Projects" />
        </BarChart>
      </ResponsiveContainer>
    </StandardChartCard>
  );
}
