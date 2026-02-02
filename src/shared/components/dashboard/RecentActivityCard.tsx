import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Clock, Filter, Eye, Mail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { DateRangePickerCompact } from "@/shared/components/ui/date-range-picker-v2";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

const recentActivities = [
  {
    id: 1,
    user: "Sarah Johnson",
    action: "submitted an application for",
    target: "Senior Developer",
    time: "5 minutes ago",
    avatar: "SJ",
  },
  {
    id: 2,
    user: "Mike Chen",
    action: "was moved to interview stage for",
    target: "Product Manager",
    time: "1 hour ago",
    avatar: "MC",
  },
  {
    id: 3,
    user: "Emily Davis",
    action: "was hired for",
    target: "UX Designer",
    time: "2 hours ago",
    avatar: "ED",
  },
  {
    id: 4,
    user: "Alex Rodriguez",
    action: "submitted an application for",
    target: "Marketing Specialist",
    time: "3 hours ago",
    avatar: "AR",
  },
];

export function RecentActivityCard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  return (
    <Card className="shadow-md h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <div className="flex items-center gap-1">
          <DateRangePickerCompact
            value={dateRange}
            onChange={setDateRange}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                All Activities
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>All</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Applications</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Interviews</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Hires</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 group">
              <Avatar className="h-10 w-10">
                <AvatarImage src={`/avatar-${activity.id}.jpg`} alt={activity.user} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {activity.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm">
                  <span className="font-medium">{activity.user}</span>{" "}
                  <span className="text-muted-foreground">{activity.action}</span>{" "}
                  <span className="font-medium">{activity.target}</span>
                </p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button variant="ghost" size="icon-sm">
                  <Eye className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon-sm">
                  <Mail className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button variant="ghost" className="w-full mt-4">
          View All Activities
        </Button>
      </CardContent>
    </Card>
  );
}
