import { StandardChartCard } from "./StandardChartCard";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Download, Calendar, BarChart3 } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";

const data = [
  { quarter: "Q1", actual: 580, forecast: 580 },
  { quarter: "Q2", actual: 620, forecast: 620 },
  { quarter: "Q3", actual: null, forecast: 680 },
  { quarter: "Q4", actual: null, forecast: 750 },
];

export function RevenueForecastChart() {
  const { toast } = useToast();
  
  return (
    <StandardChartCard
      title="Revenue Forecast"
      description="Projected revenue by quarter (in thousands)"
      showDatePicker={false}
      onDownload={() => toast({ title: "Downloading forecast data..." })}
      menuItems={[
        { label: "View Full Forecast", icon: <BarChart3 className="h-4 w-4" />, onClick: () => {} },
        { label: "Compare Periods", icon: <Calendar className="h-4 w-4" />, onClick: () => {} },
        { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => {} }
      ]}
    >
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="quarter" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="actual" stroke="hsl(var(--primary))" strokeWidth={2} name="Actual" connectNulls />
          <Line type="monotone" dataKey="forecast" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" name="Forecast" connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </StandardChartCard>
  );
}
