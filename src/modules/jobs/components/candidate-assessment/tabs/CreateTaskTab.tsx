// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { FormDrawer } from "@/shared/components/ui/form-drawer";
import { Plus, Trash2, CheckCircle2, Circle, Clock, User, AlertCircle, MessageSquare, Loader2, FileText } from "lucide-react";
import { format } from "date-fns";
import { DateTimePicker } from "@/shared/components/ui/date-time-picker";
import { apiClient } from "@/shared/lib/api";
import { useToast } from "@/shared/hooks/use-toast";
import { cn } from "@/shared/lib/utils";
import { Application } from "@/shared/types/application";

// --- Types ---
type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

interface HiringTeamMember {
  userId: string;
  name: string;
  role: string;
  avatar?: string;
}

interface CreateTaskTabProps {
  application: Application;
  onTaskCreated?: () => void;
}

// --- Icons Helper ---
const PriorityIcon = ({ priority }: { priority: TaskPriority }) => {
  switch (priority) {
    case "URGENT": return <AlertCircle className="h-3 w-3 text-red-500" />;
    case "HIGH": return <Circle className="h-3 w-3 text-orange-500 fill-orange-500" />;
    case "MEDIUM": return <Circle className="h-3 w-3 text-yellow-500 fill-yellow-500" />;
    case "LOW": return <Circle className="h-3 w-3 text-blue-500" />;
    default: return <Circle className="h-3 w-3 text-muted-foreground" />;
  }
};

