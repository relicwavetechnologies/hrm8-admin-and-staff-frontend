// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/shared/components/ui/sheet';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  Check,
} from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, addWeeks } from 'date-fns';
import { apiClient } from '@/shared/lib/api';

interface InterviewerInfo {
  userId: string;
  name: string;
}

interface MergedCalendarDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interviewers: InterviewerInfo[];
  duration: number;
  selectedDate?: Date;
  onDateChange: (date: Date) => void;
}

interface BusySlot {
  start: string;
  end: string;
}

interface AvailabilityResult {
  [userId: string]: {
    connected: boolean;
    busy: BusySlot[];
  };
}

interface CompanyTimezoneInfo {
  timezone: string;
  work_days: string[];
  start_time: string;
  end_time: string;
}

interface Suggestion {
  start: string;
  end: string;
  score: number;
  reason: string;
}

const INTERVIEWER_COLORS = [
  { bg: 'rgba(59, 130, 246, 0.20)', border: '#3b82f6', label: 'bg-blue-500' },
  { bg: 'rgba(239, 68, 68, 0.20)', border: '#ef4444', label: 'bg-red-500' },
  { bg: 'rgba(16, 185, 129, 0.20)', border: '#10b981', label: 'bg-emerald-500' },
  { bg: 'rgba(245, 158, 11, 0.20)', border: '#f59e0b', label: 'bg-amber-500' },
  { bg: 'rgba(139, 92, 246, 0.20)', border: '#8b5cf6', label: 'bg-violet-500' },
  { bg: 'rgba(236, 72, 153, 0.20)', border: '#ec4899', label: 'bg-pink-500' },
];

const ALL_DAYS = [
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
  { key: 'sunday', label: 'Sun' },
];

