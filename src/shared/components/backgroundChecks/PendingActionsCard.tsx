import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { AlertCircle, ChevronDown, ChevronUp, Mail, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/components/ui/collapsible';

interface PendingActionsCardProps {
  pendingConsents: number;
  overdueReferees: number;
  requiresReview: number;
  issuesFound: number;
  onSendReminders?: () => void;
  onViewConsents?: () => void;
  onViewReferees?: () => void;
  onViewReview?: () => void;
  onViewIssues?: () => void;
}

export function PendingActionsCard({
  pendingConsents,
  overdueReferees,
  requiresReview,
  issuesFound,
  onSendReminders,
  onViewConsents,
  onViewReferees,
  onViewReview,
  onViewIssues,
}: PendingActionsCardProps) {
  const [isOpen, setIsOpen] = useState(true);
  
  const totalPending = pendingConsents + overdueReferees + requiresReview + issuesFound;
  
  if (totalPending === 0) {
    return null;
  }

  return (
    <Card className="border-l-4 border-l-warning">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger className="flex items-center justify-between w-full hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-warning" />
              </div>
              <div className="text-left">
                <CardTitle className="text-lg">Pending Actions</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {totalPending} item{totalPending !== 1 ? 's' : ''} require attention
                </p>
              </div>
            </div>
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </CollapsibleTrigger>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="space-y-3">
            {pendingConsents > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Pending Consents</p>
                    <p className="text-sm text-muted-foreground">
                      {pendingConsents} candidate{pendingConsents !== 1 ? 's' : ''} awaiting consent
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{pendingConsents}</Badge>
                  <Button size="sm" variant="outline" onClick={onSendReminders}>
                    Send Reminders
                  </Button>
                  <Button size="sm" onClick={onViewConsents}>
                    View
                  </Button>
                </div>
              </div>
            )}

            {overdueReferees > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-warning" />
                  <div>
                    <p className="font-medium">Overdue Referees</p>
                    <p className="text-sm text-muted-foreground">
                      {overdueReferees} referee{overdueReferees !== 1 ? 's' : ''} overdue for response
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{overdueReferees}</Badge>
                  <Button size="sm" onClick={onViewReferees}>
                    View
                  </Button>
                </div>
              </div>
            )}

            {requiresReview > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Requires Review</p>
                    <p className="text-sm text-muted-foreground">
                      {requiresReview} check{requiresReview !== 1 ? 's' : ''} need admin approval
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{requiresReview}</Badge>
                  <Button size="sm" onClick={onViewReview}>
                    Review
                  </Button>
                </div>
              </div>
            )}

            {issuesFound > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <div>
                    <p className="font-medium">Issues Found</p>
                    <p className="text-sm text-muted-foreground">
                      {issuesFound} check{issuesFound !== 1 ? 's' : ''} with non-clear results
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">{issuesFound}</Badge>
                  <Button size="sm" variant="destructive" onClick={onViewIssues}>
                    View Issues
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
