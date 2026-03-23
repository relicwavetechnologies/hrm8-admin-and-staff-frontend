// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { SafeExternalLink } from '@/shared/components/SafeExternalLink';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Calendar,
  Clock,
  Video,
  Phone,
  Building2,
  Users,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PlayCircle,
  MessageSquare,
  Send,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Copy,
  Link
} from 'lucide-react';
import type { Application } from '@/shared/types/application';
import { cn } from '@/shared/lib/utils';
import { format, isFuture, isToday } from 'date-fns';
import { apiClient } from '@/shared/lib/api';
import { useToast } from '@/shared/hooks/use-toast';
import { videoInterviewService, type VideoInterview } from '@/shared/lib/videoInterviewService';
import { getJobTeamEndpoint } from '../teamEndpoint';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';

interface InterviewNote {
  id: string;
  interview_id: string;
  author_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

interface HiringTeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
}

interface InterviewsTabProps {
  application: Application;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function InterviewsTab({ application }: InterviewsTabProps) {
  const [scheduledInterviews, setScheduledInterviews] = useState<any[]>([]);
  const [isLoadingInterviews, setIsLoadingInterviews] = useState(false);
  const [notesMap, setNotesMap] = useState<Record<string, InterviewNote[]>>({});
  const [loadingNotesFor, setLoadingNotesFor] = useState<Record<string, boolean>>({});
  const [addingNoteFor, setAddingNoteFor] = useState<Record<string, boolean>>({});
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [hiringTeam, setHiringTeam] = useState<HiringTeamMember[]>([]);
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const { interviews: applicationInterviews } = application;

  useEffect(() => {
    const fetchHiringTeam = async () => {
      let jobId = application.jobId || (application as any).job?.id;
      if (!jobId) return;

      try {
        const response = await apiClient.get<HiringTeamMember[]>(
          getJobTeamEndpoint(jobId)
        );
        if (response.success && response.data) {
          setHiringTeam(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch hiring team:', error);
      }
    };

    fetchHiringTeam();
  }, [application.id, (application as any).job?.id]);

  useEffect(() => {
    const fetchInterviews = async () => {
      if (!application.id) return;
      setIsLoadingInterviews(true);
      try {
        const response = await apiClient.get<{ interviews: any[] }>(
          `/api/applications/${application.id}/interviews`
        );
        if (response.success && response.data?.interviews) {
          setScheduledInterviews(response.data.interviews);
        }
      } catch (error) {
        console.error('Failed to fetch interviews:', error);
      } finally {
        setIsLoadingInterviews(false);
      }
    };

    fetchInterviews();
  }, [application.id]);

  const fetchNotesForInterview = useCallback(async (interviewId: string) => {
    if (notesMap[interviewId] !== undefined) return;
    setLoadingNotesFor((prev) => ({ ...prev, [interviewId]: true }));
    try {
      const response = await apiClient.get<{ notes: InterviewNote[] }>(
        `/api/applications/${application.id}/interviews/${interviewId}/notes`
      );
      if (response.success && response.data?.notes) {
        setNotesMap((prev) => ({ ...prev, [interviewId]: response.data.notes }));
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setLoadingNotesFor((prev) => ({ ...prev, [interviewId]: false }));
    }
  }, [application.id, notesMap]);

  const toggleRow = (interviewId: string) => {
    const willExpand = !expandedRows[interviewId];
    setExpandedRows((prev) => ({ ...prev, [interviewId]: willExpand }));
    if (willExpand) {
      fetchNotesForInterview(interviewId);
    }
  };

  const getInterviewerName = (interviewer: string | any) => {
    if (typeof interviewer !== 'string') return interviewer.name || 'Unknown';
    // Try to find by userId first, then id
    const member = hiringTeam.find(m => m.userId === interviewer || m.id === interviewer);
    return member ? member.name : 'Unknown'; // Return 'Unknown' instead of ID to avoid confusion
  };

  const handleAddNote = async (interviewId: string) => {
    const content = (noteInputs[interviewId] || '').trim();
    if (!content) return;

    setAddingNoteFor((prev) => ({ ...prev, [interviewId]: true }));
    try {
      const response = await apiClient.post<{ note: InterviewNote }>(
        `/api/applications/${application.id}/interviews/${interviewId}/notes`,
        { content }
      );
      if (response.success && response.data?.note) {
        setNotesMap((prev) => ({
          ...prev,
          [interviewId]: [response.data.note, ...(prev[interviewId] || [])],
        }));
        setNoteInputs((prev) => ({ ...prev, [interviewId]: '' }));
        toast({ title: 'Note added' });
      }
    } catch (error) {
      toast({ title: 'Failed to add note', variant: 'destructive' });
    } finally {
      setAddingNoteFor((prev) => ({ ...prev, [interviewId]: false }));
    }
  };

  const handleDeleteNote = async (interviewId: string, noteId: string) => {
    try {
      await apiClient.delete(`/api/applications/${application.id}/interviews/${interviewId}/notes/${noteId}`);
      setNotesMap((prev) => ({
        ...prev,
        [interviewId]: (prev[interviewId] || []).filter((n) => n.id !== noteId),
      }));
      toast({ title: 'Note deleted' });
    } catch {
      toast({ title: 'Failed to delete note', variant: 'destructive' });
    }
  };

  const handleStatusChange = async (interviewId: string, status: VideoInterview['status']) => {
    setUpdatingStatus((prev) => ({ ...prev, [interviewId]: true }));
    try {
      const response = await videoInterviewService.updateStatus(interviewId, status);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update interview status');
      }

      setScheduledInterviews((prev) =>
        prev.map((item) => {
          if (item.id !== interviewId) return item;
          return {
            ...item,
            status,
            scheduled_date: item.scheduled_date ?? item.scheduledDate,
          };
        })
      );
      toast({ title: 'Interview status updated' });
    } catch (error) {
      console.error('Failed to update interview status:', error);
      toast({ title: 'Failed to update interview status', variant: 'destructive' });
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [interviewId]: false }));
    }
  };

