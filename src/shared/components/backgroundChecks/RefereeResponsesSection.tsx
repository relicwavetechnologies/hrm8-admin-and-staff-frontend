import { CheckCircle, Clock, Mail, Phone, Building, User, Star, MessageSquare } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { Progress } from '@/shared/components/ui/progress';
import type { BackgroundCheck } from '@/types/backgroundCheck';
import type { RefereeDetails } from '@/types/referee';

interface RefereeResponsesSectionProps {
  check: BackgroundCheck;
  referees: RefereeDetails[];
}

const relationshipLabels = {
  manager: 'Manager',
  colleague: 'Colleague',
  'direct-report': 'Direct Report',
  client: 'Client',
  other: 'Other',
};

export default function RefereeResponsesSection({ check, referees }: RefereeResponsesSectionProps) {
  if (referees.length === 0) {
    return (
      <Card className="p-8 text-center">
        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Referees Added</h3>
        <p className="text-muted-foreground">
          No referees have been added to this background check.
        </p>
      </Card>
    );
  }

  const completedReferees = referees.filter(r => r.status === 'completed').length;
  const completionRate = (completedReferees / referees.length) * 100;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Reference Check Overview</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{referees.length}</div>
            <div className="text-sm text-muted-foreground">Total Referees</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">{completedReferees}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-muted-foreground">
              {referees.length - completedReferees}
            </div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Completion Rate</span>
            <span className="font-medium">{completionRate.toFixed(0)}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>
      </Card>

      {/* Individual Referee Responses */}
      {referees.map((referee, index) => (
        <Card key={referee.id} className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">{referee.name}</h4>
                <Badge variant="secondary" className="mt-1">
                  {relationshipLabels[referee.relationship]}
                </Badge>
              </div>
            </div>
            <Badge
              variant={
                referee.status === 'completed'
                  ? 'success'
                  : referee.status === 'overdue'
                  ? 'destructive'
                  : 'default'
              }
            >
              {referee.status === 'pending' && 'Pending'}
              {referee.status === 'invited' && 'Invited'}
              {referee.status === 'opened' && 'Opened'}
              {referee.status === 'in-progress' && 'In Progress'}
              {referee.status === 'completed' && 'Completed'}
              {referee.status === 'overdue' && 'Overdue'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{referee.email}</span>
            </div>
            {referee.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{referee.phone}</span>
              </div>
            )}
            {referee.companyName && (
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{referee.companyName}</span>
              </div>
            )}
            {referee.position && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{referee.position}</span>
              </div>
            )}
          </div>

          <Separator className="my-4" />

          <div className="space-y-2 text-sm">
            {referee.invitedDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invited</span>
                <span>{new Date(referee.invitedDate).toLocaleDateString()}</span>
              </div>
            )}
            {referee.completedDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed</span>
                <span>{new Date(referee.completedDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Response Details */}
          {referee.response && (
            <>
              <Separator className="my-4" />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="font-semibold">Reference Response</h5>
                  {referee.response.overallRating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="font-semibold">{referee.response.overallRating}/5</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {referee.response.answers.map((answer, idx) => (
                    <div key={idx} className="p-3 rounded-lg border bg-muted/50">
                      <div className="text-sm font-medium mb-2">{answer.question}</div>
                      {answer.type === 'rating' && (
                        <div className="flex items-center gap-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Number(answer.value)
                                  ? 'fill-warning text-warning'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                          <span className="text-sm font-medium ml-2">{answer.value}/5</span>
                        </div>
                      )}
                      {answer.type === 'yes-no' && (
                        <Badge variant={answer.value ? 'success' : 'secondary'}>
                          {answer.value ? 'Yes' : 'No'}
                        </Badge>
                      )}
                      {(answer.type === 'text' || answer.type === 'textarea') && (
                        <div className="text-sm text-muted-foreground flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 shrink-0 mt-0.5" />
                          <span>{answer.value}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                  <span>Submitted {new Date(referee.response.submittedAt).toLocaleString()}</span>
                  {referee.response.completionTime && (
                    <span>Completion time: {Math.round(referee.response.completionTime / 60)} minutes</span>
                  )}
                </div>
              </div>
            </>
          )}
        </Card>
      ))}
    </div>
  );
}
