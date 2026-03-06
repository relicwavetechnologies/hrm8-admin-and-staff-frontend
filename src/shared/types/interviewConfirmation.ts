export interface InterviewConfirmation {
  interviewId: string;
  candidateEmail: string;
  status: 'pending' | 'accepted' | 'declined';
  respondedAt?: string;
  rescheduleRequested?: boolean;
  notes?: string;
  token: string;
}

export interface InterviewSlot {
  startTime: string;
  endTime: string;
  interviewerId: string;
  interviewerName: string;
  isAvailable: boolean;
  conflicts?: string[];
}