  const normalizeInterview = (i: any) => {
    if (i.scheduledDate !== undefined) {
      return {
        id: i.id,
        type: i.type || 'video',
        status: i.status || 'scheduled',
        scheduledDate: new Date(i.scheduledDate),
        duration: i.duration,
        location: i.location,
        meetingLink: i.meetingLink,
        recordingUrl: i.recordingUrl,
        interviewers: i.interviewers || [],
        feedback: i.feedback,
        notes: i.notes,
        rating: i.rating,
      };
    }
    return {
      id: i.id,
      type: i.type || 'VIDEO',
      status: i.status || 'SCHEDULED',
      scheduledDate: new Date(i.scheduled_date),
      duration: i.duration,
      location: undefined,
      meetingLink: i.meeting_link,
      recordingUrl: i.recording_url,
      interviewers: Array.isArray(i.interviewer_ids) ? i.interviewer_ids : [],
      feedback: i.feedback,
      notes: i.notes,
      rating: i.overall_score,
    };
  };

  const rawInterviews = scheduledInterviews.length > 0 ? scheduledInterviews : (applicationInterviews || []);
  const interviews = rawInterviews.map(normalizeInterview).sort((a, b) => b.scheduledDate.getTime() - a.scheduledDate.getTime());

  if (isLoadingInterviews) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (interviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-xs">
        <Calendar className="h-8 w-8 text-muted-foreground/50 mb-2" />
        <p className="font-medium text-muted-foreground">No interviews scheduled</p>
      </div>
    );
  }

  const upcomingParams = interviews.filter(i => (i.status === 'scheduled' || i.status === 'SCHEDULED') && isFuture(i.scheduledDate));
  const completedParams = interviews.filter(i => i.status === 'completed' || i.status === 'COMPLETED');

  const getInterviewIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t === 'phone') return <Phone className="h-3.5 w-3.5" />;
    if (t === 'video') return <Video className="h-3.5 w-3.5" />;
    if (t === 'onsite' || t === 'in_person') return <Building2 className="h-3.5 w-3.5" />;
    if (t === 'panel') return <Users className="h-3.5 w-3.5" />;
    return <Calendar className="h-3.5 w-3.5" />;
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'scheduled') return 'text-blue-600 bg-blue-50 border-blue-100';
    if (s === 'completed') return 'text-green-600 bg-green-50 border-green-100';
    if (s === 'cancelled') return 'text-gray-500 bg-gray-50 border-gray-100 line-through';
    if (s === 'no_show') return 'text-red-600 bg-red-50 border-red-100';
    return 'text-muted-foreground bg-muted border-border';
  };

  return (
    <div className="flex flex-col h-full space-y-2 py-2 overflow-hidden text-xs">
      {/* Stats Strip */}
      <div className="flex items-center gap-4 px-1 pb-2 border-b">
        <div className="flex items-center gap-1.5">
          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
            {interviews.length}
          </div>
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Total</span>
        </div>
        <div className="h-3 w-px bg-border" />
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
          <span className="font-bold text-foreground">{upcomingParams.length}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Upcoming</span>
        </div>
        <div className="h-3 w-px bg-border" />
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="font-bold text-foreground">{completedParams.length}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Done</span>
        </div>
      </div>

      {/* List */}
      <ScrollArea className="flex-1 -mx-2 px-2">
        <div className="space-y-1">
          {interviews.map((interview) => {
            const isExpanded = expandedRows[interview.id];
            const notes = notesMap[interview.id] || [];

            return (
              <div key={interview.id} className="border rounded-md bg-card transition-all hover:border-sidebar-accent hover:shadow-sm">
                {/* Row Header */}
                <div
                  className="flex items-center p-2 gap-3 cursor-pointer hover:bg-muted/30"
                  onClick={() => toggleRow(interview.id)}
                >
                  <div className={cn("p-1.5 rounded-md border", getStatusColor(interview.status))}>
                    {getInterviewIcon(interview.type)}
                  </div>

                  <div className="flex-1 min-w-0 grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-4">
                      <div className="font-semibold text-[11px] truncate flex items-center gap-2">
                        {format(interview.scheduledDate, 'MMM d, yyyy')}
                        {isToday(interview.scheduledDate) && <Badge variant="secondary" className="px-1 py-0 h-4 text-[9px] bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">TODAY</Badge>}
                      </div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(interview.scheduledDate, 'h:mm a')} • {interview.duration}m
                      </div>
                    </div>

                    <div className="col-span-3" onClick={(e) => e.stopPropagation()}>
                      <Select
                        value={String(interview.status).toUpperCase()}
                        onValueChange={(value) => handleStatusChange(interview.id, value as VideoInterview['status'])}
                        disabled={updatingStatus[interview.id]}
                      >
                        <SelectTrigger className="h-6 text-[10px] bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          <SelectItem value="NO_SHOW">No Show</SelectItem>
                          <SelectItem value="RESCHEDULED">Rescheduled</SelectItem>
                        </SelectContent>
                      </Select>
                      <Badge variant="outline" className={cn("mt-1 text-[9px] px-1 py-0 h-4 uppercase tracking-tighter w-fit", getStatusColor(interview.status))}>
                        {String(interview.status).replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="col-span-3">
                      <div className="flex -space-x-1.5">
                        {interview.interviewers.slice(0, 3).map((interviewer: any, idx: number) => {
                          const name = getInterviewerName(interviewer);
                          return (
                            <div key={idx} className="h-5 w-5 rounded-full ring-1 ring-background bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground" title={name}>
                              {getInitials(name)}
                            </div>
                          );
                        })}
                        {interview.interviewers.length > 3 && (
                          <div className="h-5 w-5 rounded-full ring-1 ring-background bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground">+{interview.interviewers.length - 3}</div>
                        )}
                      </div>
                    </div>

                    <div className="col-span-2 flex justify-end items-center gap-1">
                      {interview.meetingLink && (
                        <a
                          href={interview.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="h-5 w-5 rounded flex items-center justify-center hover:bg-primary/10 transition-colors"
                          title="Join Meeting"
                        >
                          <Video className="h-3 w-3 text-blue-600" />
                        </a>
                      )}
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t bg-muted/10 p-3 space-y-3 animation-in slide-in-from-top-1 duration-200">
                    {/* Actions Toolbar */}
                    <div className="flex items-center gap-2">
                      {interview.meetingLink && (
                        <>
                          <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1 bg-background" asChild>
                            <SafeExternalLink href={interview.meetingLink}>
                              <Video className="h-3 w-3" /> Join Meeting
                            </SafeExternalLink>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-[10px] gap-1 bg-background"
                            onClick={() => {
                              navigator.clipboard.writeText(interview.meetingLink);
                              toast({ title: 'Link copied to clipboard' });
                            }}
                          >
                            <Copy className="h-3 w-3" /> Copy Link
                          </Button>
                        </>
                      )}
                      {!interview.meetingLink && ['video', 'phone'].includes(interview.type.toLowerCase()) && (
                        <div className="flex items-center gap-1.5 text-[10px] text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-0.5">
                          <AlertCircle className="h-3 w-3 flex-shrink-0" />
                          <span>No Meet link — connect calendar to generate</span>
                        </div>
                      )}
                      {interview.recordingUrl && (
                        <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1 bg-background" asChild>
                          <SafeExternalLink href={interview.recordingUrl}>
                            <PlayCircle className="h-3 w-3" /> Recording
                          </SafeExternalLink>
                        </Button>
                      )}
                    </div>

                    {/* Notes Section */}
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <MessageSquare className="h-3 w-3" />
                        Notes & Feedback
                      </div>

                      {/* New Note Input */}
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Add a quick note..."
                          value={noteInputs[interview.id] || ''}
                          onChange={(e) => setNoteInputs(p => ({ ...p, [interview.id]: e.target.value }))}
                          className="h-8 min-h-[32px] py-1 text-[11px] resize-none flex-1 bg-background"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleAddNote(interview.id);
                            }
                          }}
                        />
                        <Button size="sm" className="h-8 w-8 p-0" onClick={() => handleAddNote(interview.id)} disabled={addingNoteFor[interview.id]}>
                          {addingNoteFor[interview.id] ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                        </Button>
                      </div>

                      {/* Notes List */}
                      <div className="space-y-1.5">
                        {loadingNotesFor[interview.id] ? (
                          <div className="py-2 flex justify-center"><Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" /></div>
                        ) : notes.length === 0 && !interview.notes ? (
                          <p className="text-[10px] text-muted-foreground italic pl-1">No notes yet.</p>
                        ) : (
                          <>
                            {interview.notes && (
                              <div className="flex gap-2 bg-background p-2 rounded border border-border/50">
                                <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-[8px] font-bold">SYS</div>
                                <div className="flex-1 text-[10px]">
                                  <p className="text-muted-foreground">{interview.notes}</p>
                                </div>
                              </div>
                            )}
                            {notes.map(note => (
                              <div key={note.id} className="flex gap-2 bg-background p-2 rounded border border-border/50 group">
                                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-[8px] font-bold text-primary">
                                  {getInitials(note.author_name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start">
                                    <span className="text-[10px] font-semibold">{note.author_name}</span>
                                    <div className="flex items-center gap-1">
                                      <span className="text-[9px] text-muted-foreground">{format(new Date(note.created_at), 'M/d h:mm a')}</span>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                                        onClick={() => handleDeleteNote(interview.id, note.id)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  <p className="text-[10px] mt-0.5 whitespace-pre-wrap">{note.content}</p>
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
