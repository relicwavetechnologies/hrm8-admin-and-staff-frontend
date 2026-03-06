
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Phone,
  Building2,
  Users,
  Star,
  FileText,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PlayCircle
} from 'lucide-react';
import type { Application, Interview } from '@/shared/types/application';
import { cn } from '@/shared/lib/utils';
import { format, isFuture, isToday } from 'date-fns';

interface InterviewsTabProps {
  application: Application;
}

export function InterviewsTab({ application }: InterviewsTabProps) {
  const { interviews } = application;

  if (!interviews || interviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Interviews Scheduled</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Interview schedules will appear here once they are set up for this candidate.
        </p>
      </div>
    );
  }

  // Categorize interviews
  const upcomingInterviews = interviews.filter(
    i => i.status === 'scheduled' && isFuture(i.scheduledDate)
  );
  const todayInterviews = interviews.filter(
    i => i.status === 'scheduled' && isToday(i.scheduledDate)
  );
  const completedInterviews = interviews.filter(i => i.status === 'completed');
  const cancelledInterviews = interviews.filter(
    i => i.status === 'cancelled' || i.status === 'no_show'
  );

  const getInterviewIcon = (type: Interview['type']) => {
    switch (type) {
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'onsite':
        return <Building2 className="h-4 w-4" />;
      case 'technical':
      case 'behavioral':
        return <FileText className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Interview['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'no_show':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: Interview['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'no_show':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-4 w-4",
              star <= rating
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/30"
            )}
          />
        ))}
      </div>
    );
  };

  const renderInterviewCard = (interview: Interview, showFeedback = false) => (
    <Card key={interview.id} className="overflow-hidden">
      <CardHeader className="bg-muted/30">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                interview.status === 'completed' ? "bg-green-100" :
                  interview.status === 'cancelled' || interview.status === 'no_show' ? "bg-red-100" :
                    "bg-blue-100"
              )}>
                {getInterviewIcon(interview.type)}
              </div>
              <div>
                <CardTitle className="text-base capitalize">
                  {interview.type} Interview
                </CardTitle>
                <CardDescription className="text-sm">
                  {format(interview.scheduledDate, 'EEEE, MMMM dd, yyyy')}
                </CardDescription>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {format(interview.scheduledDate, 'h:mm a')} ({interview.duration} min)
              </span>

              {interview.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {interview.location}
                </span>
              )}

              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {interview.interviewers.length} interviewer{interview.interviewers.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={cn("border", getStatusColor(interview.status))}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(interview.status)}
                  <span className="capitalize text-xs">{interview.status.replace('_', ' ')}</span>
                </span>
              </Badge>

              {interview.rating && (
                <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 rounded-md">
                  {renderStars(interview.rating)}
                </div>
              )}
            </div>
          </div>

          {(interview.meetingLink || interview.recordingUrl) && (
            <div className="flex gap-2">
              {interview.meetingLink && interview.status === 'scheduled' && (
                <Button variant="outline" size="sm" asChild>
                  <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer">
                    <Video className="h-4 w-4 mr-2" />
                    Join
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              )}
              {interview.recordingUrl && interview.status === 'completed' && (
                <Button variant="outline" size="sm" asChild>
                  <a href={interview.recordingUrl} target="_blank" rel="noopener noreferrer">
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Recording
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Interviewers */}
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold mb-2">Interviewers</h4>
            <div className="flex flex-wrap gap-2">
              {interview.interviewers.map((interviewer, idx) => (
                <Badge key={idx} variant="secondary">
                  {interviewer}
                </Badge>
              ))}
            </div>
          </div>

          {/* Feedback Section */}
          {showFeedback && interview.feedback && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Interview Feedback
                </h4>
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm whitespace-pre-wrap">{interview.feedback}</p>
                </div>
              </div>
            </>
          )}

          {/* Additional Notes */}
          {interview.notes && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-2">Notes</h4>
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm whitespace-pre-wrap">{interview.notes}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ScrollArea className="h-[calc(100vh-20rem)]">
      <div className="space-y-6 pr-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{interviews.length}</div>
              <p className="text-xs text-muted-foreground mt-1">All interviews</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-600">Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{upcomingInterviews.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Scheduled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedInterviews.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Finished</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-amber-600">Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{todayInterviews.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Happening today</p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Interviews */}
        {todayInterviews.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <h3 className="text-lg font-semibold">Today's Interviews</h3>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                {todayInterviews.length}
              </Badge>
            </div>
            {todayInterviews.map(interview => renderInterviewCard(interview))}
          </div>
        )}

        {/* Upcoming Interviews */}
        {upcomingInterviews.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Upcoming Interviews</h3>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {upcomingInterviews.length}
              </Badge>
            </div>
            {upcomingInterviews.map(interview => renderInterviewCard(interview))}
          </div>
        )}

        {/* Completed Interviews */}
        {completedInterviews.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold">Completed Interviews</h3>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {completedInterviews.length}
              </Badge>
            </div>
            {completedInterviews.map(interview => renderInterviewCard(interview, true))}
          </div>
        )}

        {/* Cancelled/No Show Interviews */}
        {cancelledInterviews.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Cancelled & No-Shows</h3>
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                {cancelledInterviews.length}
              </Badge>
            </div>
            {cancelledInterviews.map(interview => renderInterviewCard(interview))}
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
