import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Button } from "@/shared/components/ui/button";
import { DateRangePickerCompact } from "@/shared/components/ui/date-range-picker-v2";
import { Download, MoreVertical, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

const data = [
  { month: "Apr", applications: 145, interviews: 52, hired: 12 },
  { month: "May", applications: 178, interviews: 64, hired: 15 },
  { month: "Jun", applications: 203, interviews: 78, hired: 19 },
  { month: "Jul", applications: 189, interviews: 71, hired: 17 },
  { month: "Aug", applications: 225, interviews: 89, hired: 21 },
  { month: "Sep", applications: 267, interviews: 98, hired: 24 },
];

const chartConfig = {
  applications: {
    label: "Applications",
    color: "hsl(var(--primary))",
  },
  interviews: {
    label: "Interviews",
    color: "hsl(var(--secondary))",
  },
  hired: {
    label: "Hired",
    color: "hsl(var(--success))",
  },
};

export function HiringTrendsChart() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  return (
    <Card className="shadow-md h-full flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4 flex-shrink-0">
        <div className="space-y-1">
          <CardTitle>Hiring Trends</CardTitle>
          <CardDescription>Application flow over the last 6 months</CardDescription>
        </div>
        <div className="flex items-center gap-1">
          <DateRangePickerCompact
            value={dateRange}
            onChange={setDateRange}
            align="end"
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
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillApplications" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillInterviews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillHired" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs"
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="applications"
              stroke="hsl(var(--primary))"
              fill="url(#fillApplications)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="interviews"
              stroke="hsl(var(--secondary))"
              fill="url(#fillInterviews)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="hired"
              stroke="hsl(var(--success))"
              fill="url(#fillHired)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
