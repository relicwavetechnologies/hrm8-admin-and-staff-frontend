import { StandardChartCard } from "./StandardChartCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Download, Eye, BarChart3 } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";

const data = [
  { category: "Payroll", budget: 1000, actual: 890 },
  { category: "Marketing", budget: 300, actual: 320 },
  { category: "Operations", budget: 250, actual: 230 },
  { category: "Technology", budget: 200, actual: 180 },
  { category: "Travel", budget: 150, actual: 140 },
  { category: "Facilities", budget: 100, actual: 95 },
];

export function BudgetAnalysisChart() {
  const { toast } = useToast();
  
  return (
    <StandardChartCard
      title="Budget Analysis"
      description="Budget vs actual spending (in thousands)"
      showDatePicker={false}
      onDownload={() => toast({ title: "Downloading budget data..." })}
      menuItems={[
        { label: "View Details", icon: <Eye className="h-4 w-4" />, onClick: () => {} },
        { label: "View Report", icon: <BarChart3 className="h-4 w-4" />, onClick: () => {} },
        { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => {} }
      ]}
    >
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="category" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip />
          <Legend />
          <Bar dataKey="budget" fill="hsl(var(--chart-1))" name="Budget" />
          <Bar dataKey="actual" fill="hsl(var(--chart-2))" name="Actual" />
        </BarChart>
      </ResponsiveContainer>
    </StandardChartCard>
  );
}
