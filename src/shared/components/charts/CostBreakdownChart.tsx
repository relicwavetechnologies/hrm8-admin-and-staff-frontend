import { StandardChartCard } from "./StandardChartCard";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Download, Eye, BarChart3 } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";

const data = [
  { name: "Payroll", value: 890 },
  { name: "Marketing", value: 320 },
  { name: "Operations", value: 230 },
  { name: "Technology", value: 180 },
  { name: "Travel", value: 140 },
  { name: "Other", value: 40 },
];

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--muted-foreground))",
];

export function CostBreakdownChart() {
  const { toast } = useToast();

  return (
    <StandardChartCard
      title="Cost Breakdown"
      description="Expenses by category"
      showDatePicker={false}
      onDownload={() => toast({ title: "Downloading cost data..." })}
      menuItems={[
        { label: "View Details", icon: <Eye className="h-4 w-4" />, onClick: () => { } },
        { label: "View Report", icon: <BarChart3 className="h-4 w-4" />, onClick: () => { } },
        { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => { } }
      ]}
    >
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="hsl(var(--primary))"
            dataKey="value"
          >
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </StandardChartCard>
  );
}
