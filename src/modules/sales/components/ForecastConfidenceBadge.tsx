import { Badge } from "@/shared/components/ui/badge";
import { ConfidenceLevel } from "@/shared/lib/salesForecastUtils";

interface ForecastConfidenceBadgeProps {
  level: ConfidenceLevel;
}

export function ForecastConfidenceBadge({ level }: ForecastConfidenceBadgeProps) {
  const variants: Record<ConfidenceLevel, { variant: any; label: string }> = {
    'high': { variant: 'success', label: 'High Confidence' },
    'medium': { variant: 'warning', label: 'Medium Confidence' },
    'low': { variant: 'destructive', label: 'Low Confidence' },
  };

  const config = variants[level];

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}
