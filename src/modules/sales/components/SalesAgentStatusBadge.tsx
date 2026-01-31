import { Badge } from '@/shared/components/ui/badge';
import type { SalesAgentStatus } from '@/shared/types/salesAgent';

interface SalesAgentStatusBadgeProps {
  status: SalesAgentStatus;
}

export function SalesAgentStatusBadge({ status }: SalesAgentStatusBadgeProps) {
  const config: Record<SalesAgentStatus, { label: string; variant: "success" | "orange" | "neutral" | "destructive" }> = {
    'active': { label: 'Active', variant: 'success' },
    'on-leave': { label: 'On Leave', variant: 'orange' },
    'inactive': { label: 'Inactive', variant: 'neutral' },
    'suspended': { label: 'Suspended', variant: 'destructive' },
  };

  const { label, variant } = config[status];

  return <Badge variant={variant}>{label}</Badge>;
}
