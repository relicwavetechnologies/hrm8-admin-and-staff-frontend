import { Badge } from '@/shared/components/ui/badge';
import type { OpportunityType } from '@/shared/types/salesOpportunity';

interface OpportunityTypeBadgeProps {
  type: OpportunityType;
}

export function OpportunityTypeBadge({ type }: OpportunityTypeBadgeProps) {
  const config: Record<OpportunityType, { label: string; variant: "default" | "teal" | "purple" | "coral" }> = {
    'new-business': { label: 'New Business', variant: 'default' },
    'upsell': { label: 'Upsell', variant: 'teal' },
    'renewal': { label: 'Renewal', variant: 'purple' },
    'cross-sell': { label: 'Cross-sell', variant: 'coral' },
  };

  const { label, variant } = config[type];

  return <Badge variant={variant}>{label}</Badge>;
}
