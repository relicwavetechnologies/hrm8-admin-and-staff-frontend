import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { RefereeDetails } from "@/types/referee";
import { 
  Mail, 
  Phone, 
  Building2, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Send,
  Eye,
  MoreVertical
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

interface RefereeStatusCardProps {
  referee: RefereeDetails;
  onSendReminder?: (refereeId: string) => void;
  onViewResponse?: (refereeId: string) => void;
  onResendInvitation?: (refereeId: string) => void;
}

const statusConfig = {
  pending: {
    label: "Pending",
    variant: "secondary" as const,
    icon: Clock,
    color: "text-muted-foreground",
    progress: 0
  },
  invited: {
    label: "Invited",
    variant: "outline" as const,
    icon: Send,
    color: "text-blue-500",
    progress: 25
  },
  opened: {
    label: "Opened",
    variant: "outline" as const,
    icon: Eye,
    color: "text-purple-500",
    progress: 50
  },
  "in-progress": {
    label: "In Progress",
    variant: "default" as const,
    icon: Clock,
    color: "text-orange-500",
    progress: 75
  },
  completed: {
    label: "Completed",
    variant: "default" as const,
    icon: CheckCircle2,
    color: "text-green-500",
    progress: 100
  },
  overdue: {
    label: "Overdue",
    variant: "destructive" as const,
    icon: AlertCircle,
    color: "text-destructive",
    progress: 25
  }
};

const relationshipLabels = {
  manager: "Manager",
  colleague: "Colleague",
  "direct-report": "Direct Report",
  client: "Client",
  other: "Other"
};

export function RefereeStatusCard({ 
  referee, 
  onSendReminder, 
  onViewResponse,
  onResendInvitation 
}: RefereeStatusCardProps) {
  const config = statusConfig[referee.status];
  const StatusIcon = config.icon;
  const canSendReminder = referee.status !== 'completed' && referee.status !== 'pending';
  const canViewResponse = referee.status === 'completed' && referee.response;

  const getTimeInfo = () => {
    if (referee.completedDate) {
      return `Completed ${formatDistanceToNow(new Date(referee.completedDate), { addSuffix: true })}`;
    }
    if (referee.invitedDate) {
      return `Invited ${formatDistanceToNow(new Date(referee.invitedDate), { addSuffix: true })}`;
    }
    return "Not yet invited";
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className={`mt-1 ${config.color}`}>
              <StatusIcon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm">{referee.name}</h4>
                <Badge variant={config.variant} className="text-xs">
                  {config.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {relationshipLabels[referee.relationship]}
                {referee.relationshipDetails && ` • ${referee.relationshipDetails}`}
              </p>
              <Progress value={config.progress} className="h-1.5 mb-2" />
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canViewResponse && onViewResponse && (
                <DropdownMenuItem onClick={() => onViewResponse(referee.id)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Response
                </DropdownMenuItem>
              )}
              {canSendReminder && onSendReminder && (
                <DropdownMenuItem onClick={() => onSendReminder(referee.id)}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Reminder
                </DropdownMenuItem>
              )}
              {referee.status === 'overdue' && onResendInvitation && (
                <DropdownMenuItem onClick={() => onResendInvitation(referee.id)}>
                  <Mail className="h-4 w-4 mr-2" />
                  Resend Invitation
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Mail className="h-3.5 w-3.5" />
          <span className="truncate">{referee.email}</span>
        </div>
        {referee.phone && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="h-3.5 w-3.5" />
            <span>{referee.phone}</span>
          </div>
        )}
        {referee.companyName && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" />
            <span>
              {referee.companyName}
              {referee.position && ` • ${referee.position}`}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t">
          <Clock className="h-3.5 w-3.5" />
          <span>{getTimeInfo()}</span>
        </div>
        {referee.lastReminderDate && referee.status !== 'completed' && (
          <div className="text-xs text-muted-foreground">
            Last reminder: {formatDistanceToNow(new Date(referee.lastReminderDate), { addSuffix: true })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