const TIME_OPTIONS = Array.from({ length: 24 }, (_, h) => {
  const hour = h.toString().padStart(2, '0');
  return { value: `${hour}:00`, label: `${h === 0 ? 12 : h > 12 ? h - 12 : h}:00 ${h < 12 ? 'AM' : 'PM'}` };
});

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function MergedCalendarDrawer({
  open,
  onOpenChange,
  interviewers,
  duration,
  selectedDate,
  onDateChange,
}: MergedCalendarDrawerProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [availability, setAvailability] = useState<AvailabilityResult | null>(null);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [companyTz, setCompanyTz] = useState<CompanyTimezoneInfo | null>(null);
  const [proposedSlot, setProposedSlot] = useState<{ start: Date; end: Date } | null>(null);

  // AI Suggest state
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [preferredDays, setPreferredDays] = useState<string[]>([]);
  const [prefTimeStart, setPrefTimeStart] = useState('09:00');
  const [prefTimeEnd, setPrefTimeEnd] = useState('17:00');
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Fetch company timezone
  useEffect(() => {
    if (!open) return;
    const fetchTz = async () => {
      try {
        const response = await apiClient.get<CompanyTimezoneInfo>('/api/auth/google/company-timezone');
        if (response.success && response.data) {
          setCompanyTz(response.data);
          setPreferredDays(response.data.work_days);
          setPrefTimeStart(response.data.start_time);
          setPrefTimeEnd(response.data.end_time);
        }
      } catch {
        // Fallback defaults already set
      }
    };
    fetchTz();
  }, [open]);

  // Set default date range for AI suggestions
  useEffect(() => {
    if (!dateRangeStart) {
      const today = new Date();
      setDateRangeStart(today.toISOString().split('T')[0]);
      setDateRangeEnd(addDays(today, 14).toISOString().split('T')[0]);
    }
  }, [dateRangeStart]);

  // Keep a stable ref to interviewers to avoid re-render loops
  const interviewersRef = useRef(interviewers);
  interviewersRef.current = interviewers;

  // Stable serialized key for interviewers to avoid infinite re-render loops
  const interviewerIds = useMemo(
    () => interviewers.map(i => i.userId).sort().join(','),
    [interviewers]
  );
  const timezone = companyTz?.timezone ?? '';

  // Fetch availability when week changes or drawer opens
  useEffect(() => {
    if (!open || !interviewerIds) return;

    let cancelled = false;
    const fetchAvailability = async () => {
      setIsLoadingAvailability(true);
      try {
        const timeMin = weekStart;
        const timeMax = endOfWeek(weekStart, { weekStartsOn: 1 });

        const response = await apiClient.post<AvailabilityResult>(
          '/api/auth/google/interviewers-availability',
          {
            interviewerIds: interviewerIds.split(','),
            timeMin: timeMin.toISOString(),
            timeMax: timeMax.toISOString(),
            timezone: timezone || undefined,
          }
        );

        if (!cancelled && response.success && response.data) {
          setAvailability(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch availability:', error);
      } finally {
        if (!cancelled) setIsLoadingAvailability(false);
      }
    };

    fetchAvailability();
    return () => { cancelled = true; };
  }, [open, interviewerIds, weekStart, timezone]);

  // Build FullCalendar events from availability data
  const calendarEvents = useMemo(() => {
    const events: Array<{
      id: string;
      title: string;
      start: string;
      end: string;
      backgroundColor: string;
      borderColor: string;
      display: string;
      editable: boolean;
    }> = [];

    if (availability) {
      const currentInterviewers = interviewersRef.current;
      currentInterviewers.forEach((interviewer, idx) => {
        const data = availability[interviewer.userId];
        if (!data || !data.connected) return;
        const color = INTERVIEWER_COLORS[idx % INTERVIEWER_COLORS.length];

        data.busy.forEach((slot, slotIdx) => {
          events.push({
            id: `busy-${interviewer.userId}-${slotIdx}`,
            title: interviewer.name.split(' ')[0],
            start: slot.start,
            end: slot.end,
            backgroundColor: color.bg,
            borderColor: color.border,
            display: 'background',
            editable: false,
          });
        });
      });
    }

    // Add proposed slot
    if (proposedSlot) {
      events.push({
        id: 'proposed-slot',
        title: `Meeting (${duration}m)`,
        start: proposedSlot.start.toISOString(),
        end: proposedSlot.end.toISOString(),
        backgroundColor: 'rgba(34, 197, 94, 0.3)',
        borderColor: '#22c55e',
        display: 'auto',
        editable: false,
      });
    }

    return events;
    // interviewerIds used as stable proxy for interviewers array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availability, interviewerIds, proposedSlot, duration]);

  const handleDateClick = (info: { date: Date }) => {
    const start = info.date;
    const end = new Date(start.getTime() + duration * 60000);
    setProposedSlot({ start, end });
  };

  const handleConfirmSelection = () => {
    if (proposedSlot) {
      onDateChange(proposedSlot.start);
      onOpenChange(false);
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newStart = addWeeks(weekStart, direction === 'next' ? 1 : -1);
    setWeekStart(newStart);
    const api = calendarRef.current?.getApi();
    if (api) {
      api.gotoDate(newStart);
    }
  };

  const handleSuggestTime = async () => {
    if (interviewers.length === 0) return;
    setIsLoadingSuggestions(true);
    setSuggestions([]);

    try {
      const response = await apiClient.post<{ suggestions: Suggestion[] }>(
        '/api/interviews/suggest-time',
        {
          interviewerIds: interviewers.map(i => i.userId),
          duration,
          preferredDays,
          preferredTimeStart: prefTimeStart,
          preferredTimeEnd: prefTimeEnd,
          dateRangeStart,
          dateRangeEnd,
          timezone: companyTz?.timezone || 'UTC',
        }
      );

      if (response.success && response.data?.suggestions) {
        setSuggestions(response.data.suggestions);
      }
    } catch (error) {
      console.error('Failed to get suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    const start = new Date(suggestion.start);
    const end = new Date(suggestion.end);
    setProposedSlot({ start, end });

    // Navigate calendar to that week
    const newWeekStart = startOfWeek(start, { weekStartsOn: 1 });
    setWeekStart(newWeekStart);
    const api = calendarRef.current?.getApi();
    if (api) {
      api.gotoDate(start);
    }
  };

  const togglePreferredDay = (day: string) => {
    setPreferredDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const slotStartTime = companyTz?.start_time || '09:00';
  const slotEndTime = companyTz?.end_time || '17:00';

  // Map work_days to FullCalendar hiddenDays (0=Sun, 1=Mon, ...)
  const dayMap: Record<string, number> = {
    sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
    thursday: 4, friday: 5, saturday: 6,
  };
  const workDayNums = (companyTz?.work_days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']).map(d => dayMap[d]);
  const hiddenDays = [0, 1, 2, 3, 4, 5, 6].filter(d => !workDayNums.includes(d));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-2xl w-full p-0 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b space-y-2">
          <SheetHeader>
            <SheetTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Find Available Time
            </SheetTitle>
            <SheetDescription className="text-xs">
              {companyTz?.timezone && (
                <span className="text-muted-foreground">Timezone: {companyTz.timezone}</span>
              )}
            </SheetDescription>
          </SheetHeader>

          {/* Interviewer avatars + color legend */}
          <div className="flex flex-wrap gap-2">
            {interviewers.map((interviewer, idx) => {
              const color = INTERVIEWER_COLORS[idx % INTERVIEWER_COLORS.length];
              return (
                <div key={interviewer.userId} className="flex items-center gap-1.5">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: color.border }}
                  />
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-primary">{getInitials(interviewer.name)}</span>
                  </div>
                  <span className="text-[10px] font-medium">{interviewer.name.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>

          {/* Week Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => navigateWeek('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium">
              {format(weekStart, 'MMM d')} – {format(endOfWeek(weekStart, { weekStartsOn: 1 }), 'MMM d, yyyy')}
            </span>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => navigateWeek('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* AI Suggest Panel (collapsible) */}
        <div className="border-b">
          <Button
            variant="ghost"
            className="w-full px-4 py-2 h-auto flex items-center justify-between text-xs font-medium hover:bg-muted/50 transition-colors rounded-none"
            onClick={() => setAiPanelOpen(!aiPanelOpen)}
          >
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>AI Time Suggestions</span>
            </div>
            {aiPanelOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>

          {aiPanelOpen && (
            <div className="px-4 pb-3 space-y-3">
              {/* Preferred Days */}
              <div className="space-y-1">
                <Label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Preferred Days</Label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_DAYS.map(day => (
                    <label
                      key={day.key}
                      className="flex items-center gap-1 cursor-pointer"
                    >
                      <Checkbox
                        checked={preferredDays.includes(day.key)}
                        onCheckedChange={() => togglePreferredDay(day.key)}
                        className="h-3 w-3"
                      />
                      <span className="text-[10px]">{day.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <Label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">From</Label>
                  <Select value={prefTimeStart} onValueChange={setPrefTimeStart}>
                    <SelectTrigger className="h-7 text-[10px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value} className="text-[10px]">{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-0.5">
                  <Label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">To</Label>
                  <Select value={prefTimeEnd} onValueChange={setPrefTimeEnd}>
                    <SelectTrigger className="h-7 text-[10px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value} className="text-[10px]">{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <Label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Start Date</Label>
                  <Input
                    type="date"
                    value={dateRangeStart}
                    onChange={e => setDateRangeStart(e.target.value)}
                    className="h-7 text-[10px] px-2"
                  />
                </div>
                <div className="space-y-0.5">
                  <Label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">End Date</Label>
                  <Input
                    type="date"
                    value={dateRangeEnd}
                    onChange={e => setDateRangeEnd(e.target.value)}
                    className="h-7 text-[10px] px-2"
                  />
                </div>
              </div>

              <Button
                size="sm"
                className="h-7 text-[10px] w-full gap-1.5"
                onClick={handleSuggestTime}
                disabled={isLoadingSuggestions || interviewers.length === 0}
              >
                {isLoadingSuggestions ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                Find Best Time
              </Button>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="space-y-1.5">
                  {suggestions.map((s, idx) => (
                    <Button
                      key={idx}
                      variant="ghost"
                      className="w-full h-auto text-left p-2 rounded-md border bg-card hover:bg-muted/50 transition-colors flex-col items-start space-y-0.5 justify-start"
                      onClick={() => handleSelectSuggestion(s)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[11px] font-semibold">
                            {format(new Date(s.start), 'EEE, MMM d · h:mm a')}
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-[9px] h-4 px-1">
                          {s.score}%
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{s.reason}</p>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Calendar */}
        <div className="flex-1 min-h-0 overflow-auto px-2 py-2 relative">
          {isLoadingAvailability && (
            <div className="absolute inset-0 bg-background/60 z-10 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          )}
          <FullCalendar
            ref={calendarRef}
            plugins={[timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            initialDate={weekStart}
            headerToolbar={false}
            slotMinTime={slotStartTime}
            slotMaxTime={slotEndTime}
            hiddenDays={hiddenDays}
            allDaySlot={false}
            height="100%"
            slotDuration="00:30:00"
            slotLabelInterval="01:00"
            slotLabelFormat={{
              hour: 'numeric',
              minute: '2-digit',
              meridiem: 'short',
            }}
            dayHeaderFormat={{
              weekday: 'short',
              month: 'numeric',
              day: 'numeric',
            }}
            events={calendarEvents}
            dateClick={handleDateClick}
            selectable={false}
            editable={false}
            eventDisplay="auto"
            nowIndicator
            weekends={!hiddenDays.includes(0) || !hiddenDays.includes(6)}
          />
        </div>

        {/* Footer */}
        <div className="border-t p-3 flex items-center justify-between">
          <div className="text-[10px] text-muted-foreground">
            {proposedSlot ? (
              <span className="flex items-center gap-1">
                <Check className="h-3 w-3 text-green-600" />
                {format(proposedSlot.start, 'EEE, MMM d · h:mm a')} ({duration}m)
              </span>
            ) : (
              'Click on the calendar to select a time slot'
            )}
          </div>
          <Button
            size="sm"
            className="h-7 text-[10px] px-4"
            disabled={!proposedSlot}
            onClick={handleConfirmSelection}
          >
            Confirm Selection
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
