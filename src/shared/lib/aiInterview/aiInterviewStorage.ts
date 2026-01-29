import type { AIInterviewSession, InterviewStatus } from '@/shared/types/aiInterview';

const STORAGE_KEY = 'hrm8_ai_interviews';

function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
}

export function saveAIInterviewSession(session: AIInterviewSession): void {
  initializeStorage();
  const sessions = getAIInterviewSessions();
  const existingIndex = sessions.findIndex(s => s.id === session.id);
  
  if (existingIndex >= 0) {
    sessions[existingIndex] = { ...session, updatedAt: new Date().toISOString() };
  } else {
    sessions.push(session);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function getAIInterviewSessions(): AIInterviewSession[] {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function getAIInterviewById(id: string): AIInterviewSession | undefined {
  return getAIInterviewSessions().find(session => session.id === id);
}

export function getAIInterviewByToken(token: string): AIInterviewSession | undefined {
  return getAIInterviewSessions().find(session => session.invitationToken === token);
}

export function getAIInterviewsByCandidate(candidateId: string): AIInterviewSession[] {
  return getAIInterviewSessions().filter(session => session.candidateId === candidateId);
}

export function getAIInterviewsByJob(jobId: string): AIInterviewSession[] {
  return getAIInterviewSessions().filter(session => session.jobId === jobId);
}

export function getAIInterviewsByStatus(status: InterviewStatus): AIInterviewSession[] {
  return getAIInterviewSessions().filter(session => session.status === status);
}

export function updateAIInterviewSession(id: string, updates: Partial<AIInterviewSession>): void {
  const sessions = getAIInterviewSessions();
  const index = sessions.findIndex(s => s.id === id);
  
  if (index >= 0) {
    sessions[index] = {
      ...sessions[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }
}

export function deleteAIInterviewSession(id: string): void {
  const sessions = getAIInterviewSessions();
  const filtered = sessions.filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function getScheduledInterviews(): AIInterviewSession[] {
  return getAIInterviewsByStatus('scheduled');
}

export function getActiveInterviews(): AIInterviewSession[] {
  return getAIInterviewsByStatus('in-progress');
}

export function getCompletedInterviews(): AIInterviewSession[] {
  return getAIInterviewsByStatus('completed');
}
