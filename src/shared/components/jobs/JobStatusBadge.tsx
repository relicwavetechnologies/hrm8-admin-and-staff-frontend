import { Badge } from "@/shared/components/ui/badge";
import { Job } from "@/shared/types/job";
import { getJobStatusVariant } from "@/shared/lib/jobUtils";

interface JobStatusBadgeProps {
  status: Job['status'];
  className?: string;
}

export function JobStatusBadge({ status, className }: JobStatusBadgeProps) {
  const statusLabels: Record<Job['status'], string> = {
    'draft': 'Draft',
    'open': 'Open',
    'closed': 'Closed',
    'on-hold': 'On Hold',
    'filled': 'Filled',
    'cancelled': 'Cancelled',
    'template': 'Template',
  };

  return (
    <Badge variant={getJobStatusVariant(status)} className={className}>
      {statusLabels[status]}
    </Badge>
  );
}
