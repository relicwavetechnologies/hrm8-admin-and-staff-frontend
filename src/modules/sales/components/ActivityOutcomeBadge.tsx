import { Badge } from '@/shared/components/ui/badge';

type ActivityOutcome = 'successful' | 'unsuccessful' | 'follow-up-needed';

interface ActivityOutcomeBadgeProps {
  outcome?: ActivityOutcome;
}

export function ActivityOutcomeBadge({ outcome }: ActivityOutcomeBadgeProps) {
  if (!outcome) return <span className="text-sm text-muted-foreground">-</span>;

  const config: Record<ActivityOutcome, { label: string; variant: "success" | "destructive" | "orange" }> = {
    'successful': { label: 'Successful', variant: 'success' },
    'unsuccessful': { label: 'Unsuccessful', variant: 'destructive' },
    'follow-up-needed': { label: 'Follow-up Needed', variant: 'orange' },
  };

  const { label, variant } = config[outcome];

  return <Badge variant={variant}>{label}</Badge>;
}
