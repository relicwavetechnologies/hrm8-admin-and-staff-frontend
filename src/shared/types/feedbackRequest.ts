export interface FeedbackRequest {
  id: string;
  candidateId: string;
  candidateName: string;
  requestedBy: string;
  requestedByName: string;
  requestedTo: string;
  requestedToName: string;
  requestedToEmail: string;
  dueDate: string;
  message?: string;
  status: 'pending' | 'completed' | 'overdue';
  requestedAt: string;
  completedAt?: string;
  reminderSent?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

export interface NotificationPreference {
  userId: string;
  emailOnRequest: boolean;
  emailReminders: boolean;
  reminderDaysBefore: number;
  dailyDigest: boolean;
}
