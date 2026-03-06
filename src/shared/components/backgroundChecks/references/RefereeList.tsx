import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { RefereeDetails } from "@/types/referee";
import { RefereeStatusCard } from "./RefereeStatusCard";
import { getRefereesByBackgroundCheck, updateReferee } from "@/shared/lib/backgroundChecks/refereeStorage";
import { Users, Send, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { toast } from "@/shared/hooks/use-toast";

interface RefereeListProps {
  backgroundCheckId: string;
  candidateId: string;
  onViewResponse?: (refereeId: string) => void;
}

export function RefereeList({ 
  backgroundCheckId, 
  candidateId: _candidateId, 
  onViewResponse 
}: RefereeListProps) {
  const [referees, setReferees] = useState<RefereeDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReferees();
  }, [backgroundCheckId]);

  const loadReferees = () => {
    setLoading(true);
    try {
      const loadedReferees = getRefereesByBackgroundCheck(backgroundCheckId);
      setReferees(loadedReferees);
    } catch (error) {
      console.error("Error loading referees:", error);
      toast({
        title: "Error",
        description: "Failed to load referees",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = (refereeId: string) => {
    try {
      updateReferee(refereeId, {
        lastReminderDate: new Date().toISOString()
      });
      
      toast({
        title: "Reminder Sent",
        description: "Email reminder has been sent to the referee",
      });
      
      loadReferees();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reminder",
        variant: "destructive"
      });
    }
  };

  const handleResendInvitation = (refereeId: string) => {
    try {
      updateReferee(refereeId, {
        status: 'invited',
        invitedDate: new Date().toISOString()
      });
      
      toast({
        title: "Invitation Resent",
        description: "A new invitation has been sent to the referee",
      });
      
      loadReferees();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend invitation",
        variant: "destructive"
      });
    }
  };

  const handleSendAllReminders = () => {
    const pendingReferees = referees.filter(
      r => r.status !== 'completed' && r.status !== 'pending'
    );
    
    if (pendingReferees.length === 0) {
      toast({
        title: "No Action Needed",
        description: "All referees have completed their responses",
      });
      return;
    }

    pendingReferees.forEach(referee => {
      updateReferee(referee.id, {
        lastReminderDate: new Date().toISOString()
      });
    });

    toast({
      title: "Reminders Sent",
      description: `Email reminders sent to ${pendingReferees.length} referee(s)`,
    });

    loadReferees();
  };

  // Calculate overall progress
  const stats = {
    total: referees.length,
    completed: referees.filter(r => r.status === 'completed').length,
    inProgress: referees.filter(r => r.status === 'in-progress' || r.status === 'opened').length,
    pending: referees.filter(r => r.status === 'pending' || r.status === 'invited').length,
    overdue: referees.filter(r => r.status === 'overdue').length
  };

  const overallProgress = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Reference Checks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading referees...</p>
        </CardContent>
      </Card>
    );
  }

  if (referees.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Reference Checks
          </CardTitle>
          <CardDescription>
            No referees have been added for this background check
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Reference Checks
              </CardTitle>
              <CardDescription className="mt-1">
                {stats.completed} of {stats.total} completed
              </CardDescription>
            </div>
            {stats.pending + stats.inProgress > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSendAllReminders}
              >
                <Send className="h-4 w-4 mr-2" />
                Remind All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">Completed:</span>
              <span className="font-medium">{stats.completed}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-muted-foreground">In Progress:</span>
              <span className="font-medium">{stats.inProgress}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Send className="h-4 w-4 text-blue-500" />
              <span className="text-muted-foreground">Pending:</span>
              <span className="font-medium">{stats.pending}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-muted-foreground">Overdue:</span>
              <span className="font-medium">{stats.overdue}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {referees.map((referee) => (
          <RefereeStatusCard
            key={referee.id}
            referee={referee}
            onSendReminder={handleSendReminder}
            onViewResponse={onViewResponse}
            onResendInvitation={handleResendInvitation}
          />
        ))}
      </div>
    </div>
  );
}
