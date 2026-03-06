import { StandardChartCard } from "./StandardChartCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Download, Eye, Filter } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";

const data = [
  { level: "Entry Level", count: 42, percentage: "28%" },
  { level: "Mid Level", count: 58, percentage: "39%" },
  { level: "Senior", count: 38, percentage: "25%" },
  { level: "Executive", count: 12, percentage: "8%" },
];

export function CandidateExperienceBreakdownChart() {
  const { toast } = useToast();
  
  return (
    <StandardChartCard
      title="Experience Breakdown"
      description="Candidates by experience level"
      showDatePicker={false}
      onDownload={() => toast({ title: "Downloading experience data..." })}
      menuItems={[
        { label: "View Details", icon: <Eye className="h-4 w-4" />, onClick: () => {} },
        { label: "Filter", icon: <Filter className="h-4 w-4" />, onClick: () => {} },
        { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => {} }
      ]}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis type="number" className="text-xs" />
          <YAxis dataKey="level" type="category" className="text-xs" width={100} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
          />
          <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </StandardChartCard>
  );
}
