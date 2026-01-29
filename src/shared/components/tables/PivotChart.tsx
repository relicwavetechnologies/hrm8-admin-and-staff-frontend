import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useState } from "react";

interface PivotChartProps {
  data: {
    rowKeys: string[];
    colKeys: string[];
    data: any;
  };
  valueConfig: {
    field: string;
    aggregation: string;
    label?: string;
  };
}

export function PivotChart({ data, valueConfig }: PivotChartProps) {
  const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar");

  // Transform pivot data for charts
  const chartData = data.rowKeys.map((rowKey) => {
    const point: any = { name: rowKey };
    data.colKeys.forEach((colKey) => {
      const key = `${valueConfig.field}_${valueConfig.aggregation}`;
      const value = Number(data.data[rowKey]?.[colKey]?.[key] || 0);
      point[colKey] = parseFloat(value.toFixed(2));
    });
    return point;
  });

  // Colors for charts
  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  // For pie chart, sum all values per row
  const pieData = chartData.map((item, idx) => ({
    name: item.name,
    value: data.colKeys.reduce((sum, colKey) => sum + (item[colKey] || 0), 0),
    fill: COLORS[idx % COLORS.length],
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Data Visualization</CardTitle>
          <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="pie">Pie Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          {chartType === "bar" ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {data.colKeys.map((colKey, idx) => (
                <Bar
                  key={colKey}
                  dataKey={colKey}
                  fill={COLORS[idx % COLORS.length]}
                />
              ))}
            </BarChart>
          ) : chartType === "line" ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {data.colKeys.map((colKey, idx) => (
                <Line
                  key={colKey}
                  type="monotone"
                  dataKey={colKey}
                  stroke={COLORS[idx % COLORS.length]}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          ) : (
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={120}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
