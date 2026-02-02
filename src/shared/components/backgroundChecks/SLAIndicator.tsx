import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { SLAStatus } from '@/types/sla';
import { cn } from '@/shared/lib/utils';

interface SLAIndicatorProps {
  slaStatus: SLAStatus;
  variant?: 'compact' | 'detailed';
  showProgress?: boolean;
}

const statusConfig = {
  'on-track': {
    icon: CheckCircle,
    label: 'On Track',
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950',
    badgeVariant: 'success' as const,
  },
  'warning': {
    icon: Clock,
    label: 'Warning',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    badgeVariant: 'warning' as const,
  },
  'critical': {
    icon: AlertTriangle,
    label: 'Critical',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
    badgeVariant: 'destructive' as const,
  },
  'breached': {
    icon: XCircle,
    label: 'Breached',
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950',
    badgeVariant: 'destructive' as const,
  },
};

export function SLAIndicator({ slaStatus, variant = 'compact', showProgress = false }: SLAIndicatorProps) {
  const config = statusConfig[slaStatus.slaStatus];
  const Icon = config.icon;

  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant={config.badgeVariant} className="gap-1">
              <Icon className="h-3 w-3" />
              {config.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">
                {slaStatus.breached ? 'SLA Breached' : `${Math.round(slaStatus.percentComplete)}% Complete`}
              </p>
              <p className="text-xs">
                {slaStatus.daysElapsed} days elapsed, {Math.max(0, slaStatus.daysRemaining)} days remaining
              </p>
              <p className="text-xs text-muted-foreground">
                Target: {slaStatus.slaConfig?.targetDays} days
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn('rounded-lg p-3 space-y-2', config.bgColor)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={cn('h-4 w-4', config.color)} />
          <span className={cn('font-medium text-sm', config.color)}>
            {config.label}
          </span>
        </div>
        <Badge variant="outline" className="text-xs">
          {Math.round(slaStatus.percentComplete)}%
        </Badge>
      </div>

      {showProgress && (
        <Progress 
          value={Math.min(slaStatus.percentComplete, 100)} 
          className="h-2"
        />
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{slaStatus.daysElapsed} days elapsed</span>
        <span>
          {slaStatus.breached 
            ? `Overdue by ${Math.abs(slaStatus.daysRemaining)} days`
            : `${slaStatus.daysRemaining} days remaining`
          }
        </span>
      </div>

      {slaStatus.slaConfig && (
        <p className="text-xs text-muted-foreground">
          Target: {slaStatus.slaConfig.targetDays} {slaStatus.slaConfig.businessDaysOnly ? 'business' : 'calendar'} days
        </p>
      )}
    </div>
  );
}
