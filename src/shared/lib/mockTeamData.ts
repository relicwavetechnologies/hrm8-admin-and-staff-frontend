import { TeamMember, FeedbackRequest, NotificationPreference } from '@/shared/types/feedbackRequest';

export const mockTeamMembers: TeamMember[] = [
  {
    id: 'user-1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    role: 'Senior Engineer',
    department: 'Engineering',
  },
  {
    id: 'user-2',
    name: 'Michael Chen',
    email: 'michael.chen@company.com',
    role: 'Engineering Manager',
    department: 'Engineering',
  },
  {
    id: 'user-3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@company.com',
    role: 'HR Manager',
    department: 'HR',
  },
  {
    id: 'user-4',
    name: 'David Park',
    email: 'david.park@company.com',
    role: 'CTO',
    department: 'Engineering',
  },
  {
    id: 'user-5',
    name: 'Jessica Martinez',
    email: 'jessica.martinez@company.com',
    role: 'Tech Lead',
    department: 'Engineering',
  },
];

export const mockFeedbackRequests: FeedbackRequest[] = [
  {
    id: 'req-1',
    candidateId: 'candidate-1',
    candidateName: 'John Doe',
    requestedBy: 'user-4',
    requestedByName: 'David Park',
    requestedTo: 'user-1',
    requestedToName: 'Sarah Johnson',
    requestedToEmail: 'sarah.johnson@company.com',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    message: 'Please review the technical interview for this senior engineer candidate.',
    status: 'completed',
    requestedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'req-2',
    candidateId: 'candidate-1',
    candidateName: 'John Doe',
    requestedBy: 'user-4',
    requestedByName: 'David Park',
    requestedTo: 'user-5',
    requestedToName: 'Jessica Martinez',
    requestedToEmail: 'jessica.martinez@company.com',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    message: 'Can you provide feedback on the system design discussion?',
    status: 'pending',
    requestedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockNotificationPreferences: NotificationPreference[] = [
  {
    userId: 'current-user',
    emailOnRequest: true,
    emailReminders: true,
    reminderDaysBefore: 2,
    dailyDigest: false,
  },
];

export function initializeMockTeamData() {
  const TEAM_KEY = 'team_members';
  const REQUESTS_KEY = 'feedback_requests';
  const PREFS_KEY = 'notification_preferences';

  if (!localStorage.getItem(TEAM_KEY)) {
    localStorage.setItem(TEAM_KEY, JSON.stringify(mockTeamMembers));
  }
  
  if (!localStorage.getItem(REQUESTS_KEY)) {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(mockFeedbackRequests));
  }
  
  if (!localStorage.getItem(PREFS_KEY)) {
    localStorage.setItem(PREFS_KEY, JSON.stringify(mockNotificationPreferences));
  }
}
