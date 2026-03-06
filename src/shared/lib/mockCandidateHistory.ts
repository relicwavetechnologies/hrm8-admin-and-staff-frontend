export interface CandidateHistoryEvent {
  id: string;
  candidateId: string;
  eventType: 'status_change' | 'job_application' | 'interview' | 'email_sent' | 'note_added' | 'document_uploaded' | 'profile_updated';
  title: string;
  description?: string;
  timestamp: Date;
  userId?: string;
  userName?: string;
  metadata?: Record<string, any>;
}

const STORAGE_KEY = 'hrm8_candidate_history';

function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockHistory));
  }
}

const mockHistory: CandidateHistoryEvent[] = [
  {
    id: 'hist-1',
    candidateId: '1',
    eventType: 'profile_updated',
    title: 'Profile Created',
    description: 'Candidate profile was created',
    timestamp: new Date('2024-01-01'),
    userName: 'System',
  },
  {
    id: 'hist-2',
    candidateId: '1',
    eventType: 'job_application',
    title: 'Applied to Senior Frontend Developer',
    description: 'Submitted application to Tech Corp',
    timestamp: new Date('2024-01-15'),
    userName: 'Jane Smith',
  },
  {
    id: 'hist-3',
    candidateId: '1',
    eventType: 'status_change',
    title: 'Status Changed',
    description: 'Status changed from Applied to Screening',
    timestamp: new Date('2024-01-16'),
    userName: 'Jane Smith',
  },
  {
    id: 'hist-4',
    candidateId: '1',
    eventType: 'email_sent',
    title: 'Interview Invitation Sent',
    description: 'Sent email invitation for technical interview',
    timestamp: new Date('2024-01-18'),
    userName: 'Jane Smith',
  },
  {
    id: 'hist-5',
    candidateId: '1',
    eventType: 'interview',
    title: 'Technical Interview Completed',
    description: 'Completed 60-minute technical interview',
    timestamp: new Date('2024-01-20'),
    userName: 'Mike Johnson',
  },
];

export function getCandidateHistory(candidateId: string): CandidateHistoryEvent[] {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  return JSON.parse(data)
    .filter((event: any) => event.candidateId === candidateId)
    .map((event: any) => ({
      ...event,
      timestamp: new Date(event.timestamp),
    }))
    .sort((a: CandidateHistoryEvent, b: CandidateHistoryEvent) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
}

export function addHistoryEvent(event: Omit<CandidateHistoryEvent, 'id'>): CandidateHistoryEvent {
  initializeStorage();
  const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const newEvent: CandidateHistoryEvent = {
    ...event,
    id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
  history.push(newEvent);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return newEvent;
}