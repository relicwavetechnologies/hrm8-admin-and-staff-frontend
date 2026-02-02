import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
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
  { source: "LinkedIn", count: 567 },
  { source: "Indeed", count: 342 },
  { source: "Referrals", count: 189 },
  { source: "Website", count: 136 },
];

const chartConfig = {
  count: {
    label: "Applications",
    color: "hsl(var(--secondary))",
  },
};

export function SourceOfHireChart() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  return (
    <Card className="shadow-md h-full flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4 flex-shrink-0">
        <div className="space-y-1">
          <CardTitle>Source of Applications</CardTitle>
          <CardDescription>Where candidates are finding you</CardDescription>
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
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="sourceBarGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity={0.8} />
                <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={1} />
              </linearGradient>
            </defs>
            <XAxis type="number" tickLine={false} axisLine={false} className="text-xs" />
            <YAxis
              type="category"
              dataKey="source"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="url(#sourceBarGradient)" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
