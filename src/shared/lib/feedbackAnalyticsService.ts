import { getFeedbackRequests } from './feedbackRequestService';
import { FeedbackAnalytics } from '@/shared/types/feedbackAnalytics';

export function calculateFeedbackAnalytics(): FeedbackAnalytics {
  const requests = getFeedbackRequests();
  
  const completed = requests.filter(r => r.status === 'completed');
  const pending = requests.filter(r => r.status === 'pending');
  const overdue = requests.filter(r => r.status === 'overdue');
  
  // Calculate average response time for completed requests
  let totalResponseTime = 0;
  let responseCount = 0;
  
  completed.forEach(req => {
    if (req.completedAt) {
      const requested = new Date(req.requestedAt).getTime();
      const completedTime = new Date(req.completedAt).getTime();
      const hours = (completedTime - requested) / (1000 * 60 * 60);
      totalResponseTime += hours;
      responseCount++;
    }
  });
  
  const averageResponseTime = responseCount > 0 ? totalResponseTime / responseCount : 0;
  
  // Response time by member
  const responseTimeByMember: Record<string, number> = {};
  const memberResponseCounts: Record<string, number> = {};
  
  completed.forEach(req => {
    if (req.completedAt) {
      const requested = new Date(req.requestedAt).getTime();
      const completedTime = new Date(req.completedAt).getTime();
      const hours = (completedTime - requested) / (1000 * 60 * 60);
      
      if (!responseTimeByMember[req.requestedToName]) {
        responseTimeByMember[req.requestedToName] = 0;
        memberResponseCounts[req.requestedToName] = 0;
      }
      
      responseTimeByMember[req.requestedToName] += hours;
      memberResponseCounts[req.requestedToName]++;
    }
  });
  
  // Average by member
  Object.keys(responseTimeByMember).forEach(member => {
    responseTimeByMember[member] = responseTimeByMember[member] / memberResponseCounts[member];
  });
  
  // Requests by candidate
  const requestsByCandidate: Record<string, number> = {};
  requests.forEach(req => {
    requestsByCandidate[req.candidateName] = (requestsByCandidate[req.candidateName] || 0) + 1;
  });
  
  // Requests by role
  const requestsByRole: Record<string, number> = {};
  requests.forEach(req => {
    const role = req.requestedTo.split('-')[0]; // Mock role extraction
    requestsByRole[role] = (requestsByRole[role] || 0) + 1;
  });
  
  // Completion rate by member
  const completionRateByMember: Record<string, { completed: number; total: number }> = {};
  requests.forEach(req => {
    if (!completionRateByMember[req.requestedToName]) {
      completionRateByMember[req.requestedToName] = { completed: 0, total: 0 };
    }
    completionRateByMember[req.requestedToName].total++;
    if (req.status === 'completed') {
      completionRateByMember[req.requestedToName].completed++;
    }
  });
  
  return {
    totalRequests: requests.length,
    completedRequests: completed.length,
    pendingRequests: pending.length,
    overdueRequests: overdue.length,
    completionRate: requests.length > 0 ? (completed.length / requests.length) * 100 : 0,
    averageResponseTime,
    responseTimeByMember,
    requestsByCandidate,
    requestsByRole,
    completionRateByMember,
  };
}
