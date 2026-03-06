import { Badge } from "@/shared/components/ui/badge";
import { Job } from "@/shared/types/job";
import { getEmploymentTypeVariant, formatEmploymentType } from "@/shared/lib/jobUtils";

interface EmploymentTypeBadgeProps {
  type: Job['employmentType'];
  className?: string;
}

export function EmploymentTypeBadge({ type, className }: EmploymentTypeBadgeProps) {
  return (
    <Badge variant={getEmploymentTypeVariant(type)} className={className}>
      {formatEmploymentType(type)}
    </Badge>
  );
}
