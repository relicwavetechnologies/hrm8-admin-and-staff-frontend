import { Badge } from "@/shared/components/ui/badge";
import { Job } from "@/shared/types/job";
import { getServiceTypeVariant, formatServiceType } from "@/shared/lib/jobUtils";

interface ServiceTypeBadgeProps {
  type: Job['serviceType'];
  className?: string;
}

export function ServiceTypeBadge({ type, className }: ServiceTypeBadgeProps) {
  return (
    <Badge variant={getServiceTypeVariant(type)} className={className}>
      {formatServiceType(type)}
    </Badge>
  );
}
