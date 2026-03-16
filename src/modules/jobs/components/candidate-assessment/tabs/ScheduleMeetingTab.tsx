// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Label } from '@/shared/components/ui/label';
import { Loader2, Calendar, Video, Phone, Building2, Users, ChevronDown, History } from 'lucide-react';
import { format } from 'date-fns';
import { apiClient } from '@/shared/lib/api';
import { useToast } from '@/shared/hooks/use-toast';
import { Application } from '@/shared/types/application';
import { DateTimePicker } from '@/shared/components/ui/date-time-picker';
import {
  meetingTemplates,
  durationOptions,
  type MeetingType,
} from '@/shared/lib/meetingTemplates';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { AvailabilityGrid } from './AvailabilityGrid';
import { MergedCalendarDrawer } from './MergedCalendarDrawer';

interface ScheduleMeetingTabProps {
  application: Application;
}

interface Interview {
  id: string;
  scheduled_date: string;
  duration: number;
  type: MeetingType;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | 'NO_SHOW';
  meeting_link?: string;
  notes?: string;
  created_at: string;
}

interface HiringTeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  roleDetails: Array<{ id: string; name: string }>;
}

type PhoneCallMode = 'meet' | 'self';

function getStatusColor(status: Interview['status']): string {
  switch (status) {
    case 'SCHEDULED':
      return 'bg-blue-500/10 text-blue-700 border-blue-200';
    case 'IN_PROGRESS':
      return 'bg-green-500/10 text-green-700 border-green-200';
    case 'COMPLETED':
      return 'bg-gray-500/10 text-gray-700 border-gray-200';
    case 'CANCELLED':
      return 'bg-red-500/10 text-red-700 border-red-200';
    case 'RESCHEDULED':
      return 'bg-orange-500/10 text-orange-700 border-orange-200';
    case 'NO_SHOW':
      return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
    default:
      return 'bg-gray-500/10 text-gray-700 border-gray-200';
  }
}

