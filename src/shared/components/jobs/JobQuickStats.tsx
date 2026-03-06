import { Users, Eye, Calendar } from "lucide-react";
import { calculateDaysOpen } from "@/shared/lib/jobUtils";

interface JobQuickStatsProps {
  applicantsCount: number;
  viewsCount: number;
  postingDate: string;
}

export function JobQuickStats({ applicantsCount, viewsCount, postingDate }: JobQuickStatsProps) {
  const daysOpen = calculateDaysOpen(postingDate);
  
  return (
    <div className="flex items-center gap-6 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        <span className="font-medium text-foreground">{applicantsCount}</span>
        <span>applicants</span>
      </div>
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4" />
        <span className="font-medium text-foreground">{viewsCount}</span>
        <span>views</span>
      </div>
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        <span className="font-medium text-foreground">{daysOpen}</span>
        <span>{daysOpen === 1 ? 'day' : 'days'} open</span>
      </div>
    </div>
  );
}
