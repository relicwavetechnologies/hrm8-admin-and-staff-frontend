// @ts-nocheck
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg } from '@fullcalendar/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Video, Calendar as CalendarIcon, FileText, Link as LinkIcon, Loader2, Sparkles, BarChart3, Eye, MessageSquare, Send, Trash2, LayoutGrid, List, GripVertical } from 'lucide-react';
import { videoInterviewService, type VideoInterview } from '@/shared/lib/videoInterviewService';
import { applicationService } from '@/shared/lib/applicationService';
import { useToast } from '@/shared/hooks/use-toast';
import type { Job } from '@/shared/types/job';
import type { Application } from '@/shared/types/application';
import { CandidateAssessmentView } from '@/modules/jobs/components/candidate-assessment/CandidateAssessmentView';
import { FormDrawer } from '@/shared/components/ui/form-drawer';
import { ScheduleMeetingTab } from '@/modules/jobs/components/candidate-assessment/tabs/ScheduleMeetingTab';
import { apiClient } from '@/shared/lib/api';

interface JobAIInterviewsTabProps {
  job?: Job;
}

interface ScheduleCandidate {
  applicationId: string;
  candidateId?: string;
  candidateName: string;
  candidateEmail: string;
  assignedToName?: string;
}

interface CandidateLookupEntry {
  assignedToName?: string;
  applicationId: string;
}

interface InterviewNote {
  id: string;
  interview_id: string;
  author_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

interface KanbanColumnProps {
  id: VideoInterview['status'];
  label: string;
  count: number;
  children: ReactNode;
}

interface KanbanCardProps {
  interview: VideoInterview;
  candidateName: string;
  displayEmail: string;
  jobTitle: string;
  applicationId: string;
  assignedName: string;
  notePreview: string;
  onOpenProfile: (applicationId?: string) => void;
  onOpenNotes: (interview: VideoInterview, candidateName: string) => void;
  onGoToJob: (jobId: string) => void;
  resolveJobId: (interview: VideoInterview) => string;
}

const toNameFromEmail = (email?: string) => {
  if (!email) return 'Unknown Candidate';
  const local = email.split('@')[0] || '';
  const cleaned = local.replace(/[._-]+/g, ' ').trim();
  if (!cleaned) return 'Unknown Candidate';
  return cleaned
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const statusBadgeClass = (status: VideoInterview['status']) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
    case 'IN_PROGRESS':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
    case 'SCHEDULED':
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
    case 'CANCELLED':
    case 'NO_SHOW':
      return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-800';
  }
};

const getAssignedName = (obj: any): string => {
  if (!obj) return '';
  const name = (
    obj.assignedToName ||
    obj.assigned_to_name ||
    obj.assignee_name ||
    obj.assignedUserName ||
    obj.assignedRecruiterName ||
    obj.recruiterName ||
    obj.assignedTo?.name ||
    obj.assignee?.name ||
    obj.recruiter?.name ||
    ''
  );
  if (name) return String(name);

  const idLike =
    obj.assignedTo ||
    obj.assigned_to ||
    obj.assigneeId ||
    obj.assignee_id ||
    obj.assignedUserId ||
    obj.assignedRecruiterId ||
    obj.recruiterId ||
    obj.assignee?.id ||
    obj.assignedTo?.id ||
    '';

  if (idLike) return String(idLike);
  return '';
};