// --- Main Component: Task Creation Form ---
export function TaskCreationTab({ application, onTaskCreated }: CreateTaskTabProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [assigneeId, setAssigneeId] = useState<string>("unassigned");
  const [hiringTeam, setHiringTeam] = useState<HiringTeamMember[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const { toast } = useToast();

  const taskTemplates = [
    { id: "t1", title: "Schedule Interview", description: "Coordinate with candidate to schedule the next round of interviews." },
    { id: "t2", title: "Background Check", description: "Initiate background check process." },
    { id: "t3", title: "Reference Check", description: "Contact provided references." },
    { id: "t4", title: "Send Offer", description: "Prepare and send offer letter." },
  ];

  useEffect(() => {
    const fetchTeam = async () => {
      if (application.jobId) {
        try {
          const response = await apiClient.get<HiringTeamMember[]>(`/api/jobs/${application.jobId}/team`);
          if (response.success && response.data) {
            setHiringTeam(response.data);
          }
        } catch (e) {
          console.error("Failed to fetch team", e);
        }
      }
    };
    fetchTeam();
  }, [application.jobId]);

  const handleTemplateSelect = (val: string) => {
    const template = taskTemplates.find(t => t.id === val);
    if (template) {
      setTitle(template.title);
      setDescription(template.description);
      setSelectedTemplate(val);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleCreateTask = async () => {
    if (!title.trim()) return;

    setIsCreating(true);
    try {
      const payload = {
        title,
        description: description + (description ? "\n\n" : "") + "[Note: Task Notes are appended to description]",
        priority,
        dueDate: dueDate?.toISOString(),
        assignedTo: assigneeId === "unassigned" ? undefined : assigneeId,
      };

      const response = await apiClient.post(`/api/applications/${application.id}/tasks`, payload);

      if (response.success) {
        toast({ title: 'Task created successfully' });
        setTitle("");
        setDescription("");
        setPriority("MEDIUM");
        setDueDate(undefined);
        setAssigneeId("unassigned");
        setSelectedTemplate("");
        if (onTaskCreated) onTaskCreated();
      }
    } catch (error) {
      toast({ title: 'Failed to create task', variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden tab-scroll-container">
      <div className="flex items-center gap-2 px-3 py-2 border-b flex-shrink-0">
        <div className="flex-1">
          <Input
            placeholder="Task title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-7 text-sm font-semibold border-none shadow-none px-0 focus-visible:ring-0 placeholder:font-normal"
          />
        </div>

        <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
          <SelectTrigger className="h-7 w-7 p-0 border-none shadow-none text-muted-foreground hover:text-foreground">
            <FileText className="h-4 w-4" />
          </SelectTrigger>
          <SelectContent align="end">
            {taskTemplates.map(t => (
              <SelectItem key={t.id} value={t.id} className="text-xs">{t.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="h-4 w-px bg-border mx-1" />

        <Button
          size="sm"
          className="h-7 px-3 text-xs gap-1.5"
          onClick={handleCreateTask}
          disabled={isCreating || !title.trim()}
        >
          {isCreating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          Create
        </Button>
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 border-b bg-muted/10 flex-shrink-0 overflow-x-auto scrollbar-none">
        <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
          <SelectTrigger className="h-6 text-[10px] w-auto gap-1.5 bg-background shadow-sm border-dashed px-2 min-w-[80px]">
            <Circle className="h-3 w-3 text-muted-foreground" />
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="URGENT">Urgent</SelectItem>
          </SelectContent>
        </Select>

        <div className="w-[110px]">
          <DateTimePicker
            date={dueDate}
            onDateChange={setDueDate}
            placeholder="Due Date"
            className="h-6 text-[10px] bg-background shadow-sm border-dashed px-2"
          />
        </div>

        <div className="flex-1 min-w-[120px]">
          <Select value={assigneeId} onValueChange={setAssigneeId}>
            <SelectTrigger className="h-6 text-[10px] w-full gap-1.5 bg-background shadow-sm border-dashed px-2">
              <User className="h-3 w-3 text-muted-foreground" />
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned" className="text-xs italic text-muted-foreground">Unassigned</SelectItem>
              {hiringTeam.map(member => (
                <SelectItem key={member.userId} value={member.userId} className="text-xs">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-4 w-4">
                      <AvatarFallback className="text-[8px] bg-primary/10 text-primary">{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                    <span>{member.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
        <Textarea
          placeholder="Add details, context, or instructions..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="absolute inset-0 w-full h-full text-xs resize-none border-none p-3 focus-visible:ring-0"
        />
      </div>
    </div>
  );
}

// --- Task List Component ---
export function TaskListTab({ application }: CreateTaskTabProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<{ tasks: any[] }>(`/api/applications/${application.id}/tasks`);
      if (response.success && response.data?.tasks) {
        setTasks(response.data.tasks.map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          dueDate: t.due_date,
          assignee: t.assignee ? { id: t.assignee.id, name: t.assignee.name, avatar: t.assignee.avatar } : undefined,
          createdAt: t.created_at
        })));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, [application.id]);

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/api/applications/${application.id}/tasks/${id}`);
      setTasks(prev => prev.filter(t => t.id !== id));
      toast({ title: "Task deleted" });
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const handleUpdateStatus = async (task: Task, status: TaskStatus) => {
    try {
      await apiClient.put(`/api/applications/${application.id}/tasks/${task.id}`, { status });
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status } : t));
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  const handleAddNote = async (task: Task, note: string) => {
    if (!note.trim()) return;
    const timestamp = new Date().toLocaleString();
    const newDescription = task.description
      ? `${task.description}\n\n--- Note added on ${timestamp} ---\n${note}`
      : `--- Note added on ${timestamp} ---\n${note}`;

    try {
      await apiClient.put(`/api/applications/${application.id}/tasks/${task.id}`, { description: newDescription });
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, description: newDescription } : t));
      toast({ title: "Note added" });
    } catch {
      toast({ title: "Failed to add note", variant: "destructive" });
    }
  };

  const pendingCount = tasks.filter((task) => task.status !== "COMPLETED").length;
  const completedCount = tasks.filter((task) => task.status === "COMPLETED").length;
  const overdueCount = tasks.filter((task) => (
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "COMPLETED"
  )).length;

  if (isLoading) return <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (tasks.length === 0) return <div className="p-8 text-center text-xs text-muted-foreground">No tasks found. Create one above.</div>;

  return (
    <div className="h-full flex flex-col">
      <div className="px-2 py-2 border-b bg-muted/10">
        <div className="flex items-center gap-2 text-[11px]">
          <Badge variant="outline" className="h-6 rounded-md bg-background">Total {tasks.length}</Badge>
          <Badge variant="outline" className="h-6 rounded-md bg-background">Open {pendingCount}</Badge>
          <Badge variant="outline" className="h-6 rounded-md bg-background">Done {completedCount}</Badge>
          {overdueCount > 0 && (
            <Badge variant="outline" className="h-6 rounded-md bg-red-50 text-red-700 border-red-200">Overdue {overdueCount}</Badge>
          )}
        </div>
      </div>
      <ScrollArea className="h-full pr-2">
        <div className="space-y-2 p-2">
        {tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onDelete={handleDelete}
            onUpdateStatus={handleUpdateStatus}
            onAddNote={handleAddNote}
          />
        ))}
        </div>
      </ScrollArea>
      </div>
  );
}

function TaskItem({ task, onDelete, onUpdateStatus, onAddNote }: {
  task: Task;
  onDelete: (id: string) => void;
  onUpdateStatus: (task: Task, status: TaskStatus) => void;
  onAddNote: (task: Task, note: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [notesDrawerOpen, setNotesDrawerOpen] = useState(false);

  const parseTaskDescription = (description?: string) => {
    if (!description) return { descriptionText: "", notes: [] as Array<{ timestamp: string; content: string }> };
    const notes: Array<{ timestamp: string; content: string }> = [];
    const noteRegex = /--- Note added on (.*?) ---\n([\s\S]*?)(?=(\n\n--- Note added on )|$)/g;
    let match: RegExpExecArray | null;
    while ((match = noteRegex.exec(description)) !== null) {
      notes.push({ timestamp: match[1]?.trim() || "", content: match[2]?.trim() || "" });
    }
    const descriptionText = description
      .replace(/--- Note added on (.*?) ---\n([\s\S]*?)(?=(\n\n--- Note added on )|$)/g, "")
      .replace(/\[Note: Task Notes are appended to description\]/g, "")
      .trim();
    return { descriptionText, notes };
  };

  const parsed = parseTaskDescription(task.description);
  const createdAtText = task.createdAt ? format(new Date(task.createdAt), "MMM d, yyyy h:mm a") : "Unknown";
  const dueDateText = task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "No due date";
  const latestNote = parsed.notes[parsed.notes.length - 1];

  const statusBadgeClass =
    task.status === "COMPLETED"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
      : task.status === "IN_PROGRESS"
        ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
        : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-800";

  const priorityBadgeClass =
    task.priority === "URGENT"
      ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
      : task.priority === "HIGH"
        ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800"
        : task.priority === "MEDIUM"
          ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
          : "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800";

  const onSubmitNote = async () => {
    if (!noteText.trim()) return;
    setIsSavingNote(true);
    await onAddNote(task, noteText);
    setNoteText("");
    setIsSavingNote(false);
  };

  return (
    <div className={cn("rounded-lg border bg-card transition-all overflow-hidden", task.status === 'COMPLETED' ? "bg-muted/20 border-dashed" : "hover:shadow-sm border-solid")}>
      <div
        className="grid grid-cols-[auto_1fr_auto] gap-3 p-3 cursor-pointer hover:bg-muted/20 transition-colors items-start"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0 h-6 w-6 p-0 text-muted-foreground hover:text-primary transition-colors mt-0.5"
          onClick={(e) => { e.stopPropagation(); onUpdateStatus(task, task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'); }}
          title={task.status === 'COMPLETED' ? "Mark as Pending" : "Mark as Completed"}
        >
          {task.status === 'COMPLETED' ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Circle className="h-5 w-5" />}
        </Button>

        <div className="min-w-0 grid gap-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <PriorityIcon priority={task.priority} />
            <span className={cn("text-[13px] font-semibold truncate", task.status === 'COMPLETED' && "line-through text-muted-foreground")}>{task.title}</span>
            <Badge variant="outline" className={cn("text-[10px]", statusBadgeClass)}>{task.status.replace("_", " ")}</Badge>
            <Badge variant="outline" className={cn("text-[10px]", priorityBadgeClass)}>{task.priority}</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5" title="Assignee">
              {task.assignee ? (
                <>
                  <Avatar className="h-4 w-4 border border-background">
                    <AvatarImage src={task.assignee.avatar} />
                    <AvatarFallback className="text-[7px] bg-primary/10 text-primary">{task.assignee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground/80">{task.assignee.name}</span>
                </>
              ) : (
                <>
                  <div className="h-4 w-4 rounded-full bg-muted/50 flex items-center justify-center"><User className="h-2.5 w-2.5 opacity-50" /></div>
                  <span className="italic">Unassigned</span>
                </>
              )}
            </div>

            {task.dueDate && (
              <div className={cn("flex items-center gap-1.5", new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' && "text-red-500 font-medium")}>
                <Clock className="h-3.5 w-3.5" />
                <span>{dueDateText}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <span>Notes:</span>
              <Badge variant="secondary" className="text-[10px]">{parsed.notes.length}</Badge>
            </div>
            <div className="flex items-center gap-1.5">
              <span>Created:</span>
              <span className="text-foreground/80">{createdAtText}</span>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground line-clamp-2">
            {latestNote?.content || parsed.descriptionText || "No description"}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Select
            value={task.status}
            onValueChange={(value) => onUpdateStatus(task, value as TaskStatus)}
          >
            <SelectTrigger
              className="h-7 w-[118px] text-[11px] bg-background"
              onClick={(e) => e.stopPropagation()}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive transition-colors"
            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
            title="Delete Task"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={(e) => { e.stopPropagation(); setNotesDrawerOpen(true); }}>
            <MessageSquare className="h-3.5 w-3.5 mr-1" />
            Notes
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 pt-2 border-t bg-muted/5">
          <div className="space-y-4">
            <div>
              <h5 className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Description</h5>
              <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed bg-background p-3 rounded border">
                {parsed.descriptionText || <span className="italic opacity-50 text-muted-foreground">No description provided.</span>}
              </div>
            </div>

            <div>
              <h5 className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Notes</h5>
              {parsed.notes.length === 0 ? (
                <div className="rounded-md border bg-background p-3 text-sm italic text-muted-foreground">No notes added yet.</div>
              ) : (
                <div className="space-y-2">
                  {parsed.notes.slice(-2).reverse().map((note, idx) => (
                    <div key={`${note.timestamp}-${idx}`} className="rounded-md border bg-background p-3">
                      <p className="text-[11px] text-muted-foreground">{note.timestamp}</p>
                      <p className="text-sm mt-1 whitespace-pre-wrap">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
              {parsed.notes.length > 2 && (
                <Button size="sm" variant="ghost" className="h-6 px-1 mt-1 text-[10px] text-primary" onClick={() => setNotesDrawerOpen(true)}>
                  View all {parsed.notes.length} notes
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Status</p>
                <Select value={task.status} onValueChange={(value) => onUpdateStatus(task, value as TaskStatus)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Due Date</p>
                <div className="h-8 rounded border px-2 flex items-center text-xs">
                  {task.dueDate ? format(new Date(task.dueDate), "PPp") : <span className="text-muted-foreground">No due date</span>}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Type a note..."
                className="min-h-[70px] text-sm resize-none bg-background"
              />
              <div className="flex justify-end">
                <Button size="sm" className="h-7 text-xs" onClick={onSubmitNote} disabled={!noteText.trim() || isSavingNote}>
                  {isSavingNote ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
                  Add Note
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <FormDrawer
        open={notesDrawerOpen}
        onOpenChange={setNotesDrawerOpen}
        title="Task Notes"
        description={task.title}
        width="md"
      >
        <div className="space-y-3">
          <div className="rounded-md border bg-muted/20 p-3">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Description</p>
            <p className="text-sm whitespace-pre-wrap">{parsed.descriptionText || "No description"}</p>
          </div>
          <div className="space-y-2 rounded-md border p-3 bg-background">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Add Note</p>
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Write a clear note update..."
              className="min-h-[80px] text-sm resize-none"
            />
            <div className="flex justify-end">
              <Button size="sm" className="h-7 text-xs" onClick={onSubmitNote} disabled={!noteText.trim() || isSavingNote}>
                {isSavingNote ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
                Add Note
              </Button>
            </div>
          </div>
          <div className="rounded-md border bg-background">
            <ScrollArea className="h-[260px]">
              <div className="divide-y">
                {parsed.notes.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">No notes yet.</div>
                ) : (
                  parsed.notes.slice().reverse().map((note, index) => (
                    <div key={`${note.timestamp}-${index}`} className="p-3">
                      <p className="text-[11px] text-muted-foreground">{note.timestamp}</p>
                      <p className="text-sm mt-1 whitespace-pre-wrap">{note.content}</p>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </FormDrawer>
    </div>
  );
}

// CreateTaskTab is an alias for TaskCreationTab for backward compatibility.
export { TaskCreationTab as CreateTaskTab };
