import { FeedbackRequest, TeamMember, NotificationPreference } from '@/shared/types/feedbackRequest';

const TEAM_KEY = 'team_members';
const REQUESTS_KEY = 'feedback_requests';
const PREFS_KEY = 'notification_preferences';

export function getTeamMembers(): TeamMember[] {
  const data = localStorage.getItem(TEAM_KEY);
  return data ? JSON.parse(data) : [];
}

export function getFeedbackRequests(): FeedbackRequest[] {
  const data = localStorage.getItem(REQUESTS_KEY);
  const requests: FeedbackRequest[] = data ? JSON.parse(data) : [];
  
  // Update overdue status
  return requests.map(req => {
    if (req.status === 'pending' && new Date(req.dueDate) < new Date()) {
      return { ...req, status: 'overdue' as const };
    }
    return req;
  });
}

export function getRequestsByCandidateId(candidateId: string): FeedbackRequest[] {
  return getFeedbackRequests().filter(req => req.candidateId === candidateId);
}

export function getRequestsByUserId(userId: string): FeedbackRequest[] {
  return getFeedbackRequests().filter(req => req.requestedTo === userId);
}

export function createFeedbackRequest(request: Omit<FeedbackRequest, 'id' | 'requestedAt' | 'status'>): FeedbackRequest {
  const requests = getFeedbackRequests();
  const newRequest: FeedbackRequest = {
    ...request,
    id: `req-${Date.now()}`,
    requestedAt: new Date().toISOString(),
    status: 'pending',
  };
  
  requests.push(newRequest);
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  
  // Simulate email notification
  console.log(`📧 Email sent to ${newRequest.requestedToEmail}: Feedback requested for ${newRequest.candidateName}`);
  
  return newRequest;
}

export function createBulkFeedbackRequests(
  requestsData: Omit<FeedbackRequest, 'id' | 'requestedAt' | 'status'>[]
): FeedbackRequest[] {
  const existingRequests = getFeedbackRequests();
  const baseTimestamp = Date.now();
  
  const newRequests: FeedbackRequest[] = requestsData.map((request, index) => ({
    ...request,
    id: `req-${baseTimestamp}-${index}`,
    requestedAt: new Date().toISOString(),
    status: 'pending',
  }));
  
  existingRequests.push(...newRequests);
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(existingRequests));
  
  // Simulate bulk email notifications
  console.log(`📧 Bulk emails sent to ${newRequests.length} team members for ${requestsData[0]?.candidateName || 'candidate'}`);
  newRequests.forEach(req => {
    console.log(`   → ${req.requestedToEmail}`);
  });
  
  return newRequests;
}

export function completeRequest(requestId: string): void {
  const requests = getFeedbackRequests();
  const updated = requests.map(req => 
    req.id === requestId 
      ? { ...req, status: 'completed' as const, completedAt: new Date().toISOString() }
      : req
  );
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(updated));
}

export function sendReminder(requestId: string): void {
  const requests = getFeedbackRequests();
  const updated = requests.map(req => 
    req.id === requestId 
      ? { ...req, reminderSent: true }
      : req
  );
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(updated));
  
  const request = updated.find(r => r.id === requestId);
  if (request) {
    console.log(`📧 Reminder sent to ${request.requestedToEmail}: Feedback still needed for ${request.candidateName}`);
  }
}

export function getNotificationPreferences(userId: string): NotificationPreference {
  const data = localStorage.getItem(PREFS_KEY);
  const prefs: NotificationPreference[] = data ? JSON.parse(data) : [];
  
  const userPref = prefs.find(p => p.userId === userId);
  return userPref || {
    userId,
    emailOnRequest: true,
    emailReminders: true,
    reminderDaysBefore: 2,
    dailyDigest: false,
  };
}

export function updateNotificationPreferences(preferences: NotificationPreference): void {
  const data = localStorage.getItem(PREFS_KEY);
  const prefs: NotificationPreference[] = data ? JSON.parse(data) : [];
  
  const index = prefs.findIndex(p => p.userId === preferences.userId);
  if (index >= 0) {
    prefs[index] = preferences;
  } else {
    prefs.push(preferences);
  }
  
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}
