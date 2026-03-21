// @ts-nocheck
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Mail, Calendar, Eye, MoreVertical, Video, Phone, Users, Clock, CheckCircle, XCircle } from "lucide-react";
import type { Interview } from "@/shared/types/interview";
import { format } from "date-fns";

interface InterviewKanbanCardProps {
  interview: Interview;
  onViewDetails?: (interview: Interview) => void;
  onSendEmail?: (interview: Interview) => void;
  onReschedule?: (interview: Interview) => void;
  onComplete?: (interview: Interview) => void;
  onCancel?: (interview: Interview) => void;
}

export function InterviewKanbanCard({
  interview,
  onViewDetails,
  onSendEmail,
  onReschedule,
  onComplete,
  onCancel,
}: InterviewKanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: interview.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getTypeIcon = () => {
    const icons = {
      phone: <Phone className="h-3 w-3" />,
      video: <Video className="h-3 w-3" />,
      'in-person': <Users className="h-3 w-3" />,
      panel: <Users className="h-3 w-3" />,
    };
    return icons[interview.type];
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRatingColor = (rating?: number) => {
    if (!rating) return "bg-muted";
    if (rating >= 4) return "bg-success text-success-foreground";
    if (rating >= 3) return "bg-warning text-warning-foreground";
    return "bg-destructive text-destructive-foreground";
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group relative hover:shadow-lg transition-all duration-200 cursor-grab active:cursor-grabbing animate-fade-in"
    >
      <CardContent className="p-4 space-y-3">
        {/* Header with Avatar and Actions */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Avatar className="h-9 w-9 border-2 border-primary/10">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                {getInitials(interview.candidateName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">{interview.candidateName}</h4>
              <p className="text-xs text-muted-foreground truncate">{interview.jobTitle}</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onViewDetails && (
                <DropdownMenuItem onClick={() => onViewDetails(interview)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
              )}
              {onSendEmail && (
                <DropdownMenuItem onClick={() => onSendEmail(interview)}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </DropdownMenuItem>
              )}
              {onReschedule && interview.status === 'scheduled' && (
                <DropdownMenuItem onClick={() => onReschedule(interview)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Reschedule
                </DropdownMenuItem>
              )}
              {onComplete && interview.status === 'scheduled' && (
                <DropdownMenuItem onClick={() => onComplete(interview)}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Complete
                </DropdownMenuItem>
              )}
              {onCancel && interview.status === 'scheduled' && (
                <DropdownMenuItem onClick={() => onCancel(interview)}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Interview Type & Rating */}
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="text-xs gap-1">
            {getTypeIcon()}
            <span className="capitalize">{interview.type}</span>
          </Badge>
          {interview.rating && (
            <Badge className={`text-xs ${getRatingColor(interview.rating)}`}>
              ★ {interview.rating.toFixed(1)}
            </Badge>
          )}
        </div>

        {/* Date & Time */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{format(new Date(interview.scheduledDate), "MMM dd")}</span>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>{interview.scheduledTime}</span>
        </div>

        {/* Duration */}
        <div className="text-xs text-muted-foreground">
          {interview.duration} minutes
        </div>

        {/* Interviewers */}
        {interview.interviewers.length > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex -space-x-2">
              {interview.interviewers.slice(0, 3).map((interviewer, idx) => (
                <Avatar key={idx} className="h-6 w-6 border-2 border-background">
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-[10px]">
                    {getInitials(interviewer.name)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            {interview.interviewers.length > 3 && (
              <span className="text-xs text-muted-foreground ml-1">
                +{interview.interviewers.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Feedback Status */}
        {interview.feedback.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {interview.feedback.length} Feedback
          </Badge>
        )}

        {/* Quick Actions (visible on hover) */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 bg-gradient-to-t from-background/95 to-transparent flex items-end justify-center gap-2 pb-4 pointer-events-none">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 pointer-events-auto hover-scale"
            onClick={(e) => {
              e.stopPropagation();
              onSendEmail?.(interview);
            }}
          >
            <Mail className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 pointer-events-auto hover-scale"
            onClick={(e) => {
              e.stopPropagation();
              onReschedule?.(interview);
            }}
          >
            <Calendar className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 pointer-events-auto hover-scale"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails?.(interview);
            }}
          >
            <Eye className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
