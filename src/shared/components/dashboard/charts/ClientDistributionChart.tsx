import { StandardChartCard } from "./StandardChartCard";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Download, Eye, Filter } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";

const data = [
  { name: "Technology", value: 6 },
  { name: "Healthcare", value: 4 },
  { name: "Finance", value: 3 },
  { name: "Retail", value: 3 },
  { name: "Manufacturing", value: 2 },
];

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function ClientDistributionChart() {
  const { toast } = useToast();
  
  return (
    <StandardChartCard
      title="Client Distribution"
      description="Clients by industry"
      showDatePicker={false}
      onDownload={() => toast({ title: "Downloading client data..." })}
      menuItems={[
        { label: "View All Clients", icon: <Eye className="h-4 w-4" />, onClick: () => {} },
        { label: "Filter by Industry", icon: <Filter className="h-4 w-4" />, onClick: () => {} },
        { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => {} }
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