function getMeetingIcon(type: MeetingType) {
  switch (type) {
    case 'VIDEO':
      return Video;
    case 'PHONE':
      return Phone;
    case 'IN_PERSON':
      return Building2;
    case 'PANEL':
      return Users;
    default:
      return Calendar;
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function ScheduleMeetingTab({ application }: ScheduleMeetingTabProps) {
  const [selectedType, setSelectedType] = useState<MeetingType>('VIDEO');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedDuration, setSelectedDuration] = useState<string>('45');
  const [notes, setNotes] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [hiringTeam, setHiringTeam] = useState<HiringTeamMember[]>([]);
  const [selectedInterviewers, setSelectedInterviewers] = useState<string[]>([]);
  const [interviewerPopoverOpen, setInterviewerPopoverOpen] = useState(false);
  const [phoneCallMode, setPhoneCallMode] = useState<PhoneCallMode>('meet');
  const [calendarStatuses, setCalendarStatuses] = useState<Record<string, boolean>>({});
  const [calendarDrawerOpen, setCalendarDrawerOpen] = useState(false);
  const { toast } = useToast();

  const candidateName = application.candidateName || 'Candidate';

  // Fetch interviews
  useEffect(() => {
    const fetchInterviews = async () => {
      if (!application.id) return;
      setIsLoading(true);
      try {
        const response = await apiClient.get<{ interviews: Interview[] }>(
          `/api/applications/${application.id}/interviews`
        );
        if (response.success && response.data?.interviews) {
          setInterviews(response.data.interviews);
        }
      } catch (error) {
        console.error('Failed to fetch interviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterviews();
  }, [application.id]);

  // Fetch hiring team
  useEffect(() => {
    const fetchHiringTeam = async () => {
      let jobId = application.jobId || (application as any).job?.id;
      if (!jobId) return;

      try {
        const response = await apiClient.get<HiringTeamMember[]>(
          `/api/jobs/${jobId}/team`
        );
        if (response.success && response.data) {
          setHiringTeam(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch hiring team:', error);
      }
    };

    fetchHiringTeam();
  }, [application.jobId, (application as any).job?.id]);

  // Fetch calendar connection status for all hiring team members
  useEffect(() => {
    const fetchCalendarStatuses = async () => {
      if (hiringTeam.length === 0) return;
      try {
        const response = await apiClient.post<{ [userId: string]: { connected: boolean } }>(
          '/api/auth/google/interviewers-status',
          { interviewerIds: hiringTeam.map((m) => m.userId) }
        );
        if (response.success && response.data) {
          const statuses: Record<string, boolean> = {};
          for (const [userId, status] of Object.entries(response.data)) {
            statuses[userId] = (status as { connected: boolean }).connected;
          }
          setCalendarStatuses(statuses);
        }
      } catch {
        // Non-fatal — silently fail
      }
    };

    fetchCalendarStatuses();
  }, [hiringTeam]);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = meetingTemplates.find((t) => t.id === templateId);
    if (template) {
      setSelectedType(template.type);
      setSelectedDuration(template.duration.toString());
      toast({
        title: 'Template loaded',
        description: `"${template.name}" template applied`,
      });
    }
  };

  const toggleInterviewer = (userId: string) => {
    setSelectedInterviewers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const useMeetLink =
    selectedType === 'VIDEO' || (selectedType === 'PHONE' && phoneCallMode === 'meet');

  const handleSchedule = async () => {
    if (!selectedDate) {
      toast({
        title: 'Date required',
        description: 'Please select a date and time for the meeting',
        variant: 'destructive',
      });
      return;
    }

    setIsScheduling(true);

    try {
      const response = await apiClient.post<{ interview: Interview }>(
        `/api/applications/${application.id}/interviews`,
        {
          scheduledDate: selectedDate.toISOString(),
          duration: parseInt(selectedDuration),
          type: selectedType,
          notes: notes.trim() || undefined,
          interviewerIds: selectedInterviewers,
          useMeetLink,
        }
      );

      if (response.success && response.data?.interview) {
        const inv = response.data.interview;
        const meetFailed = (inv as any)._meetLinkFailed;
        const meetLinkError = (inv as any)._meetLinkError as string | undefined;

        if (meetFailed) {
          toast({
            title: 'Meeting scheduled (without Meet link)',
            description: meetLinkError || 'Google Meet link could not be generated. Make sure your Google Calendar is connected.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Meeting scheduled!',
            description: inv.meeting_link
              ? `${selectedType} meeting scheduled — Google Meet link generated`
              : `${selectedType} meeting scheduled with ${candidateName}`,
          });
        }
        setInterviews((prev) => [inv, ...prev]);
        // Reset form
        setSelectedDate(undefined);
        setNotes('');
        setSelectedTemplate('');
        setSelectedInterviewers([]);
      } else {
        throw new Error(response.error || 'Failed to schedule meeting');
      }
    } catch (error) {
      console.error('Failed to schedule meeting:', error);
      toast({
        title: 'Failed to schedule meeting',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const selectedMemberDetails = hiringTeam.filter((m) => selectedInterviewers.includes(m.userId));

  return (
    <div className="flex flex-col h-full space-y-1.5 py-1.5 overflow-hidden text-xs">
      {/* Header Row */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 min-w-0 bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight flex-shrink-0">Scheduling for:</span>
            <span className="text-[10px] font-semibold text-primary truncate max-w-[120px]">{candidateName}</span>
          </div>

          <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
            <SelectTrigger className="h-6 w-[140px] text-[10px] bg-transparent border-transparent hover:bg-muted/50 p-0 px-2 [&>span]:truncate focus:ring-0">
              <div className="flex items-center gap-1.5 overflow-hidden">
                <Video className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <SelectValue placeholder="Load Preset..." />
              </div>
            </SelectTrigger>
            <SelectContent>
              {meetingTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  <span className="text-[11px]">{template.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full hover:bg-muted">
                <History className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0 shadow-xl border-muted" side="bottom" align="end">
              <div className="p-2 border-b bg-muted/30">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Scheduled Interviews</h4>
              </div>
              <ScrollArea className="h-[240px]">
                <div className="p-1 space-y-1">
                  {isLoading ? (
                    <div className="py-6 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                  ) : interviews.length === 0 ? (
                    <div className="py-6 text-center text-[10px] text-muted-foreground">No meetings scheduled</div>
                  ) : (
                    interviews.map((interview) => {
                      const Icon = getMeetingIcon(interview.type);
                      return (
                        <div key={interview.id} className="p-2 bg-muted/20 rounded border text-[10px] space-y-1">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-1.5">
                              <Icon className="h-3 w-3 text-muted-foreground" />
                              <span className="font-semibold uppercase text-[9px]">{interview.type}</span>
                            </div>
                            <Badge variant="outline" className={`text-[8px] h-3.5 px-1 ${getStatusColor(interview.status)}`}>{interview.status}</Badge>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Calendar className="h-2.5 w-2.5" />
                            <span>{format(new Date(interview.scheduled_date), 'MMM d, h:mm a')}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>

          <Button
            onClick={handleSchedule}
            disabled={!selectedDate || isScheduling}
            className="h-6 px-3 text-[10px] font-bold shadow-sm rounded-full"
            size="sm"
          >
            {isScheduling ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Schedule'}
          </Button>
        </div>
      </div>

      <div className="h-px bg-border/40 mx-1" />

      {/* Main Form Area */}
      <div className="flex-1 min-h-0 px-1 pb-1 flex flex-col space-y-2 overflow-y-auto">
        {/* Type & Duration */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-0.5">
            <Label className="text-[9px] font-semibold text-muted-foreground ml-1">Type</Label>
            <Select value={selectedType} onValueChange={(v) => setSelectedType(v as MeetingType)}>
              <SelectTrigger className="text-[11px] h-7 bg-muted/30 border-muted-foreground/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIDEO"><div className="flex items-center gap-2 px-1"><Video className="h-3.5 w-3.5" /><span>Video Call</span></div></SelectItem>
                <SelectItem value="PHONE"><div className="flex items-center gap-2 px-1"><Phone className="h-3.5 w-3.5" /><span>Phone Call</span></div></SelectItem>
                <SelectItem value="IN_PERSON"><div className="flex items-center gap-2 px-1"><Building2 className="h-3.5 w-3.5" /><span>In-Person</span></div></SelectItem>
                <SelectItem value="PANEL"><div className="flex items-center gap-2 px-1"><Users className="h-3.5 w-3.5" /><span>Panel</span></div></SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-0.5">
            <Label className="text-[9px] font-semibold text-muted-foreground ml-1">Duration</Label>
            <Select value={selectedDuration} onValueChange={setSelectedDuration}>
              <SelectTrigger className="text-[11px] h-7 bg-muted/30 border-muted-foreground/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}><span className="text-[11px] px-1">{option.label}</span></SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* PHONE: Meet or Handle Yourself toggle */}
        {selectedType === 'PHONE' && (
          <div className="bg-muted/30 rounded p-1.5 border border-muted-foreground/10 flex items-center gap-3">
            <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">Mode:</span>
            <RadioGroup
              value={phoneCallMode}
              onValueChange={(v) => setPhoneCallMode(v as PhoneCallMode)}
              className="flex gap-3"
            >
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="meet" id="phone-meet" className="h-2.5 w-2.5" />
                <Label htmlFor="phone-meet" className="text-[10px] cursor-pointer font-normal">Google Meet</Label>
              </div>
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="self" id="phone-self" className="h-2.5 w-2.5" />
                <Label htmlFor="phone-self" className="text-[10px] cursor-pointer font-normal">Manual</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Date & Time AND Interviewers Row */}
        <div className="grid grid-cols-2 gap-2">
          {/* Date Time Picker */}
          <div className="space-y-0.5">
            <Label className="text-[9px] font-semibold text-muted-foreground ml-1">Date & Time</Label>
            <div className="flex gap-1">
              <DateTimePicker
                date={selectedDate}
                onDateChange={setSelectedDate}
                placeholder="Pick date & time"
                disabled={isScheduling}
                className="w-full h-7 px-2 text-[11px] bg-muted/30 border-muted-foreground/20"
              />
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0 flex-shrink-0 bg-muted/30 border-muted-foreground/20"
                onClick={() => setCalendarDrawerOpen(true)}
                disabled={selectedInterviewers.length === 0}
                title={selectedInterviewers.length === 0 ? 'Select interviewers first' : 'View merged calendar'}
              >
                <Calendar className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Interviewers Multi-Select */}
          <div className="space-y-0.5">
            <div className="flex items-center justify-between">
              <Label className="text-[9px] font-semibold text-muted-foreground ml-1">Interviewers</Label>
              {selectedInterviewers.length > 0 && (
                <Button
                  variant="link"
                  size="sm"
                  className="text-[9px] h-auto p-0 mr-1 text-muted-foreground hover:text-primary"
                  onClick={() => setSelectedInterviewers([])}
                >
                  Clear
                </Button>
              )}
            </div>
            <Popover open={interviewerPopoverOpen} onOpenChange={setInterviewerPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full h-7 justify-between text-[11px] bg-muted/30 border-muted-foreground/20 font-normal px-2"
                >
                  <span className="truncate">
                    {selectedInterviewers.length === 0
                      ? 'Select interviewers...'
                      : `${selectedInterviewers.length} selected`}
                  </span>
                  <ChevronDown className="h-3 w-3 ml-1 flex-shrink-0 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0 shadow-lg" align="start">
                <div className="p-2 border-b bg-muted/20">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Hiring Team</p>
                </div>
                <ScrollArea className="max-h-48">
                  <div className="p-1">
                    {hiringTeam.length === 0 ? (
                      <p className="text-[10px] text-muted-foreground text-center py-3">No team members found</p>
                    ) : (
                      hiringTeam.map((member) => {
                        const isSelected = selectedInterviewers.includes(member.userId);
                        const isConnected = calendarStatuses[member.userId] ?? false;

                        return (
                          <div
                            key={member.userId}
                            className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 cursor-pointer"
                            onClick={() => toggleInterviewer(member.userId)}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleInterviewer(member.userId)}
                              className="h-3 w-3 flex-shrink-0"
                            />
                            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-[8px] font-bold text-primary">{getInitials(member.name)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-medium truncate">{member.name}</p>
                            </div>
                            <div
                              className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`}
                              title={isConnected ? 'Calendar connected' : 'Calendar not connected'}
                            />
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Selected interviewer chips - Full Width */}
        {selectedMemberDetails.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5 min-h-[22px]">
            {selectedMemberDetails.map((m) => (
              <div
                key={m.userId}
                className="flex items-center gap-1 bg-background border border-border rounded-full px-1.5 py-0.5 shadow-sm"
              >
                <span className="text-[9px] font-medium">{m.name.split(' ')[0]}</span>
                {!calendarStatuses[m.userId] && (
                  <span className="text-[8px] text-amber-600" title="Calendar not connected">⚠</span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:text-destructive"
                  onClick={() => toggleInterviewer(m.userId)}
                >
                  <span className="sr-only">Remove</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 hover:opacity-100"><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Availability Grid */}
        {selectedInterviewers.length > 0 && useMeetLink && (
          <div className="py-1">
            <AvailabilityGrid
              interviewers={hiringTeam
                .filter((m) => selectedInterviewers.includes(m.userId))
                .map((m) => ({ userId: m.userId, name: m.name }))}
              proposedTime={selectedDate}
              duration={parseInt(selectedDuration)}
            />
          </div>
        )}

        {/* Notes */}
        <div className="flex-1 flex flex-col space-y-0.5 min-h-0">
          <Label className="text-[9px] font-semibold text-muted-foreground ml-1">Internal Notes</Label>
          <Textarea
            placeholder="Instructions for interviewers..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="flex-1 resize-none text-[10px] leading-relaxed p-2 focus-visible:ring-primary/20 min-h-[50px] bg-muted/30 border-muted-foreground/20"
            disabled={isScheduling}
          />
        </div>
      </div>

      {/* Merged Calendar Drawer */}
      <MergedCalendarDrawer
        open={calendarDrawerOpen}
        onOpenChange={setCalendarDrawerOpen}
        interviewers={hiringTeam
          .filter(m => selectedInterviewers.includes(m.userId))
          .map(m => ({ userId: m.userId, name: m.name }))}
        duration={parseInt(selectedDuration)}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
    </div>
  );
}
