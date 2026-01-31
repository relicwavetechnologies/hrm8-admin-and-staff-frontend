import { Badge } from "@/shared/components/ui/badge";
import { Building2 } from "lucide-react";

interface InternalJobBadgeProps {
  internalOnly?: boolean;
  className?: string;
}

export function InternalJobBadge({ internalOnly, className }: InternalJobBadgeProps) {
  if (!internalOnly) return null;

  return (
    <Badge variant="secondary" className={className}>
      <Building2 className="h-3 w-3 mr-1" />
      Internal Only
    </Badge>
  );
}
