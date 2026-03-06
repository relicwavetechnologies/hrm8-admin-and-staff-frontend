import { CheckCircle, Circle, Mail, FileCheck, Shield, AlertTriangle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { BackgroundCheck } from '@/types/backgroundCheck';
import type { ConsentRequest } from '@/types/consent';
import type { RefereeDetails } from '@/types/referee';

interface BackgroundCheckTimelineProps {
  check: BackgroundCheck;
  consents: ConsentRequest[];
  referees: RefereeDetails[];
}

export default function BackgroundCheckTimeline({ check, consents, referees }: BackgroundCheckTimelineProps) {
  const timelineEvents = [];

  // Check Initiated
  timelineEvents.push({
    date: check.initiatedDate,
    title: 'Background Check Initiated',
    description: `By ${check.initiatedByName}`,
    icon: Shield,
    status: 'completed' as const,
  });

  // Consent Request Sent
  const consentRequest = consents[0];
  if (consentRequest) {
    timelineEvents.push({
      date: consentRequest.sentDate,
      title: 'Consent Request Sent',
      description: `Sent to ${check.candidateName}`,
      icon: Mail,
      status: consentRequest.status === 'accepted' ? 'completed' as const : 'pending' as const,
    });

    if (consentRequest.viewedDate) {
      timelineEvents.push({
        date: consentRequest.viewedDate,
        title: 'Consent Form Viewed',
        description: 'Candidate opened the consent form',
        icon: Circle,
        status: 'completed' as const,
      });
    }

    if (consentRequest.respondedDate) {
      timelineEvents.push({
        date: consentRequest.respondedDate,
        title: consentRequest.status === 'accepted' ? 'Consent Given' : 'Consent Declined',
        description: `Candidate ${consentRequest.status === 'accepted' ? 'accepted' : 'declined'} the consent`,
        icon: consentRequest.status === 'accepted' ? CheckCircle : AlertTriangle,
        status: consentRequest.status === 'accepted' ? 'completed' as const : 'cancelled' as const,
      });
    }
  }

  // Referees Invited
  referees.forEach((referee, index) => {
    if (referee.invitedDate) {
      timelineEvents.push({
        date: referee.invitedDate,
        title: `Referee ${index + 1} Invited`,
        description: `${referee.name} - ${referee.relationship}`,
        icon: Mail,
        status: referee.status === 'completed' ? 'completed' as const : 'pending' as const,
      });
    }

    if (referee.completedDate) {
      timelineEvents.push({
        date: referee.completedDate,
        title: `Reference Received`,
        description: `From ${referee.name}`,
        icon: FileCheck,
        status: 'completed' as const,
      });
    }
  });

  // Check Completed
  if (check.completedDate) {
    timelineEvents.push({
      date: check.completedDate,
      title: 'Background Check Completed',
      description: check.reviewedByName ? `Reviewed by ${check.reviewedByName}` : 'All checks completed',
      icon: CheckCircle,
      status: check.status === 'issues-found' ? 'warning' as const : 'completed' as const,
    });
  }

  // Sort by date
  timelineEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="relative">
      {timelineEvents.map((event, index) => {
        const Icon = event.icon;
        const isLast = index === timelineEvents.length - 1;
        const isPending = event.status === 'pending';
        const isCancelled = event.status === 'cancelled';
        const isWarning = event.status === 'warning';

        return (
          <div key={index} className="relative pb-8">
            {!isLast && (
              <div className="absolute left-4 top-8 h-full w-0.5 bg-border" />
            )}
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center shrink-0 relative z-10",
                  isPending && "bg-muted border-2 border-border",
                  isCancelled && "bg-destructive/10 border-2 border-destructive",
                  isWarning && "bg-warning/10 border-2 border-warning",
                  !isPending && !isCancelled && !isWarning && "bg-primary/10 border-2 border-primary"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    isPending && "text-muted-foreground",
                    isCancelled && "text-destructive",
                    isWarning && "text-warning",
                    !isPending && !isCancelled && !isWarning && "text-primary"
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={cn(
                    "text-sm font-medium",
                    isPending && "text-muted-foreground"
                  )}>
                    {event.title}
                  </h4>
                  <time className="text-xs text-muted-foreground">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </time>
                </div>
                <p className="text-sm text-muted-foreground">{event.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
