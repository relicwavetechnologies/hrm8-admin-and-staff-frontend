import { StandardChartCard } from "./StandardChartCard";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Download, Calendar, BarChart3 } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";

const data = [
  { month: "Jan", payroll: 850, forecast: 860 },
  { month: "Feb", payroll: 860, forecast: 870 },
  { month: "Mar", payroll: 875, forecast: 880 },
  { month: "Apr", payroll: 880, forecast: 890 },
  { month: "May", payroll: 890, forecast: 900 },
  { month: "Jun", payroll: 890, forecast: 910 },
];

export function PayrollTrendsChart() {
  const { toast } = useToast();
  
  return (
    <StandardChartCard
      title="Payroll Trends"
      description="Payroll cost over time (in thousands)"
      showDatePicker={true}
      onDownload={() => toast({ title: "Downloading payroll data..." })}
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
          <YAxis className="text-xs" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="payroll" stroke="hsl(var(--primary))" strokeWidth={2} name="Actual" />
          <Line type="monotone" dataKey="forecast" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" name="Forecast" />
        </LineChart>
      </ResponsiveContainer>
    </StandardChartCard>
  );
}
