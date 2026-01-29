import { getAIInterviewSessions } from './aiInterviewStorage';

export function getAIInterviewStats() {
  const sessions = getAIInterviewSessions();
  
  const completed = sessions.filter(s => s.status === 'completed').length;
  const total = sessions.length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  // Mock average score calculation
  const avgScore = 78; // Mock value since overallScore doesn't exist in session type yet
  
  return {
    total,
    completed,
    inProgress: sessions.filter(s => s.status === 'in-progress').length,
    scheduled: sessions.filter(s => s.status === 'scheduled').length,
    completionRate,
    avgScore,
    avgDuration: 32 // Mock average duration in minutes
  };
}
