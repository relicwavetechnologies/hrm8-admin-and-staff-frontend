import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { DateRangePickerCompact } from "@/shared/components/ui/date-range-picker-v2";
import { Download, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import type { DateRange } from "react-day-picker";
import { ReactNode } from "react";

interface MenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
}

interface StandardChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  onDownload?: () => void;
  menuItems?: MenuItem[];
  showDatePicker?: boolean;
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange | undefined) => void;
  className?: string;
}

export function StandardChartCard({
  title,
  description,
  children,
  onDownload,
  menuItems,
  showDatePicker = false,
  dateRange,
  onDateRangeChange,
  className = "",
}: StandardChartCardProps) {
  return (
    <Card className={`shadow-sm h-full flex flex-col ${className}`}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4 flex-shrink-0">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {description && <CardDescription className="text-sm">{description}</CardDescription>}
        </div>
        <div className="flex items-center gap-1">
          {showDatePicker && (
            <DateRangePickerCompact
              value={dateRange}
              onChange={onDateRangeChange}
              align="end"
            />
          )}
          
          {onDownload && (
            <Button variant="ghost" size="icon-sm" onClick={onDownload}>
              <Download className="h-4 w-4" />
            </Button>
          )}
          
          {menuItems && menuItems.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {menuItems.map((item, index) => (
                  <DropdownMenuItem key={index} onClick={item.onClick}>
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-4 min-h-0">
        {children}
      </CardContent>
    </Card>
  );
}
