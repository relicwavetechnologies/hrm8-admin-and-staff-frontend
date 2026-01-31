import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  Calendar as CalendarIcon,
  Video,
  Clock,
  Loader2,
  Edit2
} from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { videoInterviewService } from '@/shared/lib/videoInterviewService';
import { useToast } from '@/shared/hooks/use-toast';
import { format, formatInTimeZone } from 'date-fns-tz';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { getOfficeHoursConfig } from './OfficeHoursConfig';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  meetingLink?: string;
  status: string;
  type: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  applicationId: string;
  calendarEventId?: string;
}

interface InterviewCalendarViewProps {
  jobId: string;
  jobTitle: string;
}

export function InterviewCalendarView({ jobId, jobTitle }: InterviewCalendarViewProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [creatingEvent, setCreatingEvent] = useState<{ start: Date; end: Date } | null>(null);
  const [officeHours, setOfficeHours] = useState<any | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const { toast } = useToast();

  // Load company office hours settings
  useEffect(() => {
    loadOfficeHours();
  }, []);

  // Load calendar events
  useEffect(() => {
    if (officeHours) {
      loadCalendarEvents();
    }
  }, [jobId, officeHours]);

  const loadOfficeHours = async () => {
    setIsLoadingSettings(true);
    try {
      const config = await getOfficeHoursConfig();
      setOfficeHours(config);
    } catch (error) {
      console.error('Failed to load office hours:', error);
      // Use defaults if loading fails
      setOfficeHours({
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        startTime: '09:00',
        endTime: '17:00',
      });
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const loadCalendarEvents = async () => {
    setIsLoading(true);
    try {
      // Load events for a wide range (3 months forward, 1 month back)
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3);

      const response = await videoInterviewService.getJobCalendarEvents(
        jobId,
        startDate.toISOString(),
        endDate.toISOString()
      );

      if (response.success && response.data) {
        setEvents(response.data.events);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load calendar events',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to load calendar events:', error);
      toast({
        title: 'Error',
        description: 'Failed to load calendar events',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions for event colors (must be defined before useMemo)
  const getEventColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SCHEDULED':
        return '#3b82f6';
      case 'COMPLETED':
        return '#10b981';
      case 'CANCELLED':
        return '#ef4444';
      case 'IN_PROGRESS':
        return '#f59e0b';
      default:
        return '#3174ad';
    }
  };

  const getEventBorderColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SCHEDULED':
        return '#2563eb';
      case 'COMPLETED':
        return '#059669';
      case 'CANCELLED':
        return '#dc2626';
      case 'IN_PROGRESS':
        return '#d97706';
      default:
        return '#1e40af';
    }
  };

  // Convert events to FullCalendar format
  const fullCalendarEvents = useMemo(() => {
    return events.map(event => ({
      id: event.id,
      title: event.candidateName || 'Interview',
      start: event.start,
      end: event.end,
      backgroundColor: getEventColor(event.status),
      borderColor: getEventBorderColor(event.status),
      extendedProps: {
        ...event,
      },
    }));
  }, [events]);

  // Handle date selection (create new event)
  const handleDateSelect = (selectInfo: any) => {
    setCreatingEvent({
      start: selectInfo.start,
      end: selectInfo.end || new Date(selectInfo.start.getTime() + 60 * 60 * 1000), // Default 1 hour
    });
    setSelectedEvent(null);
    setShowEventDialog(true);
  };

  // Handle event click (view/edit)
  const handleEventClick = (clickInfo: any) => {
    const eventData = clickInfo.event.extendedProps as CalendarEvent;
    setSelectedEvent(eventData);
    setCreatingEvent(null);
    setShowEventDialog(true);
  };

  // Handle event drag and drop (reschedule)
  const handleEventDrop = async (dropInfo: any) => {
    try {
      const newStart = dropInfo.event.start!;

      // TODO: Call backend API to update interview time
      toast({
        title: 'Interview rescheduled',
        description: `Interview moved to ${formatTimeInTimezone(newStart, 'PPp')}`,
      });

      // Reload events to reflect changes
      await loadCalendarEvents();
    } catch (error) {
      console.error('Failed to reschedule interview:', error);
      toast({
        title: 'Error',
        description: 'Failed to reschedule interview',
        variant: 'destructive',
      });
      dropInfo.revert();
    }
  };

  // Handle event resize (change duration)
  const handleEventResize = async (resizeInfo: any) => {
    try {
      const newEnd = resizeInfo.event.end!;
      const durationMinutes = Math.round((newEnd.getTime() - resizeInfo.event.start!.getTime()) / 60000);

      // TODO: Call backend API to update interview duration
      toast({
        title: 'Interview duration updated',
        description: `Duration changed to ${durationMinutes} minutes`,
      });

      // Reload events to reflect changes
      await loadCalendarEvents();
    } catch (error) {
      console.error('Failed to update interview duration:', error);
      toast({
        title: 'Error',
        description: 'Failed to update interview duration',
        variant: 'destructive',
      });
      resizeInfo.revert();
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SCHEDULED':
        return 'default';
      case 'COMPLETED':
        return 'secondary';
      case 'CANCELLED':
        return 'destructive';
      case 'IN_PROGRESS':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Convert work days to FullCalendar day numbers (0=Sunday, 1=Monday, etc.)
  const getHiddenDays = useMemo(() => {
    if (!officeHours) return [];

    const dayMap: Record<string, number> = {
      'sunday': 0,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6,
    };

    const allDays = [0, 1, 2, 3, 4, 5, 6];
    const workDayNumbers = officeHours.workDays.map((day: any) => dayMap[day.toLowerCase()]);

    // Return days that are NOT in workDays (days to hide)
    return allDays.filter(day => !workDayNumbers.includes(day));
  }, [officeHours]);

  // Configure business hours for FullCalendar
  const businessHours = useMemo(() => {
    if (!officeHours) return undefined;

    const [startHour, startMin] = officeHours.startTime.split(':').map(Number);
    const [endHour, endMin] = officeHours.endTime.split(':').map(Number);

    // Map work days to FullCalendar day numbers
    const dayMap: Record<string, number> = {
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6,
      'sunday': 0,
    };

    const daysOfWeek = officeHours.workDays.map((day: any) => dayMap[day.toLowerCase()]);

    return {
      daysOfWeek,
      startTime: `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`,
      endTime: `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`,
    };
  }, [officeHours]);

  // Format time in company timezone for display
  const formatTimeInTimezone = (date: Date | string, formatStr: string = 'PPp'): string => {
    if (!officeHours) return format(new Date(date), formatStr);

    try {
      return formatInTimeZone(new Date(date), officeHours.timezone, formatStr);
    } catch (error) {
      console.error('Error formatting time:', error);
      return format(new Date(date), formatStr);
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
                Interview Calendar - {jobTitle}
              </CardTitle>
              <CardDescription>
                {officeHours ? (
                  <>
                    Calendar showing timezone: <strong>{officeHours.timezone}</strong>
                    {' • '}
                    Working hours: <strong>{officeHours.startTime} - {officeHours.endTime}</strong>
                    {' • '}
                    Working days: <strong>{officeHours.workDays.map((d: any) => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}</strong>
                  </>
                ) : (
                  'Click and drag to schedule, drag events to reschedule, resize edges to change duration'
                )}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadCalendarEvents} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Refresh'
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && events.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading calendar...</span>
            </div>
          ) : (
            <div className="h-[600px]">
              {isLoadingSettings ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading calendar settings...</span>
                </div>
              ) : (
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  events={fullCalendarEvents}
                  editable={true}
                  selectable={true}
                  selectMirror={true}
                  dayMaxEvents={true}
                  weekends={officeHours?.workDays?.includes('saturday') || officeHours?.workDays?.includes('sunday') || true}
                  hiddenDays={getHiddenDays}
                  businessHours={businessHours}
                  timeZone={officeHours?.timezone || 'local'}
                  select={handleDateSelect}
                  eventClick={handleEventClick}
                  eventDrop={handleEventDrop}
                  eventResize={handleEventResize}
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                  }}
                  height="100%"
                  eventDisplay="block"
                  eventTimeFormat={{
                    hour: 'numeric',
                    minute: '2-digit',
                    meridiem: 'short',
                    timeZoneName: 'short'
                  }}
                  slotMinTime={officeHours?.startTime || '08:00:00'}
                  slotMaxTime={officeHours?.endTime || '20:00:00'}
                  slotLabelFormat={{
                    hour: 'numeric',
                    minute: '2-digit',
                    meridiem: 'short',
                    timeZoneName: 'short'
                  }}
                  allDaySlot={false}
                  slotLabelInterval="01:00:00"
                  nowIndicator={true}
                  titleFormat={{
                    month: 'long',
                    year: 'numeric',
                    day: 'numeric'
                  }}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Details/Edit Dialog */}
      {showEventDialog && (
        <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedEvent ? 'Interview Details' : 'Schedule New Interview'}
              </DialogTitle>
              <DialogDescription>
                {selectedEvent
                  ? 'View and edit interview details'
                  : 'Select candidate and schedule interview'}
              </DialogDescription>
            </DialogHeader>
            {selectedEvent && (
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Candidate</div>
                  <div className="text-base font-semibold">{selectedEvent.candidateName}</div>
                  <div className="text-sm text-muted-foreground">{selectedEvent.candidateEmail}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Date & Time</div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatTimeInTimezone(selectedEvent.start, 'PPp')}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Duration: {Math.round((new Date(selectedEvent.end).getTime() - new Date(selectedEvent.start).getTime()) / 60000)} minutes
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Status</div>
                  <Badge variant={getStatusBadgeVariant(selectedEvent.status)}>
                    {selectedEvent.status.replace('_', ' ')}
                  </Badge>
                </div>
                {selectedEvent.meetingLink && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Meeting Link</div>
                    <a
                      href={selectedEvent.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      <Video className="h-4 w-4" />
                      Join Meeting
                    </a>
                  </div>
                )}
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                    Close
                  </Button>
                  <Button onClick={() => {
                    toast({
                      title: 'Edit Interview',
                      description: 'Edit functionality will open edit dialog',
                    });
                  }}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Interview
                  </Button>
                </div>
              </div>
            )}
            {creatingEvent && (
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Selected Time Slot</div>
                  <div className="text-sm">
                    {formatTimeInTimezone(creatingEvent.start, 'PPp')} - {formatTimeInTimezone(creatingEvent.end, 'p')}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  To schedule an interview for this time, use the "Bulk Schedule" button above.
                </div>
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => {
                    setCreatingEvent(null);
                    setShowEventDialog(false);
                  }}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
