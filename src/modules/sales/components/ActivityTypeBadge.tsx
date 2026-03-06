import { Badge } from '@/shared/components/ui/badge';

type ActivityType = 'call' | 'email' | 'meeting' | 'demo' | 'follow-up' | 'proposal' | 'other';

interface ActivityTypeBadgeProps {
  type: ActivityType;
}

export function ActivityTypeBadge({ type }: ActivityTypeBadgeProps) {
  const config: Record<ActivityType, { label: string; variant: "default" | "teal" | "purple" | "coral" | "outline" }> = {
    'call': { label: 'Call', variant: 'default' },
    'email': { label: 'Email', variant: 'teal' },
    'meeting': { label: 'Meeting', variant: 'purple' },
    'demo': { label: 'Demo', variant: 'coral' },
    'follow-up': { label: 'Follow-up', variant: 'outline' },
    'proposal': { label: 'Proposal', variant: 'outline' },
    'other': { label: 'Other', variant: 'outline' },
  };

  const { label, variant } = config[type];

  return <Badge variant={variant}>{label}</Badge>;
}
