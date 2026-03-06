import type { AIReferenceCheckSession } from '@/shared/types/aiReferenceCheck';

const AI_SESSIONS_KEY = 'hrm8_ai_reference_sessions';

function initializeStorage() {
  if (!localStorage.getItem(AI_SESSIONS_KEY)) {
    localStorage.setItem(AI_SESSIONS_KEY, JSON.stringify([]));
  }
}

export function saveAISession(session: AIReferenceCheckSession): void {
  initializeStorage();
  const sessions = getAISessions();
  sessions.push(session);
  localStorage.setItem(AI_SESSIONS_KEY, JSON.stringify(sessions));
}

export function getAISessions(): AIReferenceCheckSession[] {
  initializeStorage();
  const data = localStorage.getItem(AI_SESSIONS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getAISessionById(id: string): AIReferenceCheckSession | undefined {
  return getAISessions().find(session => session.id === id);
}

export function getAISessionsByReferee(refereeId: string): AIReferenceCheckSession[] {
  return getAISessions().filter(session => session.refereeId === refereeId);
}

export function getAISessionsByCandidate(candidateId: string): AIReferenceCheckSession[] {
  return getAISessions().filter(session => session.candidateId === candidateId);
}

export function getAISessionsByBackgroundCheck(backgroundCheckId: string): AIReferenceCheckSession[] {
  return getAISessions().filter(session => session.backgroundCheckId === backgroundCheckId);
}

export function updateAISession(id: string, updates: Partial<AIReferenceCheckSession>): void {
  const sessions = getAISessions();
  const index = sessions.findIndex(session => session.id === id);
  if (index !== -1) {
    sessions[index] = {
      ...sessions[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(AI_SESSIONS_KEY, JSON.stringify(sessions));
  }
}

export function deleteAISession(id: string): void {
  const sessions = getAISessions();
  const filtered = sessions.filter(session => session.id !== id);
  localStorage.setItem(AI_SESSIONS_KEY, JSON.stringify(filtered));
}

export function getActiveAISessions(): AIReferenceCheckSession[] {
  return getAISessions().filter(session => 
    session.status === 'scheduled' || session.status === 'in-progress'
  );
}

export function getCompletedAISessions(): AIReferenceCheckSession[] {
  return getAISessions().filter(session => session.status === 'completed');
}

export function getAISessionsByStatus(status: AIReferenceCheckSession['status']): AIReferenceCheckSession[] {
  return getAISessions().filter(session => session.status === status);
}
