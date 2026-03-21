// @ts-nocheck
/**
 * Interview Calendar View
 * FullCalendar-based view for managing all interviews
 */

import { useState, useEffect, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { EventClickArg, EventDropArg, EventResizeArg } from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { interviewService, Interview } from '@/shared/lib/interviewService';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Loader2, Video, Phone, Users, MapPin, User, Mail, MapPin as LocationIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { format } from 'date-fns';

interface InterviewCalendarViewProps {
  jobId?: string;
  jobRoundId?: string;
  onInterviewClick?: (interview: Interview) => void;
  onReschedule?: (interview: Interview, newDate: Date) => void;
}

export function InterviewCalendarView({
  jobId,
  jobRoundId,
  onInterviewClick,
  onReschedule,
}: InterviewCalendarViewProps) {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [view, setView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek'>('timeGridWeek');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadInterviews();
  }, [jobId, jobRoundId, statusFilter]);

  const loadInterviews = async () => {
    setLoading(true);
    try {
      const response = await interviewService.getInterviews({
        jobId,
        jobRoundId,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });

      if (response.success && response.data) {
        setInterviews(response.data.interviews);
      } else {
        toast.error('Failed to load interviews');
      }
    } catch (error) {
      console.error('Failed to load interviews:', error);
      toast.error('Failed to load interviews');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      SCHEDULED: '#3b82f6', // Blue
      IN_PROGRESS: '#f59e0b', // Yellow
      COMPLETED: '#10b981', // Green
      CANCELLED: '#ef4444', // Red
      RESCHEDULED: '#8b5cf6', // Purple
      NO_SHOW: '#f97316', // Orange
    };
    return colors[status] || '#6b7280'; // Gray default
  };

  // Transform interviews to FullCalendar events
  const calendarEvents = useMemo(() => {
    return interviews.map((interview) => {
      const start = new Date(interview.scheduledDate);
      const end = new Date(start.getTime() + interview.duration * 60 * 1000);

      // Get candidate name
      const candidateName = interview.candidate
        ? `${interview.candidate.firstName} ${interview.candidate.lastName}`
        : interview.candidateId.substring(0, 8);

      return {
        id: interview.id,
        title: candidateName,
        start: start.toISOString(),
        end: end.toISOString(),
        backgroundColor: getStatusColor(interview.status),
        borderColor: getStatusColor(interview.status),
        extendedProps: {
          interview,
          candidateName,
        },
        classNames: [`interview-status-${interview.status.toLowerCase()}`],
      };
    });
  }, [interviews]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Video className="h-4 w-4" />;
      case 'PHONE':
        return <Phone className="h-4 w-4" />;
      case 'PANEL':
        return <Users className="h-4 w-4" />;
      case 'IN_PERSON':
        return <MapPin className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const interview = clickInfo.event.extendedProps.interview as Interview;
    setSelectedInterview(interview);
    setShowDetailsDialog(true);
    onInterviewClick?.(interview);
  };

  const handleEventDrop = async (dropInfo: EventDropArg) => {
    const interview = dropInfo.event.extendedProps.interview as Interview;
    const newStart = dropInfo.event.start!;

    try {
      const response = await interviewService.rescheduleInterview(
        interview.id,
        newStart.toISOString()
      );

      if (response.success) {
        toast.success('Interview rescheduled successfully');
        await loadInterviews();
        onReschedule?.(interview, newStart);
      } else {
        throw new Error(response.error || 'Failed to reschedule');
      }
    } catch (error) {
      console.error('Failed to reschedule interview:', error);
      toast.error('Failed to reschedule interview');
      dropInfo.revert();
    }
  };

  const handleEventResize = async (resizeInfo: EventResizeArg) => {
    const interview = resizeInfo.event.extendedProps.interview as Interview;
    const newEnd = resizeInfo.event.end!;
    const durationMinutes = Math.round(
      (newEnd.getTime() - resizeInfo.event.start!.getTime()) / 60000
    );

    // TODO: Add duration update API endpoint
    toast.info('Duration update feature coming soon');
    resizeInfo.revert();
  };

  const handleCancelInterview = async () => {
    if (!selectedInterview) return;

    const reason = prompt('Please provide a cancellation reason:');
    if (!reason) return;

    try {
      const response = await interviewService.cancelInterview(selectedInterview.id, reason);
      if (response.success) {
        toast.success('Interview cancelled successfully');
        setShowDetailsDialog(false);
        await loadInterviews();
      } else {
        throw new Error(response.error || 'Failed to cancel');
      }
    } catch (error) {
      console.error('Failed to cancel interview:', error);
      toast.error('Failed to cancel interview');
    }
  };

  const handleMarkNoShow = async () => {
    if (!selectedInterview) return;

    const reason = prompt('Please provide a reason (optional):') || undefined;

    try {
      const response = await interviewService.markAsNoShow(selectedInterview.id, reason);
      if (response.success) {
        toast.success('Interview marked as no-show');
        setShowDetailsDialog(false);
        await loadInterviews();
      } else {
        throw new Error(response.error || 'Failed to mark as no-show');
      }
    } catch (error) {
      console.error('Failed to mark as no-show:', error);
      toast.error('Failed to mark as no-show');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Interview Calendar
              </CardTitle>
              <CardDescription>
                View and manage all interviews. Drag events to reschedule.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="NO_SHOW">No Show</SelectItem>
                  <SelectItem value="RESCHEDULED">Rescheduled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={view} onValueChange={(v: any) => setView(v)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dayGridMonth">Month</SelectItem>
                  <SelectItem value="timeGridWeek">Week</SelectItem>
                  <SelectItem value="timeGridDay">Day</SelectItem>
                  <SelectItem value="listWeek">List</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={loadInterviews} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && interviews.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading interviews...</span>
            </div>
          ) : (
            <div className="h-[600px]">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                initialView={view}
                events={calendarEvents}
                editable={true}
                eventResizableFromStart={true}
                eventDurationEditable={true}
                eventClick={handleEventClick}
                eventDrop={handleEventDrop}
                eventResize={handleEventResize}
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
                }}
                slotMinTime="08:00:00"
                slotMaxTime="20:00:00"
                businessHours={{
                  daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
                  startTime: '09:00',
                  endTime: '17:00',
                }}
                eventContent={(eventInfo) => (
                  <div className="flex items-center gap-1 p-1">
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{
                        backgroundColor: eventInfo.event.backgroundColor,
                        borderColor: eventInfo.event.borderColor,
                        color: 'white',
                      }}
                    >
                      {eventInfo.event.extendedProps.interview?.type &&
                        getTypeIcon(eventInfo.event.extendedProps.interview.type)}
                      <span className="ml-1">
                        {format(new Date(eventInfo.event.start!), 'HH:mm')}
                      </span>
                    </Badge>
                  </div>
                )}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interview Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Interview Details</DialogTitle>
            <DialogDescription>View and manage interview information</DialogDescription>
          </DialogHeader>
          {selectedInterview && (
            <div className="space-y-6">
              {/* Candidate Information */}
              {selectedInterview.candidate && (
                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border">
                  <Avatar className="h-16 w-16 border-2 border-white shadow-md">
                    <AvatarImage src={selectedInterview.candidate.photo} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-lg font-semibold">
                      {selectedInterview.candidate.firstName?.[0]}{selectedInterview.candidate.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {selectedInterview.candidate.firstName} {selectedInterview.candidate.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <Mail className="h-3 w-3" />
                        {selectedInterview.candidate.email}
                      </p>
                      {(selectedInterview.candidate.phone || selectedInterview.candidate.city) && (
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          {selectedInterview.candidate.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {selectedInterview.candidate.phone}
                            </span>
                          )}
                          {(selectedInterview.candidate.city || selectedInterview.candidate.country) && (
                            <span className="flex items-center gap-1">
                              <LocationIcon className="h-3 w-3" />
                              {[selectedInterview.candidate.city, selectedInterview.candidate.state, selectedInterview.candidate.country].filter(Boolean).join(', ')}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Interview Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Status</div>
                  <Badge
                    style={{
                      backgroundColor: getStatusColor(selectedInterview.status),
                    }}
                    className="text-white"
                  >
                    {selectedInterview.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Type</div>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(selectedInterview.type)}
                    <span>{selectedInterview.type.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Scheduled Date & Time</div>
                <div className="text-base font-medium">
                  {format(new Date(selectedInterview.scheduledDate), 'PPP p')}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Duration: {selectedInterview.duration} minutes
                </div>
              </div>

              {selectedInterview.meetingLink && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Meeting Link</div>
                  <a
                    href={selectedInterview.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    <Video className="h-4 w-4" />
                    Join Meeting
                  </a>
                </div>
              )}

              {selectedInterview.isAutoScheduled && (
                <Badge variant="secondary" className="w-fit">✨ Auto-Scheduled</Badge>
              )}

              {selectedInterview.cancellationReason && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-md border border-red-200 dark:border-red-900">
                  <div className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                    Cancellation Reason
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-300">{selectedInterview.cancellationReason}</div>
                </div>
              )}

              {selectedInterview.noShowReason && (
                <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-md border border-orange-200 dark:border-orange-900">
                  <div className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-1">No-Show Reason</div>
                  <div className="text-sm text-orange-700 dark:text-orange-300">{selectedInterview.noShowReason}</div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                  Close
                </Button>
                {selectedInterview.status === 'SCHEDULED' && (
                  <>
                    <Button variant="destructive" onClick={handleCancelInterview}>
                      Cancel Interview
                    </Button>
                    <Button variant="outline" onClick={handleMarkNoShow}>
                      Mark No-Show
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
