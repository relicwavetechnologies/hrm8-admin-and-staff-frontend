import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
  { stage: "Applied", count: 1234, conversion: 100 },
  { stage: "Screening", count: 456, conversion: 37 },
  { stage: "Interview", count: 189, conversion: 15 },
  { stage: "Offer", count: 67, conversion: 5 },
  { stage: "Hired", count: 52, conversion: 4 },
];

const chartConfig = {
  count: {
    label: "Candidates",
    color: "hsl(var(--primary))",
  },
};

export function ApplicationFunnelChart() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  return (
    <Card className="shadow-md h-full flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4 flex-shrink-0">
        <div className="space-y-1">
          <CardTitle>Application Funnel</CardTitle>
          <CardDescription>Candidate conversion through hiring stages</CardDescription>
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
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(var(--primary-glow))" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="stage"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs"
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
            <ChartTooltip
              content={<ChartTooltipContent />}
              formatter={(value, name, props) => [
                `${value} (${props.payload.conversion}%)`,
                "Candidates",
              ]}
            />
            <Bar dataKey="count" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