function WeeklyInterviewBars({ data }: { data: Array<{ label: string; scheduled: number; completed: number }> }) {
  const max = Math.max(...data.flatMap((item) => [item.scheduled, item.completed]), 1);

  return (
    <div className="space-y-1.5">
      {data.map((item) => (
        <div key={item.label} className="grid grid-cols-[34px_1fr] items-center gap-2">
          <span className="text-[10px] text-muted-foreground">{item.label}</span>
          <div className="space-y-1">
            <div className="h-2 rounded bg-blue-100 dark:bg-blue-900/30 overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: `${(item.scheduled / max) * 100}%` }} />
            </div>
            <div className="h-2 rounded bg-emerald-100 dark:bg-emerald-900/30 overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${(item.completed / max) * 100}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const columnTheme: Record<VideoInterview['status'], string> = {
  SCHEDULED: 'bg-gradient-to-b from-blue-50/80 to-blue-50/30 border-blue-200/70 dark:from-blue-900/20 dark:to-blue-900/10 dark:border-blue-800/70',
  IN_PROGRESS: 'bg-gradient-to-b from-amber-50/80 to-amber-50/30 border-amber-200/70 dark:from-amber-900/20 dark:to-amber-900/10 dark:border-amber-800/70',
  COMPLETED: 'bg-gradient-to-b from-emerald-50/80 to-emerald-50/30 border-emerald-200/70 dark:from-emerald-900/20 dark:to-emerald-900/10 dark:border-emerald-800/70',
  CANCELLED: 'bg-gradient-to-b from-rose-50/80 to-rose-50/30 border-rose-200/70 dark:from-rose-900/20 dark:to-rose-900/10 dark:border-rose-800/70',
  NO_SHOW: 'bg-gradient-to-b from-orange-50/80 to-orange-50/30 border-orange-200/70 dark:from-orange-900/20 dark:to-orange-900/10 dark:border-orange-800/70',
  RESCHEDULED: 'bg-gradient-to-b from-violet-50/80 to-violet-50/30 border-violet-200/70 dark:from-violet-900/20 dark:to-violet-900/10 dark:border-violet-800/70',
};

function KanbanColumn({ id, label, count, children }: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl border ${columnTheme[id]} transition-all duration-150 ${
        isOver ? 'ring-2 ring-primary/40 shadow-sm' : ''
      }`}
    >
      <div className="border-b border-border/60 px-3 py-2.5 flex items-center justify-between">
        <p className="text-xs font-semibold">{label}</p>
        <Badge variant="outline" className="text-[10px] h-5 px-1.5">
          {count}
        </Badge>
      </div>
      <div className="max-h-[640px] overflow-auto p-2 space-y-2">{children}</div>
    </div>
  );
}

function KanbanCard({
  interview,
  candidateName,
  displayEmail,
  jobTitle,
  applicationId,
  assignedName,
  notePreview,
  onOpenProfile,
  onOpenNotes,
  onGoToJob,
  resolveJobId,
}: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: interview.id,
    data: { status: interview.status },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const resolvedJobId = resolveJobId(interview);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border bg-background/95 p-2.5 shadow-sm transition-all duration-150 ${
        isDragging ? 'opacity-80 shadow-md scale-[1.01] z-10' : 'hover:shadow'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium truncate">{candidateName}</p>
          <p className="text-[11px] text-muted-foreground truncate">{displayEmail}</p>
          <p className="text-[11px] text-muted-foreground truncate">{jobTitle}</p>
        </div>
        <button
          type="button"
          className="h-6 w-6 shrink-0 rounded border bg-muted/30 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
          {...listeners}
          {...attributes}
          aria-label="Drag interview"
        >
          <GripVertical className="h-3.5 w-3.5 mx-auto" />
        </button>
      </div>
      <p className="text-[11px] text-muted-foreground mt-2">
        {format(new Date(interview.scheduledDate), 'PPp')} • {interview.duration}m
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1">
        <Badge variant="outline" className="text-[10px] h-5 px-1.5">{interview.type.replace('_', ' ')}</Badge>
        <Badge variant="outline" className={`text-[10px] h-5 px-1.5 ${statusBadgeClass(interview.status)}`}>{interview.status.replace('_', ' ')}</Badge>
        <Badge variant="outline" className="text-[10px] h-5 px-1.5">{assignedName || 'Unassigned'}</Badge>
      </div>
      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{notePreview || 'No notes yet'}</p>
      <div className="flex flex-wrap gap-1 mt-2">
        <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px]" onClick={() => onOpenProfile(applicationId)} disabled={!applicationId}>
          <Eye className="mr-1 h-3 w-3" />
          Profile
        </Button>
        <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px]" onClick={() => onOpenNotes(interview, candidateName)}>
          <MessageSquare className="mr-1 h-3 w-3" />
          Notes
        </Button>
        {!!resolvedJobId && (
          <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px]" onClick={() => onGoToJob(resolvedJobId)}>
            Go to Job
          </Button>
        )}
      </div>
    </div>
  );
}

export function JobAIInterviewsTab({ job }: JobAIInterviewsTabProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isGlobalMode = !job?.id;

  const [interviews, setInterviews] = useState<VideoInterview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>({});

  const [candidates, setCandidates] = useState<ScheduleCandidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [openAssessment, setOpenAssessment] = useState(false);
  const [loadingProfileId, setLoadingProfileId] = useState<string | null>(null);

  const [scheduleDrawerOpen, setScheduleDrawerOpen] = useState(false);
  const [scheduleApplicationId, setScheduleApplicationId] = useState('');
  const [scheduleApplication, setScheduleApplication] = useState<Application | null>(null);
  const [loadingScheduleApplication, setLoadingScheduleApplication] = useState(false);
  const [applicationLookup, setApplicationLookup] = useState<Record<string, Application>>({});
  const [candidateLookupByAppId, setCandidateLookupByAppId] = useState<Record<string, CandidateLookupEntry>>({});
  const [candidateLookupByCandidateId, setCandidateLookupByCandidateId] = useState<Record<string, CandidateLookupEntry>>({});
  const [candidateLookupByEmail, setCandidateLookupByEmail] = useState<Record<string, CandidateLookupEntry>>({});
  const [resolvedAssignedByAppId, setResolvedAssignedByAppId] = useState<Record<string, string>>({});
  const [loadingAssignedByAppId, setLoadingAssignedByAppId] = useState<Record<string, boolean>>({});

  const [notesDrawerOpen, setNotesDrawerOpen] = useState(false);
  const [notesTarget, setNotesTarget] = useState<{ interviewId: string; applicationId: string; candidateName: string } | null>(null);
  const [interviewNotes, setInterviewNotes] = useState<InterviewNote[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [tableNotePreviewMap, setTableNotePreviewMap] = useState<Record<string, { latest: string; count: number }>>({});
  const [loadingTableNotes, setLoadingTableNotes] = useState<Record<string, boolean>>({});
  const [noteInput, setNoteInput] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'board' | 'calendar'>('table');
  const [calendarDetail, setCalendarDetail] = useState<VideoInterview | null>(null);
  const [calendarDetailOpen, setCalendarDetailOpen] = useState(false);
  const [calendarNoteInput, setCalendarNoteInput] = useState('');
  const [isAddingCalendarNote, setIsAddingCalendarNote] = useState(false);
  const [activeDragInterviewId, setActiveDragInterviewId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  const loadApplicationDetails = async (applicationId: string): Promise<Application | null> => {
    const mapFromResponse = (full: any): Application => ({
      ...full,
      candidateName:
        full.candidate?.firstName && full.candidate?.lastName
          ? `${full.candidate.firstName} ${full.candidate.lastName}`
          : full.candidate?.firstName || full.candidateName,
      candidateEmail: full.candidate?.email || full.candidateEmail,
      candidatePhone: full.candidate?.phone || full.candidatePhone,
      candidatePhoto: full.candidate?.photo || full.candidatePhoto,
      activities: full.activities || [],
      notes: full.notes || [],
      interviews: full.interviews || [],
      teamReviews: full.teamReviews || [],
      evaluations: full.evaluations || [],
      aiAnalysis: full.aiAnalysis,
      assignedToName: getAssignedName(full) || (full as any).assignedToName,
    });

    try {
      const primary = await applicationService.getApplication(applicationId);
      if (primary.success && primary.data?.application) {
        return mapFromResponse(primary.data.application);
      }
    } catch {
      // fallback below
    }

    try {
      const fallback = await applicationService.getApplicationForAdmin(applicationId);
      if (fallback.success && fallback.data?.application) {
        return mapFromResponse(fallback.data.application);
      }
    } catch {
      // ignore
    }

    return null;
  };

  useEffect(() => {
    loadInterviews();
    loadCandidates();
  }, [job?.id]);

  useEffect(() => {
    if (!scheduleDrawerOpen || !scheduleApplicationId) return;

    const loadScheduleApplication = async () => {
      const localApp = applicationLookup[scheduleApplicationId];
      if (localApp) {
        setScheduleApplication(localApp);
      }

      setLoadingScheduleApplication(true);
      try {
        const mapped = await loadApplicationDetails(scheduleApplicationId);
        if (mapped) setScheduleApplication(mapped);
        else if (!localApp) setScheduleApplication(null);
      } catch (error) {
        console.error('Failed to load application for scheduling:', error);
        if (!localApp) setScheduleApplication(null);
      } finally {
        setLoadingScheduleApplication(false);
      }
    };

    loadScheduleApplication();
  }, [scheduleDrawerOpen, scheduleApplicationId, applicationLookup]);

  const loadInterviews = async () => {
    setIsLoading(true);
    try {
      const response = isGlobalMode
        ? await videoInterviewService.getInterviews()
        : await videoInterviewService.getJobInterviews(job!.id);
      if (response.success && response.data) {
        setInterviews(response.data.interviews || []);
      } else {
        toast({ title: 'Error', description: 'Failed to load interviews', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Failed to load interviews:', error);
      toast({ title: 'Error', description: 'Failed to load interviews', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCandidates = async () => {
    setLoadingCandidates(true);
    try {
      let applicationList: any[] = [];
      if (isGlobalMode) {
        const response = await applicationService.getCompanyApplications();
        if (response.success && response.data?.applications) {
          applicationList = response.data.applications;
        }
      } else {
        const response = await applicationService.getJobApplications(job!.id);
        if (!response.success || !response.data?.applications) return;
        applicationList = response.data.applications;
      }

      if (!applicationList.length) {
        setCandidates([]);
        setApplicationLookup({});
        setCandidateLookupByAppId({});
        setCandidateLookupByCandidateId({});
        setCandidateLookupByEmail({});
        return;
      }

      const lookup: Record<string, Application> = {};
      const byAppId: Record<string, CandidateLookupEntry> = {};
      const byCandidateId: Record<string, CandidateLookupEntry> = {};
      const byEmail: Record<string, CandidateLookupEntry> = {};
      const mapped = applicationList
        .map((app: any) => {
          const rawCandidateEmail = app.candidate?.email || app.candidateEmail || '';
          const firstName = app.candidate?.firstName || '';
          const lastName = app.candidate?.lastName || '';
          const candidateName = `${firstName} ${lastName}`.trim() || app.candidateName || toNameFromEmail(rawCandidateEmail);
          const candidateEmail = rawCandidateEmail || 'No email';
          const normalizedApp: Application = {
            ...(app as Application),
            id: app.id,
            jobId: app.jobId || app.job?.id || '',
            jobTitle: app.jobTitle || app.job?.title || '',
            candidateId: app.candidateId || app.candidate?.id,
            candidateName,
            candidateEmail,
            assignedToName: getAssignedName(app) || (app as any).assignedToName,
            activities: app.activities || [],
            interviews: app.interviews || [],
            notes: app.notes || [],
          };
          lookup[app.id] = normalizedApp;
          const assignedToName = getAssignedName(app);
          const entry: CandidateLookupEntry = {
            assignedToName,
            applicationId: app.id,
          };
          byAppId[app.id] = entry;
          if (app.candidateId || app.candidate?.id) {
            byCandidateId[app.candidateId || app.candidate?.id] = entry;
          }
          if (rawCandidateEmail) {
            byEmail[String(rawCandidateEmail).toLowerCase()] = entry;
          }

          return {
            applicationId: app.id,
            candidateId: app.candidateId || app.candidate?.id,
            candidateName,
            candidateEmail,
            assignedToName,
          };
        })
        .filter((item: ScheduleCandidate) => Boolean(item.applicationId));

      setCandidates(mapped);
      setApplicationLookup(lookup);
      setCandidateLookupByAppId(byAppId);
      setCandidateLookupByCandidateId(byCandidateId);
      setCandidateLookupByEmail(byEmail);
      if (!scheduleApplicationId && mapped[0]?.applicationId) {
        setScheduleApplicationId(mapped[0].applicationId);
      }
    } catch (error) {
      console.error('Failed to load candidates:', error);
    } finally {
      setLoadingCandidates(false);
    }
  };

  const stats = useMemo(() => {
    const scheduled = interviews.filter((i) => i.status === 'SCHEDULED').length;
    const inProgress = interviews.filter((i) => i.status === 'IN_PROGRESS').length;
    const completed = interviews.filter((i) => i.status === 'COMPLETED').length;
    const averageDuration = interviews.length
      ? Math.round(interviews.reduce((sum, i) => sum + (i.duration || 0), 0) / interviews.length)
      : 0;
    return { total: interviews.length, scheduled, inProgress, completed, averageDuration };
  }, [interviews]);

  const weeklyBreakdown = useMemo(() => {
    const now = new Date();
    const buckets = Array.from({ length: 6 }, (_, index) => ({
      label: `W${index + 1}`,
      scheduled: 0,
      completed: 0,
    }));

    interviews.forEach((interview) => {
      const dayDiff = Math.floor((now.getTime() - new Date(interview.scheduledDate).getTime()) / (1000 * 60 * 60 * 24));
      if (dayDiff >= 0 && dayDiff < 42) {
        const weekIndex = 5 - Math.floor(dayDiff / 7);
        if (weekIndex >= 0 && weekIndex < 6) {
          buckets[weekIndex].scheduled += 1;
          if (interview.status === 'COMPLETED') {
            buckets[weekIndex].completed += 1;
          }
        }
      }
    });

    return buckets;
  }, [interviews]);

  const typeDistribution = useMemo(() => {
    const total = Math.max(interviews.length, 1);
    const groups = [
      { key: 'VIDEO', label: 'Video', value: interviews.filter((i) => i.type === 'VIDEO').length, color: 'bg-blue-500' },
      { key: 'PHONE', label: 'Phone', value: interviews.filter((i) => i.type === 'PHONE').length, color: 'bg-violet-500' },
      { key: 'IN_PERSON', label: 'In Person', value: interviews.filter((i) => i.type === 'IN_PERSON').length, color: 'bg-emerald-500' },
    ];

    return groups.map((item) => ({
      ...item,
      percent: Math.round((item.value / total) * 100),
    }));
  }, [interviews]);

  const sortedInterviews = useMemo(() => {
    return [...interviews].sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
  }, [interviews]);

  const getInterviewJobId = (interview: VideoInterview): string => {
    return interview.jobId || interview.job?.id || applicationLookup[resolveApplicationId(interview)]?.jobId || '';
  };

  const getInterviewJobTitle = (interview: VideoInterview): string => {
    return (
      interview.job?.title ||
      interview.application?.jobTitle ||
      applicationLookup[resolveApplicationId(interview)]?.jobTitle ||
      'Job'
    );
  };

  const boardColumns: Array<{ key: VideoInterview['status']; label: string }> = [
    { key: 'SCHEDULED', label: 'Scheduled' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'RESCHEDULED', label: 'Rescheduled' },
    { key: 'CANCELLED', label: 'Cancelled' },
    { key: 'NO_SHOW', label: 'No Show' },
  ];

  const calendarEvents = useMemo(
    () =>
      sortedInterviews.map((interview) => {
        const start = new Date(interview.scheduledDate);
        const end = new Date(start.getTime() + (interview.duration || 45) * 60 * 1000);
        const candidateName =
          interview.application?.candidateName ||
          (interview.candidate ? `${interview.candidate.firstName || ''} ${interview.candidate.lastName || ''}`.trim() : '') ||
          toNameFromEmail(interview.candidate?.email);
        return {
          id: interview.id,
          title: `${candidateName} • ${getInterviewJobTitle(interview)}`,
          start: start.toISOString(),
          end: end.toISOString(),
          extendedProps: {
            interview,
          },
        };
      }),
    [sortedInterviews, applicationLookup]
  );

  function resolveApplicationId(interview: VideoInterview) {
    if (interview.applicationId) return interview.applicationId;

    if (interview.candidateId) {
      const byCandidateId = Object.values(applicationLookup).find((app) => app.candidateId === interview.candidateId);
      if (byCandidateId?.id) return byCandidateId.id;
    }

    const candidateEmail = interview.candidate?.email;
    if (candidateEmail) {
      const byEmail = Object.values(applicationLookup).find(
        (app) => String(app.candidateEmail || app.email || '').toLowerCase() === candidateEmail.toLowerCase()
      );
      if (byEmail?.id) return byEmail.id;
    }

    return '';
  }

  const resolveAssignedToName = (applicationId?: string) => {
    if (!applicationId) return 'Unassigned';
    const resolved = resolvedAssignedByAppId[applicationId] || '';
    if (resolved) return resolved;
    const fromCandidateLookup = candidateLookupByAppId[applicationId]?.assignedToName || '';
    if (fromCandidateLookup) return fromCandidateLookup;
    const app = applicationLookup[applicationId];
    const assignedName = getAssignedName(app);
    return assignedName || 'Unassigned';
  };

  const resolveAssignedToNameForInterview = (interview: VideoInterview, applicationId: string) => {
    const byApp = resolveAssignedToName(applicationId);
    if (byApp !== 'Unassigned') return byApp;

    if (interview.candidateId && candidateLookupByCandidateId[interview.candidateId]?.assignedToName) {
      return candidateLookupByCandidateId[interview.candidateId].assignedToName || 'Unassigned';
    }

    const email = String(interview.candidate?.email || '').toLowerCase();
    if (email && candidateLookupByEmail[email]?.assignedToName) {
      return candidateLookupByEmail[email].assignedToName || 'Unassigned';
    }

    return 'Unassigned';
  };

  useEffect(() => {
    const unresolvedAppIds = Array.from(
      new Set(
        interviews
          .map((interview) => resolveApplicationId(interview))
          .filter((appId) => Boolean(appId))
          .filter((appId) => resolveAssignedToName(appId) === 'Unassigned')
          .filter((appId) => !loadingAssignedByAppId[appId])
      )
    );

    if (unresolvedAppIds.length === 0) return;

    unresolvedAppIds.forEach(async (appId) => {
      setLoadingAssignedByAppId((prev) => ({ ...prev, [appId]: true }));
      try {
        const details = await loadApplicationDetails(appId);
        const assigned = getAssignedName(details);
        if (assigned) {
          setResolvedAssignedByAppId((prev) => ({ ...prev, [appId]: assigned }));
        }
      } catch {
        // ignore
      } finally {
        setLoadingAssignedByAppId((prev) => ({ ...prev, [appId]: false }));
      }
    });
  }, [interviews, applicationLookup, candidateLookupByAppId, candidateLookupByCandidateId, candidateLookupByEmail, resolvedAssignedByAppId, loadingAssignedByAppId]);

  useEffect(() => {
    const targets = interviews.filter((interview) => {
      const applicationId = resolveApplicationId(interview);
      return Boolean(applicationId) && !tableNotePreviewMap[interview.id] && !loadingTableNotes[interview.id];
    });

    if (targets.length === 0) return;

    targets.forEach(async (interview) => {
      const applicationId = resolveApplicationId(interview);
      if (!applicationId) return;

      setLoadingTableNotes((prev) => ({ ...prev, [interview.id]: true }));
      try {
        const response = await apiClient.get<{ notes: InterviewNote[] }>(
          `/api/applications/${applicationId}/interviews/${interview.id}/notes`
        );
        if (response.success && response.data?.notes) {
          const sorted = [...response.data.notes].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setTableNotePreviewMap((prev) => ({
            ...prev,
            [interview.id]: {
              latest: sorted[0]?.content || '',
              count: sorted.length,
            },
          }));
        } else {
          setTableNotePreviewMap((prev) => ({
            ...prev,
            [interview.id]: {
              latest: '',
              count: 0,
            },
          }));
        }
      } catch {
        setTableNotePreviewMap((prev) => ({
          ...prev,
          [interview.id]: {
            latest: '',
            count: 0,
          },
        }));
      } finally {
        setLoadingTableNotes((prev) => ({ ...prev, [interview.id]: false }));
      }
    });
  }, [interviews, applicationLookup, tableNotePreviewMap, loadingTableNotes]);

  const handleStatusChange = async (interview: VideoInterview, newStatus: VideoInterview['status']) => {
    setUpdatingStatus((prev) => ({ ...prev, [interview.id]: true }));
    try {
      const response = await videoInterviewService.updateStatus(interview.id, newStatus);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update interview status');
      }
      setInterviews((prev) => prev.map((item) => (item.id === interview.id ? { ...item, status: newStatus } : item)));
      toast({ title: 'Status updated', description: `Interview marked as ${newStatus.replace('_', ' ').toLowerCase()}` });
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to update status', variant: 'destructive' });
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [interview.id]: false }));
    }
  };

  const handleBoardDragStart = (event: DragStartEvent) => {
    setActiveDragInterviewId(String(event.active.id));
  };

  const handleBoardDragEnd = async (event: DragEndEvent) => {
    setActiveDragInterviewId(null);
    const interviewId = String(event.active.id);
    const targetStatus = event.over?.id as VideoInterview['status'] | undefined;
    if (!targetStatus) return;

    const current = interviews.find((item) => item.id === interviewId);
    if (!current || current.status === targetStatus) return;

    const previousStatus = current.status;
    setInterviews((prev) => prev.map((item) => (item.id === interviewId ? { ...item, status: targetStatus } : item)));

    try {
      const response = await videoInterviewService.updateStatus(interviewId, targetStatus);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update interview status');
      }
      toast({ title: 'Status updated', description: `Interview moved to ${targetStatus.replace('_', ' ').toLowerCase()}` });
    } catch (error) {
      setInterviews((prev) => prev.map((item) => (item.id === interviewId ? { ...item, status: previousStatus } : item)));
      toast({
        title: 'Failed to move interview',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleOpenProfile = async (applicationId?: string) => {
    if (!applicationId) {
      toast({ title: 'Profile unavailable', description: 'Application is missing for this interview', variant: 'destructive' });
      return;
    }

    const localApp = applicationLookup[applicationId];
    if (localApp) {
      setSelectedApplication(localApp);
      setOpenAssessment(true);
    }

    setLoadingProfileId(applicationId);
    try {
      const mappedApplication = await loadApplicationDetails(applicationId);
      if (mappedApplication) {
        setSelectedApplication(mappedApplication);
        setOpenAssessment(true);
      } else {
        if (!localApp) {
          throw new Error('Could not load profile');
        }
      }
    } catch (error) {
      if (!localApp) {
        toast({
          title: 'Failed to open profile',
          description: error instanceof Error ? error.message : 'Could not load candidate profile',
          variant: 'destructive',
        });
      }
    } finally {
      setLoadingProfileId(null);
    }
  };

  const loadInterviewNotes = async (applicationId: string, interviewId: string) => {
    setIsLoadingNotes(true);
    try {
      const response = await apiClient.get<{ notes: InterviewNote[] }>(
        `/api/applications/${applicationId}/interviews/${interviewId}/notes`
      );
      if (response.success && response.data?.notes) {
        setInterviewNotes(response.data.notes);
      } else {
        setInterviewNotes([]);
      }
    } catch (error) {
      console.error('Failed to load interview notes:', error);
      setInterviewNotes([]);
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const handleOpenNotes = (interview: VideoInterview, candidateName: string) => {
    const applicationId = resolveApplicationId(interview);
    if (!applicationId) {
      toast({ title: 'Notes unavailable', description: 'Application could not be resolved for this interview', variant: 'destructive' });
      return;
    }
    setNotesTarget({ interviewId: interview.id, applicationId, candidateName });
    setNotesDrawerOpen(true);
    setNoteInput('');
    loadInterviewNotes(applicationId, interview.id);
  };

  const handleCalendarEventClick = (event: EventClickArg) => {
    const interview = event.event.extendedProps.interview as VideoInterview;
    if (!interview) return;
    setCalendarDetail(interview);
    const applicationId = resolveApplicationId(interview);
    const candidateName =
      interview.application?.candidateName ||
      (interview.candidate ? `${interview.candidate.firstName || ''} ${interview.candidate.lastName || ''}`.trim() : '') ||
      toNameFromEmail(interview.candidate?.email);
    if (applicationId) {
      setNotesTarget({ interviewId: interview.id, applicationId, candidateName });
      loadInterviewNotes(applicationId, interview.id);
    } else {
      setNotesTarget(null);
      setInterviewNotes([]);
    }
    setCalendarNoteInput('');
    setCalendarDetailOpen(true);
  };

  const handleAddCalendarNote = async () => {
    if (!notesTarget || !calendarNoteInput.trim()) return;
    setIsAddingCalendarNote(true);
    try {
      const response = await apiClient.post<{ note: InterviewNote }>(
        `/api/applications/${notesTarget.applicationId}/interviews/${notesTarget.interviewId}/notes`,
        { content: calendarNoteInput.trim() }
      );
      if (!response.success || !response.data?.note) throw new Error(response.error || 'Failed to add note');
      setInterviewNotes((prev) => [response.data!.note, ...prev]);
      setTableNotePreviewMap((prev) => ({
        ...prev,
        [notesTarget.interviewId]: {
          latest: response.data!.note.content,
          count: (prev[notesTarget.interviewId]?.count || 0) + 1,
        },
      }));
      setCalendarNoteInput('');
      toast({ title: 'Note added' });
    } catch (error) {
      toast({ title: 'Failed to add note', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setIsAddingCalendarNote(false);
    }
  };

  const handleAddNote = async () => {
    if (!notesTarget) return;
    const content = noteInput.trim();
    if (!content) return;

    setIsAddingNote(true);
    try {
      const response = await apiClient.post<{ note: InterviewNote }>(
        `/api/applications/${notesTarget.applicationId}/interviews/${notesTarget.interviewId}/notes`,
        { content }
      );
      if (!response.success || !response.data?.note) {
        throw new Error(response.error || 'Failed to add note');
      }
      setInterviewNotes((prev) => [response.data!.note, ...prev]);
      setTableNotePreviewMap((prev) => ({
        ...prev,
        [notesTarget.interviewId]: {
          latest: response.data!.note.content,
          count: (prev[notesTarget.interviewId]?.count || 0) + 1,
        },
      }));
      setNoteInput('');
      toast({ title: 'Note added' });
      loadInterviews();
    } catch (error) {
      toast({ title: 'Failed to add note', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!notesTarget) return;
    setDeletingNoteId(noteId);
    try {
      await apiClient.delete(
        `/api/applications/${notesTarget.applicationId}/interviews/${notesTarget.interviewId}/notes/${noteId}`
      );
      setInterviewNotes((prev) => prev.filter((note) => note.id !== noteId));
      setTableNotePreviewMap((prev) => {
        const nextCount = Math.max((prev[notesTarget.interviewId]?.count || 1) - 1, 0);
        const nextLatest = interviewNotes.find((note) => note.id !== noteId)?.content || '';
        return {
          ...prev,
          [notesTarget.interviewId]: {
            latest: nextLatest,
            count: nextCount,
          },
        };
      });
      toast({ title: 'Note deleted' });
      loadInterviews();
    } catch {
      toast({ title: 'Failed to delete note', variant: 'destructive' });
    } finally {
      setDeletingNoteId(null);
    }
  };

  return (
    <div className="space-y-3">
      <Card className="border-border/80 shadow-none">
        <CardHeader className="px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-semibold">Interviews</CardTitle>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {isGlobalMode
                  ? 'All interviews across jobs with board, calendar, and table operations.'
                  : 'Compact interview operations with scheduling, status updates, notes, and artifacts.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-[11px]">Total {stats.total}</Badge>
              <Badge variant="outline" className="text-[11px]">Scheduled {stats.scheduled}</Badge>
              <Badge variant="outline" className="text-[11px]">Completed {stats.completed}</Badge>
              <Badge variant="outline" className="text-[11px]">Avg {stats.averageDuration} min</Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4 pb-3 pt-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'table' | 'board' | 'calendar')}>
              <TabsList className="h-8">
                <TabsTrigger value="board" className="text-xs h-7">
                  <LayoutGrid className="h-3.5 w-3.5 mr-1.5" />
                  Board
                </TabsTrigger>
                <TabsTrigger value="calendar" className="text-xs h-7">
                  <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                  Calendar
                </TabsTrigger>
                <TabsTrigger value="table" className="text-xs h-7">
                  <List className="h-3.5 w-3.5 mr-1.5" />
                  Table
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                const targetApplicationId = scheduleApplicationId || candidates[0]?.applicationId || '';
                if (targetApplicationId) {
                  setScheduleApplicationId(targetApplicationId);
                  if (applicationLookup[targetApplicationId]) {
                    setScheduleApplication(applicationLookup[targetApplicationId]);
                  }
                }
                setScheduleDrawerOpen(true);
              }}
              disabled={loadingCandidates || candidates.length === 0}
            >
              <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
              Schedule Interview
            </Button>
          </div>
        </CardContent>
      </Card>

      {viewMode === 'table' && (
      <>
      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="border-border/80 shadow-none">
          <CardHeader className="px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-medium text-foreground">
              <BarChart3 className="h-3.5 w-3.5" />
              Interview Volume Trend
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0">
            <WeeklyInterviewBars data={weeklyBreakdown} />
            <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" />Scheduled</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Completed</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-none">
          <CardHeader className="px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-medium text-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              Interview Type Mix
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0 space-y-2">
            <div className="space-y-2.5">
              {typeDistribution.map((item) => (
                <div key={item.key} className="grid grid-cols-[70px_1fr_38px] items-center gap-2 text-[10px]">
                  <span className="text-muted-foreground">{item.label}</span>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                  </div>
                  <span className="text-right font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border border-border/80 bg-background overflow-hidden">
        <div className="h-[560px] overflow-auto">
          <Table className="text-xs min-w-[1060px]">
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="h-9 px-3">Candidate</TableHead>
                <TableHead className="h-9 px-3">Assigned</TableHead>
                <TableHead className="h-9 px-3">Date & Time</TableHead>
                <TableHead className="h-9 px-3">Type</TableHead>
                <TableHead className="h-9 px-3">Duration</TableHead>
                <TableHead className="h-9 px-3">Status</TableHead>
                <TableHead className="h-9 px-3">Notes</TableHead>
                <TableHead className="h-9 px-3">Artifacts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                    Loading interviews...
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && sortedInterviews.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                    <Video className="h-8 w-8 mx-auto mb-2 opacity-60" />
                    No interviews scheduled yet.
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && sortedInterviews.map((interview) => {
                const candidateEmail = interview.candidate?.email || '';
                const resolvedCandidateName =
                  interview.application?.candidateName ||
                  (interview.candidate ? `${interview.candidate.firstName || ''} ${interview.candidate.lastName || ''}`.trim() : '');
                const candidateName = resolvedCandidateName || toNameFromEmail(candidateEmail);
                const displayEmail = candidateEmail || 'No email';
                const feedbackCount = (interview.interviewFeedbacks?.length || 0) + (interview.feedback?.length || 0);
                const applicationId = resolveApplicationId(interview);

                return (
                  <TableRow key={interview.id}>
                    <TableCell className="px-3 py-2.5 min-w-[220px]">
                      <p className="font-medium text-foreground truncate">{candidateName}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{displayEmail}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{getInterviewJobTitle(interview)}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-1.5 mt-1 text-[10px] text-primary"
                        onClick={() => handleOpenProfile(applicationId)}
                        disabled={!applicationId || loadingProfileId === applicationId}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        {loadingProfileId === applicationId ? 'Loading...' : 'View Profile'}
                      </Button>
                      {!!getInterviewJobId(interview) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-1.5 mt-0.5 text-[10px] text-primary"
                          onClick={() => navigate(`/ats/jobs/${getInterviewJobId(interview)}`)}
                        >
                          Go to Job
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="px-3 py-2.5 min-w-[120px]">
                      <Badge variant="outline" className="text-[10px]">
                        {resolveAssignedToNameForInterview(interview, applicationId)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-3 py-2.5 whitespace-nowrap text-[11px]">
                      {format(new Date(interview.scheduledDate), 'PPp')}
                    </TableCell>
                    <TableCell className="px-3 py-2.5">
                      <Badge variant="outline" className="text-[10px]">{interview.type.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-[11px]">{interview.duration} min</TableCell>
                    <TableCell className="px-3 py-2.5 min-w-[170px]">
                      <Select
                        value={interview.status}
                        onValueChange={(value) => handleStatusChange(interview, value as VideoInterview['status'])}
                        disabled={updatingStatus[interview.id]}
                      >
                        <SelectTrigger className="h-7 text-[10px]">
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
                      <Badge variant="outline" className={`mt-1 text-[10px] ${statusBadgeClass(interview.status)}`}>
                        {interview.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-3 py-2.5 max-w-[260px]">
                      {loadingTableNotes[interview.id] ? (
                        <p className="text-[11px] text-muted-foreground">Loading notes...</p>
                      ) : (
                      <p className="text-[11px] text-muted-foreground line-clamp-2">
                        {tableNotePreviewMap[interview.id]?.latest
                          || interview.notes
                          || interview.interviewFeedbacks?.[0]?.notes
                          || interview.feedback?.[0]?.notes
                          || 'No notes'}
                      </p>
                      )}
                      {(tableNotePreviewMap[interview.id]?.count || 0) > 0 && (
                        <Badge variant="secondary" className="mt-1 text-[10px]">
                          {tableNotePreviewMap[interview.id].count} notes
                        </Badge>
                      )}
                      {feedbackCount > 0 && (
                        <Badge variant="secondary" className="mt-1 text-[10px]">{feedbackCount} feedback</Badge>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-1.5 mt-1 text-[10px] text-primary"
                        onClick={() => handleOpenNotes(interview, candidateName)}
                      >
                        <MessageSquare className="mr-1 h-3 w-3" />
                        Add Note
                      </Button>
                    </TableCell>
                    <TableCell className="px-3 py-2.5 min-w-[170px]">
                      <div className="flex flex-wrap gap-1">
                        {interview.recordingUrl && (
                          <Badge variant="outline" className="text-[10px]">
                            <Video className="h-3 w-3 mr-1" />
                            Recording
                          </Badge>
                        )}
                        {interview.transcript && (
                          <Badge variant="outline" className="text-[10px]">
                            <FileText className="h-3 w-3 mr-1" />
                            Transcript
                          </Badge>
                        )}
                        {interview.meetingLink && (
                          <Badge variant="outline" className="text-[10px]">
                            <LinkIcon className="h-3 w-3 mr-1" />
                            Link
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
      </>
      )}

      {viewMode === 'board' && (
        <DndContext sensors={sensors} onDragStart={handleBoardDragStart} onDragEnd={handleBoardDragEnd}>
          <div className="grid gap-3 lg:grid-cols-5">
            {boardColumns.map((column) => (
              <KanbanColumn
                key={column.key}
                id={column.key}
                label={column.label}
                count={sortedInterviews.filter((item) => item.status === column.key).length}
              >
                {sortedInterviews
                  .filter((item) => item.status === column.key)
                  .map((interview) => {
                    const applicationId = resolveApplicationId(interview);
                    const candidateName =
                      interview.application?.candidateName ||
                      (interview.candidate ? `${interview.candidate.firstName || ''} ${interview.candidate.lastName || ''}`.trim() : '') ||
                      toNameFromEmail(interview.candidate?.email);
                    const displayEmail = interview.candidate?.email || 'No email';
                    return (
                      <KanbanCard
                        key={interview.id}
                        interview={interview}
                        candidateName={candidateName}
                        displayEmail={displayEmail}
                        jobTitle={getInterviewJobTitle(interview)}
                        applicationId={applicationId}
                        assignedName={resolveAssignedToNameForInterview(interview, applicationId)}
                        notePreview={
                          tableNotePreviewMap[interview.id]?.latest ||
                          interview.notes ||
                          interview.interviewFeedbacks?.[0]?.notes ||
                          interview.feedback?.[0]?.notes ||
                          ''
                        }
                        onOpenProfile={handleOpenProfile}
                        onOpenNotes={handleOpenNotes}
                        onGoToJob={(targetJobId) => navigate(`/ats/jobs/${targetJobId}`)}
                        resolveJobId={getInterviewJobId}
                      />
                    );
                  })}
              </KanbanColumn>
            ))}
          </div>
          <DragOverlay>
            {activeDragInterviewId ? (
              <div className="rounded-lg border border-primary/30 bg-background p-2.5 shadow-xl">
                <p className="text-xs font-medium truncate">
                  {(sortedInterviews.find((item) => item.id === activeDragInterviewId)?.application?.candidateName) || 'Interview'}
                </p>
                <p className="text-[11px] text-muted-foreground">Moving interview...</p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {viewMode === 'calendar' && (
        <div className="rounded-lg border border-border/80 bg-background p-3">
          <div className="h-[700px]">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              events={calendarEvents}
              eventClick={handleCalendarEventClick}
              eventContent={(eventInfo) => {
                const interview = eventInfo.event.extendedProps.interview as VideoInterview;
                const name =
                  interview?.application?.candidateName ||
                  (interview?.candidate
                    ? `${interview.candidate.firstName || ''} ${interview.candidate.lastName || ''}`.trim()
                    : '') ||
                  toNameFromEmail(interview?.candidate?.email);
                return (
                  <div className="px-1 py-0.5">
                    <p className="text-[10px] font-semibold leading-tight truncate">{name}</p>
                    <p className="text-[10px] leading-tight truncate">{getInterviewJobTitle(interview)}</p>
                    <p className="text-[10px] leading-tight">{interview?.type?.replace('_', ' ')} • {interview?.duration || 0}m</p>
                  </div>
                );
              }}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
            />
          </div>
        </div>
      )}

      <FormDrawer
        open={scheduleDrawerOpen}
        onOpenChange={(open) => {
          setScheduleDrawerOpen(open);
          if (!open) {
            loadInterviews();
          }
        }}
        title="Schedule Interview"
        description="Use the same meeting scheduling flow as candidate assessment."
        width="xl"
      >
        <div className="space-y-3">
          <div>
            <p className="text-[11px] text-muted-foreground mb-1">Candidate</p>
            <Select value={scheduleApplicationId} onValueChange={setScheduleApplicationId}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder={loadingCandidates ? 'Loading candidates...' : 'Select candidate'} />
              </SelectTrigger>
              <SelectContent>
                {candidates.map((candidate) => (
                  <SelectItem key={candidate.applicationId} value={candidate.applicationId}>
                    {candidate.candidateName} ({candidate.candidateEmail}) • Assigned: {candidate.assignedToName || 'Unassigned'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border bg-background min-h-[620px] p-2">
            {loadingScheduleApplication ? (
              <div className="h-[600px] flex items-center justify-center text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading scheduling flow...
              </div>
            ) : scheduleApplication ? (
              <ScheduleMeetingTab application={scheduleApplication} />
            ) : (
              <div className="h-[600px] flex items-center justify-center text-muted-foreground text-sm">
                Select a candidate to schedule.
              </div>
            )}
          </div>
        </div>
      </FormDrawer>

      <FormDrawer
        open={notesDrawerOpen}
        onOpenChange={setNotesDrawerOpen}
        title="Interview Notes"
        description={notesTarget ? `${notesTarget.candidateName} • Manage interview notes` : 'Manage interview notes'}
        width="md"
      >
        <div className="space-y-3">
          <div className="flex gap-2">
            <Textarea
              placeholder="Add a note for this interview..."
              value={noteInput}
              onChange={(event) => setNoteInput(event.target.value)}
              className="min-h-[88px] text-sm"
            />
            <Button className="h-9 self-end" onClick={handleAddNote} disabled={isAddingNote || !noteInput.trim()}>
              {isAddingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>

          <div className="rounded-md border bg-background divide-y">
            {isLoadingNotes ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                Loading notes...
              </div>
            ) : interviewNotes.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">No notes added yet.</div>
            ) : (
              interviewNotes.map((note) => (
                <div key={note.id} className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-medium">{note.author_name || 'Unknown'}</p>
                      <p className="text-[11px] text-muted-foreground">{format(new Date(note.created_at), 'PPP p')}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-destructive"
                      onClick={() => handleDeleteNote(note.id)}
                      disabled={deletingNoteId === note.id}
                    >
                      {deletingNoteId === note.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                  <p className="text-sm mt-2 whitespace-pre-wrap">{note.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </FormDrawer>

      <FormDrawer
        open={calendarDetailOpen}
        onOpenChange={setCalendarDetailOpen}
        title="Interview Schedule Details"
        description="Interview information, notes, and quick actions."
        width="md"
      >
        {calendarDetail ? (
          <div className="space-y-3">
            <div className="rounded-md border bg-background p-3">
              <p className="text-sm font-semibold">
                {calendarDetail.application?.candidateName ||
                  (calendarDetail.candidate ? `${calendarDetail.candidate.firstName || ''} ${calendarDetail.candidate.lastName || ''}`.trim() : '') ||
                  toNameFromEmail(calendarDetail.candidate?.email)}
              </p>
              <p className="text-xs text-muted-foreground">{calendarDetail.candidate?.email || 'No email'}</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded border bg-muted/20 p-2">
                  <p className="text-muted-foreground">Job</p>
                  <p className="font-medium truncate">{getInterviewJobTitle(calendarDetail)}</p>
                </div>
                <div className="rounded border bg-muted/20 p-2">
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium">{calendarDetail.status.replace('_', ' ')}</p>
                </div>
                <div className="rounded border bg-muted/20 p-2">
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium">{calendarDetail.type.replace('_', ' ')}</p>
                </div>
                <div className="rounded border bg-muted/20 p-2">
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium">{calendarDetail.duration} min</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Scheduled: {format(new Date(calendarDetail.scheduledDate), 'PPpp')}
              </p>
              {calendarDetail.meetingLink && (
                <a
                  href={calendarDetail.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex text-xs mt-1 text-primary underline"
                >
                  Open meeting link
                </a>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => handleOpenNotes(
                    calendarDetail,
                    calendarDetail.application?.candidateName ||
                      (calendarDetail.candidate ? `${calendarDetail.candidate.firstName || ''} ${calendarDetail.candidate.lastName || ''}`.trim() : '') ||
                      toNameFromEmail(calendarDetail.candidate?.email)
                  )}
                >
                  <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                  Notes
                </Button>
                {!!getInterviewJobId(calendarDetail) && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => navigate(`/ats/jobs/${getInterviewJobId(calendarDetail)}`)}
                  >
                    Go to Job
                  </Button>
                )}
              </div>
            </div>
            <div className="rounded-md border bg-background p-3">
              <p className="text-xs font-semibold mb-2">Notes</p>
              <div className="flex gap-2 mb-2">
                <Textarea
                  value={calendarNoteInput}
                  onChange={(event) => setCalendarNoteInput(event.target.value)}
                  placeholder="Add note for this schedule..."
                  className="min-h-[72px] text-sm"
                />
                <Button
                  className="h-9 self-end"
                  onClick={handleAddCalendarNote}
                  disabled={!notesTarget || !calendarNoteInput.trim() || isAddingCalendarNote}
                >
                  {isAddingCalendarNote ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
              <div className="max-h-[260px] overflow-auto rounded border divide-y">
                {isLoadingNotes ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                    Loading notes...
                  </div>
                ) : interviewNotes.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">No notes yet.</div>
                ) : (
                  interviewNotes.map((note) => (
                    <div key={note.id} className="p-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-medium">{note.author_name || 'Unknown'}</p>
                        <p className="text-[10px] text-muted-foreground">{format(new Date(note.created_at), 'PP p')}</p>
                      </div>
                      <p className="text-xs mt-1 whitespace-pre-wrap">{note.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-10 text-center text-sm text-muted-foreground">No schedule selected.</div>
        )}
      </FormDrawer>

      {selectedApplication && (
        <CandidateAssessmentView
          application={selectedApplication}
          open={openAssessment}
          onOpenChange={setOpenAssessment}
          jobTitle={selectedApplication.jobTitle || job?.title || 'Job'}
          jobId={selectedApplication.jobId || job?.id || ''}
        />
      )}
    </div>
  );
}
