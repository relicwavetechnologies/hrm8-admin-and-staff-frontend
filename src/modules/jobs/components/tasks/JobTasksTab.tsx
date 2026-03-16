// @ts-nocheck
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
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
import { FormDrawer } from '@/shared/components/ui/form-drawer';
import { DateTimePicker } from '@/shared/components/ui/date-time-picker';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { apiClient } from '@/shared/lib/api';
import { applicationService } from '@/shared/lib/applicationService';
import { useToast } from '@/shared/hooks/use-toast';
import { authService } from '@/shared/lib/authService';
import type { Application } from '@/shared/types/application';
import type { Job } from '@/shared/types/job';
import { CheckSquare, Loader2, Plus, Trash2, MessageSquare, Send, BarChart3, Sparkles, LayoutGrid, List, GripVertical } from 'lucide-react';
import { CandidateAssessmentView } from '@/modules/jobs/components/candidate-assessment/CandidateAssessmentView';

type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

interface JobTaskRow {
  id: string;
  applicationId: string;
  jobTitle?: string;
  candidateName: string;
  candidateEmail: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  assignedToName?: string;
  createdAt: string;
}

interface HiringTeamMember {
  userId?: string;
  id?: string;
  name: string;
}

interface ParsedTaskNote {
  author: string;
  timestamp: string;
  content: string;
}

interface JobTasksTabProps {
  job?: Job;
  applications?: Application[];
  onRefresh?: () => void;
}

interface TaskKanbanColumnProps {
  id: TaskStatus;
  label: string;
  count: number;
  children: ReactNode;
}

interface TaskKanbanCardProps {
  task: JobTaskRow;
  onOpenNotes: (task: JobTaskRow) => void;
  onDelete: (task: JobTaskRow) => void;
  onViewProfile: (task: JobTaskRow) => void;
  loadingProfile: boolean;
}

const priorityClass = (priority: TaskPriority) => {
  if (priority === 'URGENT') return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
  if (priority === 'HIGH') return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
  if (priority === 'MEDIUM') return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
  return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800';
};

const statusClass = (status: TaskStatus) => {
  if (status === 'COMPLETED') return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
  if (status === 'IN_PROGRESS') return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
  return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-800';
};

