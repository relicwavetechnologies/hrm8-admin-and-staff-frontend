import { Badge } from '@/shared/components/ui/badge';
import type { OpportunityStage } from '@/shared/types/salesOpportunity';

interface OpportunityStageBadgeProps {
  stage: OpportunityStage;
}

export function OpportunityStageBadge({ stage }: OpportunityStageBadgeProps) {
  const config: Record<OpportunityStage, { label: string; variant: "default" | "teal" | "orange" | "coral" | "success" | "destructive" }> = {
    'prospecting': { label: 'Prospecting', variant: 'default' },
    'qualification': { label: 'Qualification', variant: 'teal' },
    'proposal': { label: 'Proposal', variant: 'orange' },
    'negotiation': { label: 'Negotiation', variant: 'coral' },
    'closed-won': { label: 'Closed Won', variant: 'success' },
    'closed-lost': { label: 'Closed Lost', variant: 'destructive' },
  };

  const { label, variant } = config[stage];

  return <Badge variant={variant}>{label}</Badge>;
}
