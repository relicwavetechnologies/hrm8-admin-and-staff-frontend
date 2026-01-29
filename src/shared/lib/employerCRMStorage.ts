import { 
  EmployerActivity, 
  EmployerNote, 
  EmployerTask,
  ActivityType 
} from "@/shared/types/employerCRM";

const STORAGE_KEY_ACTIVITIES = 'employer_activities';
const STORAGE_KEY_NOTES = 'employer_notes';
const STORAGE_KEY_TASKS = 'employer_tasks';

// ============= Activities =============

export function getEmployerActivities(employerId: string): EmployerActivity[] {
  const stored = localStorage.getItem(STORAGE_KEY_ACTIVITIES);
  const all = stored ? JSON.parse(stored) : [];
  return all.filter((a: EmployerActivity) => a.employerId === employerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createActivity(
  employerId: string,
  type: ActivityType,
  title: string,
  description?: string,
  metadata?: Record<string, any>,
  userId?: string,
  userName?: string
): EmployerActivity {
  const stored = localStorage.getItem(STORAGE_KEY_ACTIVITIES);
  const activities = stored ? JSON.parse(stored) : [];
  
  const newActivity: EmployerActivity = {
    id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    employerId,
    type,
    title,
    description,
    metadata,
    userId,
    userName,
    createdAt: new Date().toISOString(),
  };
  
  activities.push(newActivity);
  localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(activities));
  return newActivity;
}

// ============= Notes =============

export function getEmployerNotes(employerId: string): EmployerNote[] {
  const stored = localStorage.getItem(STORAGE_KEY_NOTES);
  const all = stored ? JSON.parse(stored) : [];
  return all.filter((n: EmployerNote) => n.employerId === employerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createNote(noteData: Omit<EmployerNote, 'id' | 'createdAt' | 'updatedAt'>): EmployerNote {
  const stored = localStorage.getItem(STORAGE_KEY_NOTES);
  const notes = stored ? JSON.parse(stored) : [];
  
  const newNote: EmployerNote = {
    ...noteData,
    id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  notes.push(newNote);
  localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
  
  createActivity(
    noteData.employerId,
    'note-added',
    `Note added: ${noteData.category}`,
    noteData.content.substring(0, 100),
    { noteId: newNote.id, category: noteData.category },
    noteData.authorId,
    noteData.authorName
  );
  
  return newNote;
}

export function updateNote(noteId: string, updates: Partial<EmployerNote>): EmployerNote | null {
  const stored = localStorage.getItem(STORAGE_KEY_NOTES);
  if (!stored) return null;
  
  const notes = JSON.parse(stored);
  const index = notes.findIndex((n: EmployerNote) => n.id === noteId);
  
  if (index === -1) return null;
  
  notes[index] = {
    ...notes[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
  return notes[index];
}

export function deleteNote(noteId: string): boolean {
  const stored = localStorage.getItem(STORAGE_KEY_NOTES);
  if (!stored) return false;
  
  const notes = JSON.parse(stored);
  const filtered = notes.filter((n: EmployerNote) => n.id !== noteId);
  
  if (filtered.length === notes.length) return false;
  
  localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(filtered));
  return true;
}

// ============= Tasks =============

export function getEmployerTasks(employerId: string, includeCompleted = false): EmployerTask[] {
  const stored = localStorage.getItem(STORAGE_KEY_TASKS);
  const all = stored ? JSON.parse(stored) : [];
  const filtered = all.filter((t: EmployerTask) => {
    if (t.employerId !== employerId) return false;
    if (!includeCompleted && t.status === 'completed') return false;
    return true;
  });
  
  return filtered.sort((a, b) => {
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
}

export function createTask(taskData: Omit<EmployerTask, 'id' | 'createdAt'>): EmployerTask {
  const stored = localStorage.getItem(STORAGE_KEY_TASKS);
  const tasks = stored ? JSON.parse(stored) : [];
  
  const newTask: EmployerTask = {
    ...taskData,
    id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  
  tasks.push(newTask);
  localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  
  createActivity(
    taskData.employerId,
    'note-added',
    `Task created: ${taskData.title}`,
    `Priority: ${taskData.priority}, Due: ${new Date(taskData.dueDate).toLocaleDateString()}`,
    { taskId: newTask.id, priority: taskData.priority },
    taskData.createdBy,
    taskData.createdByName
  );
  
  return newTask;
}

export function updateTask(taskId: string, updates: Partial<EmployerTask>): EmployerTask | null {
  const stored = localStorage.getItem(STORAGE_KEY_TASKS);
  if (!stored) return null;
  
  const tasks = JSON.parse(stored);
  const index = tasks.findIndex((t: EmployerTask) => t.id === taskId);
  
  if (index === -1) return null;
  
  const wasCompleted = tasks[index].status === 'completed';
  const nowCompleted = updates.status === 'completed';
  
  tasks[index] = {
    ...tasks[index],
    ...updates,
    completedAt: nowCompleted && !wasCompleted ? new Date().toISOString() : tasks[index].completedAt,
  };
  
  localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  
  if (nowCompleted && !wasCompleted) {
    createActivity(
      tasks[index].employerId,
      'note-added',
      `Task completed: ${tasks[index].title}`,
      undefined,
      { taskId: tasks[index].id },
      undefined,
      undefined
    );
  }
  
  return tasks[index];
}

export function deleteTask(taskId: string): boolean {
  const stored = localStorage.getItem(STORAGE_KEY_TASKS);
  if (!stored) return false;
  
  const tasks = JSON.parse(stored);
  const filtered = tasks.filter((t: EmployerTask) => t.id !== taskId);
  
  if (filtered.length === tasks.length) return false;
  
  localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(filtered));
  return true;
}
