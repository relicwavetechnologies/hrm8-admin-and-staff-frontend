/**
 * LocalStorage utilities for Employer CRM data
 */

import type { 
  EmployerContact, 
  EmployerNote, 
  EmployerActivity, 
  EmployerDocument,
  EmployerSubscriptionHistory,
  EmployerTask 
} from "@/shared/types/employerCRM";

const STORAGE_KEYS = {
  CONTACTS: 'employer_contacts',
  NOTES: 'employer_notes',
  ACTIVITIES: 'employer_activities',
  DOCUMENTS: 'employer_documents',
  SUBSCRIPTION_HISTORY: 'employer_subscription_history',
  TASKS: 'employer_tasks',
} as const;

// Generic storage utilities
function getFromStorage<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading ${key} from storage:`, error);
    return [];
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
}

// Contacts
export function getEmployerContacts(employerId?: string): EmployerContact[] {
  const contacts = getFromStorage<EmployerContact>(STORAGE_KEYS.CONTACTS);
  return employerId ? contacts.filter(c => c.employerId === employerId) : contacts;
}

export function createEmployerContact(contact: EmployerContact): void {
  const contacts = getFromStorage<EmployerContact>(STORAGE_KEYS.CONTACTS);
  contacts.push(contact);
  saveToStorage(STORAGE_KEYS.CONTACTS, contacts);
}

export function updateEmployerContact(id: string, updates: Partial<EmployerContact>): void {
  const contacts = getFromStorage<EmployerContact>(STORAGE_KEYS.CONTACTS);
  const index = contacts.findIndex(c => c.id === id);
  if (index !== -1) {
    contacts[index] = { ...contacts[index], ...updates, updatedAt: new Date().toISOString() };
    saveToStorage(STORAGE_KEYS.CONTACTS, contacts);
  }
}

export function deleteEmployerContact(id: string): void {
  const contacts = getFromStorage<EmployerContact>(STORAGE_KEYS.CONTACTS);
  saveToStorage(STORAGE_KEYS.CONTACTS, contacts.filter(c => c.id !== id));
}

// Notes
export function getEmployerNotes(employerId?: string): EmployerNote[] {
  const notes = getFromStorage<EmployerNote>(STORAGE_KEYS.NOTES);
  return employerId ? notes.filter(n => n.employerId === employerId) : notes;
}

export function createEmployerNote(note: EmployerNote): void {
  const notes = getFromStorage<EmployerNote>(STORAGE_KEYS.NOTES);
  notes.push(note);
  saveToStorage(STORAGE_KEYS.NOTES, notes);
}

export function updateEmployerNote(id: string, updates: Partial<EmployerNote>): void {
  const notes = getFromStorage<EmployerNote>(STORAGE_KEYS.NOTES);
  const index = notes.findIndex(n => n.id === id);
  if (index !== -1) {
    notes[index] = { ...notes[index], ...updates, updatedAt: new Date().toISOString() };
    saveToStorage(STORAGE_KEYS.NOTES, notes);
  }
}

export function deleteEmployerNote(id: string): void {
  const notes = getFromStorage<EmployerNote>(STORAGE_KEYS.NOTES);
  saveToStorage(STORAGE_KEYS.NOTES, notes.filter(n => n.id !== id));
}

// Activities
export function getEmployerActivities(employerId?: string): EmployerActivity[] {
  const activities = getFromStorage<EmployerActivity>(STORAGE_KEYS.ACTIVITIES);
  const filtered = employerId ? activities.filter(a => a.employerId === employerId) : activities;
  return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createEmployerActivity(activity: EmployerActivity): void {
  const activities = getFromStorage<EmployerActivity>(STORAGE_KEYS.ACTIVITIES);
  activities.push(activity);
  saveToStorage(STORAGE_KEYS.ACTIVITIES, activities);
}

// Documents
export function getEmployerDocuments(employerId?: string): EmployerDocument[] {
  const documents = getFromStorage<EmployerDocument>(STORAGE_KEYS.DOCUMENTS);
  return employerId ? documents.filter(d => d.employerId === employerId) : documents;
}

export function createEmployerDocument(document: EmployerDocument): void {
  const documents = getFromStorage<EmployerDocument>(STORAGE_KEYS.DOCUMENTS);
  documents.push(document);
  saveToStorage(STORAGE_KEYS.DOCUMENTS, documents);
}

export function deleteEmployerDocument(id: string): void {
  const documents = getFromStorage<EmployerDocument>(STORAGE_KEYS.DOCUMENTS);
  saveToStorage(STORAGE_KEYS.DOCUMENTS, documents.filter(d => d.id !== id));
}

// Subscription History
export function getSubscriptionHistory(employerId?: string): EmployerSubscriptionHistory[] {
  const history = getFromStorage<EmployerSubscriptionHistory>(STORAGE_KEYS.SUBSCRIPTION_HISTORY);
  const filtered = employerId ? history.filter(h => h.employerId === employerId) : history;
  return filtered.sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());
}

export function createSubscriptionHistory(record: EmployerSubscriptionHistory): void {
  const history = getFromStorage<EmployerSubscriptionHistory>(STORAGE_KEYS.SUBSCRIPTION_HISTORY);
  history.push(record);
  saveToStorage(STORAGE_KEYS.SUBSCRIPTION_HISTORY, history);
}

// Tasks
export function getEmployerTasks(employerId?: string): EmployerTask[] {
  const tasks = getFromStorage<EmployerTask>(STORAGE_KEYS.TASKS);
  return employerId ? tasks.filter(t => t.employerId === employerId) : tasks;
}

export function createEmployerTask(task: EmployerTask): void {
  const tasks = getFromStorage<EmployerTask>(STORAGE_KEYS.TASKS);
  tasks.push(task);
  saveToStorage(STORAGE_KEYS.TASKS, tasks);
}

export function updateEmployerTask(id: string, updates: Partial<EmployerTask>): void {
  const tasks = getFromStorage<EmployerTask>(STORAGE_KEYS.TASKS);
  const index = tasks.findIndex(t => t.id === id);
  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...updates };
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
  }
}

export function deleteEmployerTask(id: string): void {
  const tasks = getFromStorage<EmployerTask>(STORAGE_KEYS.TASKS);
  saveToStorage(STORAGE_KEYS.TASKS, tasks.filter(t => t.id !== id));
}