function WeeklyTaskBars({ data }: { data: Array<{ label: string; created: number; completed: number }> }) {
  const max = Math.max(...data.flatMap((item) => [item.created, item.completed]), 1);

  return (
    <div className="space-y-1.5">
      {data.map((item) => (
        <div key={item.label} className="grid grid-cols-[34px_1fr] items-center gap-2">
          <span className="text-[10px] text-muted-foreground">{item.label}</span>
          <div className="space-y-1">
            <div className="h-2 rounded bg-blue-100 dark:bg-blue-900/30 overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: `${(item.created / max) * 100}%` }} />
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

const taskColumnTheme: Record<TaskStatus, string> = {
  PENDING: 'bg-gradient-to-b from-slate-50/90 to-slate-50/40 border-slate-200/70 dark:from-slate-900/90 dark:to-slate-900/40 dark:border-slate-800/70',
  IN_PROGRESS: 'bg-gradient-to-b from-blue-50/90 to-blue-50/40 border-blue-200/70 dark:from-blue-900/20 dark:to-blue-900/10 dark:border-blue-800/70',
  COMPLETED: 'bg-gradient-to-b from-emerald-50/90 to-emerald-50/40 border-emerald-200/70 dark:from-emerald-900/20 dark:to-emerald-900/10 dark:border-emerald-800/70',
};

function TaskKanbanColumn({ id, label, count, children }: TaskKanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl border ${taskColumnTheme[id]} transition-all duration-150 ${
        isOver ? 'ring-2 ring-primary/40 shadow-sm' : ''
      }`}
    >
      <div className="border-b border-border/60 px-3 py-2.5 flex items-center justify-between">
        <p className="text-xs font-semibold">{label}</p>
        <Badge variant="outline" className="text-[10px] h-5 px-1.5">{count}</Badge>
      </div>
      <div className="max-h-[640px] overflow-auto p-2 space-y-2">{children}</div>
    </div>
  );
}

function TaskKanbanCard({ task, onOpenNotes, onDelete, onViewProfile, loadingProfile }: TaskKanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `${task.applicationId}::${task.id}`,
    data: { status: task.status },
  });
  const style = { transform: CSS.Translate.toString(transform) };
  const notes = parseTaskDescription(task.description);

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
          <p className="text-xs font-medium truncate">{task.title}</p>
          <p className="text-[11px] text-muted-foreground truncate">{task.candidateName} • {task.candidateEmail}</p>
          {task.jobTitle && <p className="text-[11px] text-muted-foreground truncate">{task.jobTitle}</p>}
        </div>
        <button
          type="button"
          className="h-6 w-6 shrink-0 rounded border bg-muted/30 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
          {...listeners}
          {...attributes}
          aria-label="Drag task"
        >
          <GripVertical className="h-3.5 w-3.5 mx-auto" />
        </button>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1">
        <Badge variant="outline" className={`text-[10px] h-5 px-1.5 ${priorityClass(task.priority)}`}>{task.priority}</Badge>
        <Badge variant="outline" className={`text-[10px] h-5 px-1.5 ${statusClass(task.status)}`}>{task.status.replace('_', ' ')}</Badge>
        <Badge variant="outline" className="text-[10px] h-5 px-1.5">{task.assignedToName || 'Unassigned'}</Badge>
      </div>
      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{notes.notes[0]?.content || notes.descriptionText || 'No notes'}</p>
      <p className="text-[11px] text-muted-foreground mt-1">
        Due: {task.dueDate ? format(new Date(task.dueDate), 'PPp') : 'No due date'}
      </p>
      <div className="flex flex-wrap gap-1 mt-2">
        <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px]" onClick={() => onOpenNotes(task)}>
          <MessageSquare className="h-3 w-3 mr-1" />
          Notes
        </Button>
        <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px]" onClick={() => onViewProfile(task)} disabled={loadingProfile}>
          {loadingProfile ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : null}
          View Profile
        </Button>
        <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px] text-destructive" onClick={() => onDelete(task)}>
          <Trash2 className="h-3 w-3 mr-1" />
          Delete
        </Button>
      </div>
    </div>
  );
}

function parseTaskDescription(description?: string): { descriptionText: string; notes: ParsedTaskNote[] } {
  if (!description) return { descriptionText: '', notes: [] };

  const notes: ParsedTaskNote[] = [];
  const noteRegex = /--- Note added(?: by (.*?))? on (.*?) ---\n([\s\S]*?)(?=(\n\n--- Note added(?: by .*?)? on )|$)/g;
  let match: RegExpExecArray | null;

  while ((match = noteRegex.exec(description)) !== null) {
    notes.push({
      author: match[1]?.trim() || 'Team member',
      timestamp: match[2]?.trim() || 'Note',
      content: match[3]?.trim() || '',
    });
  }

  const descriptionText = description
    .replace(/--- Note added(?: by (.*?))? on (.*?) ---\n([\s\S]*?)(?=(\n\n--- Note added(?: by .*?)? on )|$)/g, '')
    .replace(/\[Note: Task Notes are appended to description\]/g, '')
    .trim();

  return { descriptionText, notes };
}

export function JobTasksTab({ job, applications = [], onRefresh }: JobTasksTabProps) {
  const { toast } = useToast();

  const [tasks, setTasks] = useState<JobTaskRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingTask, setUpdatingTask] = useState<Record<string, boolean>>({});

  const [team, setTeam] = useState<HiringTeamMember[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [candidateId, setCandidateId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [assigneeId, setAssigneeId] = useState('unassigned');
  const [currentUserName, setCurrentUserName] = useState('You');

  const [notesOpen, setNotesOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<JobTaskRow | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'board'>('table');
  const [activeDragTaskId, setActiveDragTaskId] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [openAssessment, setOpenAssessment] = useState(false);
  const [loadingProfileTaskId, setLoadingProfileTaskId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  useEffect(() => {
    loadTasks();
  }, [job?.id, applications.length]);

  useEffect(() => {
    if (!job?.id) {
      setTeam([]);
      return;
    }
    const fetchTeam = async () => {
      try {
        const response = await apiClient.get<any>(`/api/jobs/${job.id}/team`);
        const teamList = Array.isArray(response.data) ? response.data : response.data?.team;
        if (response.success && Array.isArray(teamList)) {
          setTeam(
            teamList.map((member: any) => ({
              userId: member.userId || member.user_id,
              id: member.id,
              name: member.name,
            }))
          );
        }
      } catch {
        // non-fatal
      }
    };
    fetchTeam();
  }, [job?.id]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const me = await authService.getCurrentUser();
        const name = me.data?.user?.name?.trim();
        if (me.success && name) setCurrentUserName(name);
      } catch {
        // non-fatal fallback
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (!candidateId && applications[0]?.id) {
      setCandidateId(applications[0].id);
    }
  }, [applications, candidateId]);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      let rows: JobTaskRow[] = [];

      if (!job?.id) {
        // Global mode: single bulk request for all company tasks
        const response = await applicationService.getCompanyTasks();
        if (response.success && response.data?.tasks) {
          rows = response.data.tasks.map((t: any): JobTaskRow => {
            const candidate = t.application?.candidate || {};
            const firstName = candidate.first_name || '';
            const lastName = candidate.last_name || '';
            const candidateName = `${firstName} ${lastName}`.trim() || candidate.email || 'Unknown Candidate';
            return {
              id: t.id,
              applicationId: t.application?.id || '',
              jobTitle: t.application?.job?.title || '',
              candidateName,
              candidateEmail: candidate.email || 'No email',
              title: t.title,
              description: t.description,
              status: t.status,
              priority: t.priority,
              dueDate: t.due_date || t.dueDate,
              assignedToName: t.assignee?.name || '',
              createdAt: t.created_at || t.createdAt,
            };
          });
        }
      } else {
        // Job-specific mode: per-application requests (already a small set)
        if (!applications.length) {
          setTasks([]);
          setIsLoading(false);
          return;
        }
        const results = await Promise.allSettled(
          applications.map(async (app) => {
            const response = await apiClient.get<{ tasks: any[] }>(`/api/applications/${app.id}/tasks`);
            if (!response.success || !response.data?.tasks) return [] as JobTaskRow[];

            return response.data.tasks.map((t: any): JobTaskRow => {
              const candidateName =
                app.candidateName ||
                ((app as any).candidate?.firstName
                  ? `${(app as any).candidate?.firstName || ''} ${(app as any).candidate?.lastName || ''}`.trim()
                  : 'Unknown Candidate');

              return {
                id: t.id,
                applicationId: app.id,
                jobTitle: app.jobTitle || (app as any).job?.title || '',
                candidateName,
                candidateEmail: app.candidateEmail || (app as any).email || 'No email',
                title: t.title,
                description: t.description,
                status: t.status,
                priority: t.priority,
                dueDate: t.due_date || t.dueDate,
                assignedToName: t.assignee?.name || t.assigned_to_name || t.assignedToName || t.assignee_name || '',
                createdAt: t.created_at || t.createdAt,
              };
            });
          })
        );

        rows = results
          .filter((result): result is PromiseFulfilledResult<JobTaskRow[]> => result.status === 'fulfilled')
          .flatMap((result) => result.value);
      }

      setTasks(rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast({ title: 'Error', description: 'Failed to load tasks', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const stats = useMemo(() => {
    const completed = tasks.filter((task) => task.status === 'COMPLETED').length;
    const inProgress = tasks.filter((task) => task.status === 'IN_PROGRESS').length;
    const pending = tasks.filter((task) => task.status === 'PENDING').length;
    return { total: tasks.length, completed, inProgress, pending };
  }, [tasks]);

  const weeklyBreakdown = useMemo(() => {
    const now = new Date();
    const buckets = Array.from({ length: 6 }, (_, index) => ({
      label: `W${index + 1}`,
      created: 0,
      completed: 0,
    }));

    tasks.forEach((task) => {
      const dayDiff = Math.floor((now.getTime() - new Date(task.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      if (dayDiff >= 0 && dayDiff < 42) {
        const weekIndex = 5 - Math.floor(dayDiff / 7);
        if (weekIndex >= 0 && weekIndex < 6) {
          buckets[weekIndex].created += 1;
        }
      }
      if (task.status === 'COMPLETED') {
        const completedDayDiff = Math.floor((now.getTime() - new Date(task.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        if (completedDayDiff >= 0 && completedDayDiff < 42) {
          const weekIndex = 5 - Math.floor(completedDayDiff / 7);
          if (weekIndex >= 0 && weekIndex < 6) {
            buckets[weekIndex].completed += 1;
          }
        }
      }
    });

    return buckets;
  }, [tasks]);

  const priorityDistribution = useMemo(() => {
    const total = Math.max(tasks.length, 1);
    const groups = [
      { key: 'URGENT', label: 'Urgent', value: tasks.filter((task) => task.priority === 'URGENT').length, color: 'bg-red-500' },
      { key: 'HIGH', label: 'High', value: tasks.filter((task) => task.priority === 'HIGH').length, color: 'bg-orange-500' },
      { key: 'MEDIUM', label: 'Medium', value: tasks.filter((task) => task.priority === 'MEDIUM').length, color: 'bg-amber-500' },
      { key: 'LOW', label: 'Low', value: tasks.filter((task) => task.priority === 'LOW').length, color: 'bg-sky-500' },
    ];

    return groups.map((item) => ({
      ...item,
      percent: Math.round((item.value / total) * 100),
    }));
  }, [tasks]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('MEDIUM');
    setDueDate(undefined);
    setAssigneeId('unassigned');
  };

  const handleCreateTask = async () => {
    if (!candidateId || !title.trim()) {
      toast({ title: 'Required fields missing', description: 'Select candidate and add task title', variant: 'destructive' });
      return;
    }

    setCreating(true);
    try {
      const response = await apiClient.post(`/api/applications/${candidateId}/tasks`, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate?.toISOString(),
        assignedTo: assigneeId === 'unassigned' ? undefined : assigneeId,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to create task');
      }

      toast({ title: 'Task created' });
      resetForm();
      setCreateOpen(false);
      await loadTasks();
      onRefresh?.();
    } catch (error) {
      toast({ title: 'Failed to create task', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (task: JobTaskRow, status: TaskStatus) => {
    setUpdatingTask((prev) => ({ ...prev, [task.id]: true }));
    try {
      await apiClient.put(`/api/applications/${task.applicationId}/tasks/${task.id}`, { status });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status } : t)));
      toast({ title: 'Task updated' });
    } catch {
      toast({ title: 'Failed to update task', variant: 'destructive' });
    } finally {
      setUpdatingTask((prev) => ({ ...prev, [task.id]: false }));
    }
  };

  const handleDelete = async (task: JobTaskRow) => {
    try {
      await apiClient.delete(`/api/applications/${task.applicationId}/tasks/${task.id}`);
      setTasks((prev) => prev.filter((item) => item.id !== task.id));
      toast({ title: 'Task deleted' });
    } catch {
      toast({ title: 'Failed to delete task', variant: 'destructive' });
    }
  };

  const handleBoardDragStart = (event: DragStartEvent) => {
    setActiveDragTaskId(String(event.active.id));
  };

  const handleBoardDragEnd = async (event: DragEndEvent) => {
    setActiveDragTaskId(null);
    const dragId = String(event.active.id);
    const targetStatus = event.over?.id as TaskStatus | undefined;
    if (!targetStatus) return;

    const [applicationId, taskId] = dragId.split('::');
    const currentTask = tasks.find((item) => item.id === taskId && item.applicationId === applicationId);
    if (!currentTask || currentTask.status === targetStatus) return;

    const previousStatus = currentTask.status;
    setTasks((prev) =>
      prev.map((item) =>
        item.id === taskId && item.applicationId === applicationId ? { ...item, status: targetStatus } : item
      )
    );

    try {
      await apiClient.put(`/api/applications/${applicationId}/tasks/${taskId}`, { status: targetStatus });
      toast({ title: 'Task updated' });
    } catch {
      setTasks((prev) =>
        prev.map((item) =>
          item.id === taskId && item.applicationId === applicationId ? { ...item, status: previousStatus } : item
        )
      );
      toast({ title: 'Failed to update task', variant: 'destructive' });
    }
  };

  const handleViewProfile = async (task: JobTaskRow) => {
    const taskKey = `${task.applicationId}::${task.id}`;
    setLoadingProfileTaskId(taskKey);
    const local = applications.find((app) => app.id === task.applicationId) || null;
    if (local) {
      setSelectedApplication(local);
      setOpenAssessment(true);
    }

    try {
      const response = await applicationService.getApplicationForAdmin(task.applicationId);
      if (response.success && response.data?.application) {
        const full = response.data.application as any;
        const mapped: Application = {
          ...(local || {}),
          ...full,
          candidateName:
            full.candidate?.firstName && full.candidate?.lastName
              ? `${full.candidate.firstName} ${full.candidate.lastName}`
              : full.candidate?.firstName || full.candidateName || local?.candidateName,
          candidateEmail: full.candidate?.email || full.candidateEmail || local?.candidateEmail,
          candidatePhone: full.candidate?.phone || full.candidatePhone || local?.candidatePhone,
          candidatePhoto: full.candidate?.photo || full.candidatePhoto || local?.candidatePhoto,
          activities: full.activities || local?.activities || [],
          notes: full.notes || local?.notes || [],
          interviews: full.interviews || local?.interviews || [],
          teamReviews: full.teamReviews || local?.teamReviews || [],
          evaluations: full.evaluations || local?.evaluations || [],
          aiAnalysis: full.aiAnalysis || local?.aiAnalysis,
        } as Application;
        setSelectedApplication(mapped);
        setOpenAssessment(true);
      }
    } catch {
      if (!local) {
        toast({ title: 'Failed to open profile', variant: 'destructive' });
      }
    } finally {
      setLoadingProfileTaskId(null);
    }
  };

  const openNotesDrawer = (task: JobTaskRow) => {
    setSelectedTask(task);
    setNoteInput('');
    setNotesOpen(true);
  };

  const handleAddTaskNote = async () => {
    if (!selectedTask || !noteInput.trim()) return;

    const timestamp = new Date().toLocaleString();
    const noteBlock = `--- Note added by ${currentUserName} on ${timestamp} ---\n${noteInput.trim()}`;
    const nextDescription = selectedTask.description
      ? `${selectedTask.description}\n\n${noteBlock}`
      : noteBlock;

    setSavingNote(true);
    try {
      await apiClient.put(`/api/applications/${selectedTask.applicationId}/tasks/${selectedTask.id}`, {
        description: nextDescription,
      });
      setTasks((prev) =>
        prev.map((task) => (task.id === selectedTask.id && task.applicationId === selectedTask.applicationId ? { ...task, description: nextDescription } : task))
      );
      setSelectedTask((prev) => (prev ? { ...prev, description: nextDescription } : prev));
      setNoteInput('');
      toast({ title: 'Note added' });
    } catch {
      toast({ title: 'Failed to add note', variant: 'destructive' });
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <div className="space-y-3">
      <Card className="border-border/80 shadow-none">
        <CardHeader className="px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-semibold">Tasks</CardTitle>
              <p className="text-[11px] text-muted-foreground mt-0.5">All candidate tasks in one compact and actionable table.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-[11px]">Total {stats.total}</Badge>
              <Badge variant="outline" className="text-[11px]">Pending {stats.pending}</Badge>
              <Badge variant="outline" className="text-[11px]">In Progress {stats.inProgress}</Badge>
              <Badge variant="outline" className="text-[11px]">Completed {stats.completed}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3 pt-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'table' | 'board')}>
              <TabsList className="h-8">
                <TabsTrigger value="board" className="text-xs h-7">
                  <LayoutGrid className="h-3.5 w-3.5 mr-1.5" />
                  Board
                </TabsTrigger>
                <TabsTrigger value="table" className="text-xs h-7">
                  <List className="h-3.5 w-3.5 mr-1.5" />
                  Table
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button size="sm" className="h-8 text-xs" onClick={() => setCreateOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              New Task
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
              Task Throughput Trend
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0">
            <WeeklyTaskBars data={weeklyBreakdown} />
            <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" />Created</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Completed</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-none">
          <CardHeader className="px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-medium text-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              Priority Mix
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0 space-y-2.5">
            {priorityDistribution.map((item) => (
              <div key={item.key} className="grid grid-cols-[70px_1fr_38px] items-center gap-2 text-[10px]">
                <span className="text-muted-foreground">{item.label}</span>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                </div>
                <span className="text-right font-medium">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border border-border/80 bg-background overflow-hidden">
        <div className="h-[600px] overflow-auto">
          <Table className="text-xs min-w-[1120px]">
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="h-9 px-3">Task</TableHead>
                <TableHead className="h-9 px-3">Candidate</TableHead>
                <TableHead className="h-9 px-3">Assigned</TableHead>
                <TableHead className="h-9 px-3">Priority</TableHead>
                <TableHead className="h-9 px-3">Due</TableHead>
                <TableHead className="h-9 px-3">Status</TableHead>
                <TableHead className="h-9 px-3">Notes</TableHead>
                <TableHead className="h-9 px-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                    Loading tasks...
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && tasks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                    <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-60" />
                    No tasks yet.
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && tasks.map((task) => {
                const parsed = parseTaskDescription(task.description);
                return (
                <TableRow key={`${task.applicationId}-${task.id}`}>
                  <TableCell className="px-3 py-2.5 min-w-[220px]">
                    <p className="font-medium text-foreground truncate">{task.title}</p>
                    <p className="text-[11px] text-muted-foreground">Created {format(new Date(task.createdAt), 'PP')}</p>
                  </TableCell>
                  <TableCell className="px-3 py-2.5 min-w-[200px]">
                    <p className="font-medium text-foreground truncate">{task.candidateName}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{task.candidateEmail}</p>
                    {task.jobTitle && <p className="text-[11px] text-muted-foreground truncate">{task.jobTitle}</p>}
                  </TableCell>
                  <TableCell className="px-3 py-2.5">
                    <Badge variant="outline" className="text-[10px]">{task.assignedToName || 'Unassigned'}</Badge>
                  </TableCell>
                  <TableCell className="px-3 py-2.5">
                    <Badge variant="outline" className={`text-[10px] ${priorityClass(task.priority)}`}>{task.priority}</Badge>
                  </TableCell>
                  <TableCell className="px-3 py-2.5 whitespace-nowrap text-[11px]">
                    {task.dueDate ? format(new Date(task.dueDate), 'PPp') : <span className="text-muted-foreground">No due date</span>}
                  </TableCell>
                  <TableCell className="px-3 py-2.5 min-w-[170px]">
                    <Select
                      value={task.status}
                      onValueChange={(value) => handleStatusChange(task, value as TaskStatus)}
                      disabled={updatingTask[task.id]}
                    >
                      <SelectTrigger className="h-7 text-[10px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge variant="outline" className={`mt-1 text-[10px] ${statusClass(task.status)}`}>{task.status.replace('_', ' ')}</Badge>
                  </TableCell>
                  <TableCell className="px-3 py-2.5 max-w-[260px]">
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {parsed.notes[0]?.content || parsed.descriptionText || 'No notes'}
                    </p>
                    {parsed.notes.length > 0 && (
                      <Badge variant="secondary" className="mt-1 text-[10px]">{parsed.notes.length} notes</Badge>
                    )}
                    <Button size="sm" variant="ghost" className="h-6 px-1.5 mt-1 text-[10px] text-primary" onClick={() => openNotesDrawer(task)}>
                      <MessageSquare className="h-3 w-3 mr-1" />
                      View Notes
                    </Button>
                  </TableCell>
                  <TableCell className="px-3 py-2.5 text-right">
                    <Button size="sm" variant="outline" className="h-7 text-[10px] text-destructive" onClick={() => handleDelete(task)}>
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </div>
      </div>
      </>
      )}

      {viewMode === 'board' && (
        <DndContext sensors={sensors} onDragStart={handleBoardDragStart} onDragEnd={handleBoardDragEnd}>
          <div className="grid gap-3 lg:grid-cols-3">
            {([
              { key: 'PENDING', label: 'Pending' },
              { key: 'IN_PROGRESS', label: 'In Progress' },
              { key: 'COMPLETED', label: 'Completed' },
            ] as Array<{ key: TaskStatus; label: string }>).map((column) => (
              <TaskKanbanColumn
                key={column.key}
                id={column.key}
                label={column.label}
                count={tasks.filter((item) => item.status === column.key).length}
              >
                {tasks
                  .filter((item) => item.status === column.key)
                  .map((task) => (
                    <TaskKanbanCard
                      key={`${task.applicationId}::${task.id}`}
                      task={task}
                      onOpenNotes={openNotesDrawer}
                      onDelete={handleDelete}
                      onViewProfile={handleViewProfile}
                      loadingProfile={loadingProfileTaskId === `${task.applicationId}::${task.id}`}
                    />
                  ))}
              </TaskKanbanColumn>
            ))}
          </div>
          <DragOverlay>
            {activeDragTaskId ? (
              <div className="rounded-lg border border-primary/30 bg-background p-2.5 shadow-xl">
                <p className="text-xs font-medium truncate">
                  {tasks.find((task) => `${task.applicationId}::${task.id}` === activeDragTaskId)?.title || 'Task'}
                </p>
                <p className="text-[11px] text-muted-foreground">Moving task...</p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <FormDrawer
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Create Task"
        description="Create a task for a selected candidate."
        width="md"
      >
        <div className="space-y-3">
          <div>
            <p className="text-[11px] text-muted-foreground mb-1">Candidate</p>
            <Select value={candidateId} onValueChange={setCandidateId}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select candidate" />
              </SelectTrigger>
              <SelectContent>
                {applications.map((app) => (
                  <SelectItem key={app.id} value={app.id}>
                    {app.candidateName || app.candidateEmail || app.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="text-[11px] text-muted-foreground mb-1">Title</p>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-8 text-xs" placeholder="Task title" />
          </div>

          <div>
            <p className="text-[11px] text-muted-foreground mb-1">Description</p>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="text-xs" placeholder="Task notes" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="text-[11px] text-muted-foreground mb-1">Priority</p>
              <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground mb-1">Due Date</p>
              <DateTimePicker date={dueDate} onDateChange={setDueDate} className="h-8 text-xs" placeholder="Set due date" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground mb-1">Assignee</p>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {team.filter((m) => Boolean(m.userId)).map((member) => (
                    <SelectItem key={member.userId} value={member.userId!}>{member.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button size="sm" className="h-8 text-xs" onClick={handleCreateTask} disabled={creating || !title.trim() || !candidateId}>
              {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Plus className="h-3.5 w-3.5 mr-1.5" />}
              Create Task
            </Button>
          </div>
        </div>
      </FormDrawer>

      <FormDrawer
        open={notesOpen}
        onOpenChange={setNotesOpen}
        title="Task Notes"
        description={selectedTask ? `${selectedTask.title} • ${selectedTask.candidateName}` : 'Task notes'}
        width="md"
      >
        {selectedTask && (
          <div className="space-y-3">
            <div className="rounded-md border bg-muted/20 p-3">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Description</p>
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {parseTaskDescription(selectedTask.description).descriptionText || 'No description'}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">All Notes</p>
              <div className="rounded-md border bg-background">
                <ScrollArea className="h-[260px]">
                  <div className="divide-y">
                    {parseTaskDescription(selectedTask.description).notes.length === 0 ? (
                      <div className="p-4 text-sm text-muted-foreground text-center">No notes yet.</div>
                    ) : (
                      parseTaskDescription(selectedTask.description).notes.map((note, idx) => (
                        <div key={`${note.timestamp}-${idx}`} className="p-3">
                          <p className="text-xs font-medium">{note.author}</p>
                          <p className="text-[11px] text-muted-foreground">{note.timestamp}</p>
                          <p className="text-sm mt-1 whitespace-pre-wrap">{note.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Add Note</p>
              <Textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Add note for this task..."
                className="min-h-[90px] text-sm"
              />
              <div className="flex justify-end">
                <Button size="sm" className="h-8 text-xs" onClick={handleAddTaskNote} disabled={savingNote || !noteInput.trim()}>
                  {savingNote ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Send className="h-3.5 w-3.5 mr-1.5" />}
                  Add Note
                </Button>
              </div>
            </div>
          </div>
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
