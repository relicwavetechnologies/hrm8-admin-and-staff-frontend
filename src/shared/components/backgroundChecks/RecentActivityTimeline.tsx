import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Shield, Mail, CheckCircle, Clock, UserCheck, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  type: string;
  candidateName: string;
  timestamp: string;
  checkId: string;
}

interface RecentActivityTimelineProps {
  activities: Activity[];
}

const activityConfig: Record<string, { icon: any; label: string; color: string; variant: any }> = {
  'initiated': {
    icon: Shield,
    label: 'Check Initiated',
    color: 'text-primary',
    variant: 'default',
  },
  'consent-sent': {
    icon: Mail,
    label: 'Consent Request Sent',
    color: 'text-blue-500',
    variant: 'secondary',
  },
  'consent-received': {
    icon: CheckCircle,
    label: 'Consent Received',
    color: 'text-success',
    variant: 'default',
  },
  'referee-invited': {
    icon: UserCheck,
    label: 'Referee Invited',
    color: 'text-purple-500',
    variant: 'secondary',
  },
  'reference-completed': {
    icon: CheckCircle,
    label: 'Reference Completed',
    color: 'text-success',
    variant: 'default',
  },
  'completed': {
    icon: CheckCircle,
    label: 'Check Completed',
    color: 'text-success',
    variant: 'default',
  },
  'issue-flagged': {
    icon: AlertTriangle,
    label: 'Issue Flagged',
    color: 'text-destructive',
    variant: 'destructive',
  },
};

export function RecentActivityTimeline({ activities }: RecentActivityTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No recent activity</p>
            </div>
          ) : (
            activities.map((activity, index) => {
              const config = activityConfig[activity.type] || activityConfig['initiated'];
              const Icon = config.icon;
              
              return (
                <div key={`${activity.checkId}-${activity.type}-${index}`} className="flex gap-3">
                  <div className={`h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0 ${config.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{config.label}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {activity.candidateName}
                        </p>
                      </div>
                      <Badge variant={config.variant} className="flex-shrink-0">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
