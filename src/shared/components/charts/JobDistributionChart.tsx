import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart";
import { Pie, PieChart, Cell, Legend } from "recharts";
import { Button } from "@/shared/components/ui/button";
import { Download, MoreVertical, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { DateRangePickerCompact } from "@/shared/components/ui/date-range-picker-v2";
import type { DateRange } from "react-day-picker";

const data = [
  { department: "Engineering", value: 47, fill: "hsl(var(--primary))" },
  { department: "Sales", value: 28, fill: "hsl(var(--success))" },
  { department: "Marketing", value: 18, fill: "hsl(var(--secondary))" },
  { department: "Operations", value: 15, fill: "hsl(var(--warning))" },
  { department: "Other", value: 12, fill: "hsl(var(--muted-foreground))" },
];

const chartConfig = {
  value: {
    label: "Jobs",
  },
};

export function JobDistributionChart() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  return (
    <Card className="shadow-md h-full flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4 flex-shrink-0">
        <div className="space-y-1">
          <CardTitle>Job Distribution</CardTitle>
          <CardDescription>Active jobs by department</CardDescription>
        </div>
        <div className="flex items-center gap-1">
          <DateRangePickerCompact
            value={dateRange}
            onChange={setDateRange}
          />

          <Button variant="ghost" size="icon-sm">
            <Download className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh data
              </DropdownMenuItem>
              <DropdownMenuItem>View details</DropdownMenuItem>
              <DropdownMenuItem>Share report</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-4 min-h-0">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent />}
              formatter={(value, _name, props) => [
                `${value} jobs (${Math.round((Number(value) / 120) * 100)}%)`,
                props.payload.department,
              ]}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(_value, entry: any) => (
                <span className="text-xs text-muted-foreground">
                  {entry.payload.department}: {entry.payload.value}
                </span>
              )}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
