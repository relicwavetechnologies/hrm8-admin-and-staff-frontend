import type {
  ConsultantNote,
  ConsultantTask,
  ConsultantActivity,
  ConsultantDocument,
  ConsultantActivityType,
} from '@/shared/types/consultantCRM';

const NOTES_KEY = 'consultant_notes';
const TASKS_KEY = 'consultant_tasks';
const ACTIVITIES_KEY = 'consultant_activities';
const DOCUMENTS_KEY = 'consultant_documents';

// Notes
export function getConsultantNotes(consultantId: string): ConsultantNote[] {
  const stored = localStorage.getItem(NOTES_KEY);
  const all: ConsultantNote[] = stored ? JSON.parse(stored) : [];
  return all.filter(n => n.consultantId === consultantId);
}

export function addConsultantNote(
  note: Omit<ConsultantNote, 'id' | 'createdAt' | 'updatedAt'>
): ConsultantNote {
  const stored = localStorage.getItem(NOTES_KEY);
  const all: ConsultantNote[] = stored ? JSON.parse(stored) : [];
  
  const newNote: ConsultantNote = {
    ...note,
    id: `note_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  all.push(newNote);
  localStorage.setItem(NOTES_KEY, JSON.stringify(all));
  
  createActivity(note.consultantId, 'note-added', 'Note added', {
    category: note.category,
    author: note.authorName,
  });
  
  return newNote;
}

export function updateConsultantNote(
  id: string,
  updates: Partial<ConsultantNote>
): ConsultantNote | null {
  const stored = localStorage.getItem(NOTES_KEY);
  const all: ConsultantNote[] = stored ? JSON.parse(stored) : [];
  const index = all.findIndex(n => n.id === id);
  
  if (index === -1) return null;
  
  all[index] = {
    ...all[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  localStorage.setItem(NOTES_KEY, JSON.stringify(all));
  return all[index];
}

export function deleteConsultantNote(id: string): boolean {
  const stored = localStorage.getItem(NOTES_KEY);
  const all: ConsultantNote[] = stored ? JSON.parse(stored) : [];
  const filtered = all.filter(n => n.id !== id);
  
  if (filtered.length === all.length) return false;
  
  localStorage.setItem(NOTES_KEY, JSON.stringify(filtered));
  return true;
}

// Tasks
export function getConsultantTasks(consultantId: string): ConsultantTask[] {
  const stored = localStorage.getItem(TASKS_KEY);
  const all: ConsultantTask[] = stored ? JSON.parse(stored) : [];
  return all.filter(t => t.consultantId === consultantId);
}

export function addConsultantTask(
  task: Omit<ConsultantTask, 'id' | 'createdAt'>
): ConsultantTask {
  const stored = localStorage.getItem(TASKS_KEY);
  const all: ConsultantTask[] = stored ? JSON.parse(stored) : [];
  
  const newTask: ConsultantTask = {
    ...task,
    id: `task_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  
  all.push(newTask);
  localStorage.setItem(TASKS_KEY, JSON.stringify(all));
  
  createActivity(task.consultantId, 'task-created', `Task created: ${task.title}`, {
    priority: task.priority,
    dueDate: task.dueDate,
  });
  
  return newTask;
}

export function updateConsultantTask(
  id: string,
  updates: Partial<ConsultantTask>
): ConsultantTask | null {
  const stored = localStorage.getItem(TASKS_KEY);
  const all: ConsultantTask[] = stored ? JSON.parse(stored) : [];
  const index = all.findIndex(t => t.id === id);
  
  if (index === -1) return null;
  
  const wasCompleted = all[index].status !== 'completed' && updates.status === 'completed';
  
  all[index] = { ...all[index], ...updates };
  if (wasCompleted) {
    all[index].completedAt = new Date().toISOString();
    createActivity(all[index].consultantId, 'task-completed', `Task completed: ${all[index].title}`);
  }
  
  localStorage.setItem(TASKS_KEY, JSON.stringify(all));
  return all[index];
}

export function deleteConsultantTask(id: string): boolean {
  const stored = localStorage.getItem(TASKS_KEY);
  const all: ConsultantTask[] = stored ? JSON.parse(stored) : [];
  const filtered = all.filter(t => t.id !== id);
  
  if (filtered.length === all.length) return false;
  
  localStorage.setItem(TASKS_KEY, JSON.stringify(filtered));
  return true;
}

// Activities
export function getConsultantActivities(consultantId: string): ConsultantActivity[] {
  const stored = localStorage.getItem(ACTIVITIES_KEY);
  const all: ConsultantActivity[] = stored ? JSON.parse(stored) : [];
  return all
    .filter(a => a.consultantId === consultantId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createActivity(
  consultantId: string,
  type: ConsultantActivityType,
  title: string,
  metadata?: Record<string, any>,
  userId?: string,
  userName?: string
): ConsultantActivity {
  const stored = localStorage.getItem(ACTIVITIES_KEY);
  const all: ConsultantActivity[] = stored ? JSON.parse(stored) : [];
  
  const activity: ConsultantActivity = {
    id: `activity_${Date.now()}_${Math.random()}`,
    consultantId,
    type,
    title,
    metadata,
    userId,
    userName,
    createdAt: new Date().toISOString(),
  };
  
  all.push(activity);
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(all));
  return activity;
}

// Documents
export function getConsultantDocuments(consultantId: string): ConsultantDocument[] {
  const stored = localStorage.getItem(DOCUMENTS_KEY);
  const all: ConsultantDocument[] = stored ? JSON.parse(stored) : [];
  return all
    .filter(d => d.consultantId === consultantId)
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
}

export function addConsultantDocument(
  doc: Omit<ConsultantDocument, 'id' | 'uploadedAt'>
): ConsultantDocument {
  const stored = localStorage.getItem(DOCUMENTS_KEY);
  const all: ConsultantDocument[] = stored ? JSON.parse(stored) : [];
  
  const newDoc: ConsultantDocument = {
    ...doc,
    id: `doc_${Date.now()}`,
    uploadedAt: new Date().toISOString(),
  };
  
  all.push(newDoc);
  localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(all));
  
  createActivity(doc.consultantId, 'document-uploaded', `Document uploaded: ${doc.name}`, {
    type: doc.type,
    fileName: doc.fileName,
  });
  
  return newDoc;
}

export function deleteConsultantDocument(id: string): boolean {
  const stored = localStorage.getItem(DOCUMENTS_KEY);
  const all: ConsultantDocument[] = stored ? JSON.parse(stored) : [];
  const filtered = all.filter(d => d.id !== id);
  
  if (filtered.length === all.length) return false;
  
  localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(filtered));
  return true;
}
