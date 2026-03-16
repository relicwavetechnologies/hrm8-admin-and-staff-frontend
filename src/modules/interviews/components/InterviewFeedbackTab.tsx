// @ts-nocheck
import { CollaborativeFeedbackPanel } from '@/modules/performance/components/CollaborativeFeedbackPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Interview } from '@/shared/types/interview';
import { Users, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface InterviewFeedbackTabProps {
  interview: Interview;
}

export function InterviewFeedbackTab({ interview }: InterviewFeedbackTabProps) {
  const isCompleted = interview.status === 'completed';

  return (
    <div className="space-y-6">
      {/* Interview Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Interview Details</CardTitle>
              <CardDescription>
                {interview.type.charAt(0).toUpperCase() + interview.type.slice(1)} Interview
              </CardDescription>
            </div>
            <Badge variant={isCompleted ? 'default' : 'secondary'}>
              {interview.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(interview.scheduledDate), 'PPP')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{interview.scheduledTime} ({interview.duration} minutes)</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{interview.interviewers.length} Interviewers</span>
          </div>
        </CardContent>
      </Card>

      {/* Collaborative Feedback Panel */}
      {isCompleted ? (
        <CollaborativeFeedbackPanel
          candidateId={interview.candidateId}
          candidateName={interview.candidateName}
          applicationId={interview.applicationId}
        />
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-2">Feedback available after interview completion</p>
            <p className="text-sm text-muted-foreground">
              Complete the interview to enable collaborative feedback from the team
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
