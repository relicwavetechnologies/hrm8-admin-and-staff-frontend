import { Badge } from "@/shared/components/ui/badge";
import { CommissionStatus } from "@/shared/types/salesCommission";

interface CommissionStatusBadgeProps {
  status: CommissionStatus;
}

export function CommissionStatusBadge({ status }: CommissionStatusBadgeProps) {
  const variants: Record<CommissionStatus, { variant: any; label: string }> = {
    'pending': { variant: 'warning', label: 'Pending' },
    'approved': { variant: 'default', label: 'Approved' },
    'paid': { variant: 'success', label: 'Paid' },
    'rejected': { variant: 'destructive', label: 'Rejected' },
  };

  const config = variants[status];

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}
