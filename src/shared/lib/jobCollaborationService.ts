export interface JobNote {
  id: string;
  jobId: string;
  content: string;
  isPrivate: boolean;
  createdBy: string;
  createdAt: Date;
  mentions: string[];
  attachments?: string[];
}

export interface JobComment {
  id: string;
  jobId: string;
  content: string;
  createdBy: string;
  createdAt: Date;
  replies?: JobComment[];
}

export interface JobTask {
  id: string;
  jobId: string;
  title: string;
  description?: string;
  assignedTo: string;
  dueDate?: Date;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  createdBy: string;
  createdAt: Date;
}

const jobNotes: JobNote[] = [
  {
    id: "n1",
    jobId: "1",
    content: "Great response rate so far! @sarah please review the top 5 candidates.",
    isPrivate: true,
    createdBy: "Michael Chen",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    mentions: ["sarah"],
  },
  {
    id: "n2",
    jobId: "1",
    content: "Received feedback from hiring manager - they want more emphasis on React experience.",
    isPrivate: false,
    createdBy: "Sarah Johnson",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    mentions: [],
  },
];

const jobTasks: JobTask[] = [
  {
    id: "t1",
    jobId: "1",
    title: "Screen top 10 candidates",
    description: "Review resumes and conduct initial phone screens",
    assignedTo: "Sarah Johnson",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    status: "in_progress",
    priority: "high",
    createdBy: "Michael Chen",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "t2",
    jobId: "1",
    title: "Schedule technical interviews",
    assignedTo: "Tom Williams",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: "pending",
    priority: "medium",
    createdBy: "Sarah Johnson",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];

export function getJobNotes(jobId: string): JobNote[] {
  return jobNotes.filter(n => n.jobId === jobId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function addJobNote(jobId: string, content: string, isPrivate: boolean, createdBy: string): JobNote {
  const mentions = content.match(/@(\w+)/g)?.map(m => m.slice(1)) || [];
  
  const newNote: JobNote = {
    id: `n${Date.now()}`,
    jobId,
    content,
    isPrivate,
    createdBy,
    createdAt: new Date(),
    mentions,
  };
  
  jobNotes.push(newNote);
  return newNote;
}

export function getJobTasks(jobId: string): JobTask[] {
  return jobTasks.filter(t => t.jobId === jobId).sort((a, b) => {
    if (a.status === "completed" && b.status !== "completed") return 1;
    if (a.status !== "completed" && b.status === "completed") return -1;
    return (a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0);
  });
}

export function addJobTask(task: Omit<JobTask, "id" | "createdAt">): JobTask {
  const newTask: JobTask = {
    ...task,
    id: `t${Date.now()}`,
    createdAt: new Date(),
  };
  
  jobTasks.push(newTask);
  return newTask;
}

export function updateJobTask(taskId: string, updates: Partial<JobTask>): JobTask | null {
  const index = jobTasks.findIndex(t => t.id === taskId);
  if (index === -1) return null;
  
  jobTasks[index] = { ...jobTasks[index], ...updates };
  return jobTasks[index];
}

export function deleteJobTask(taskId: string): boolean {
  const index = jobTasks.findIndex(t => t.id === taskId);
  if (index === -1) return false;
  
  jobTasks.splice(index, 1);
  return true;
}
