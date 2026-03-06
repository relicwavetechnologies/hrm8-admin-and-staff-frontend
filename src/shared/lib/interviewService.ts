export interface Interview {
  id: string;
  jobId: string;
  jobTitle: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  interviewerIds: string[];
  interviewerNames: string[];
  type: 'phone' | 'video' | 'in-person' | 'technical' | 'panel';
  round: number;
  scheduledDate: string;
  duration: number; // in minutes
  location?: string;
  meetingLink?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show' | 'rescheduled';
  notes?: string;
  feedback?: InterviewFeedback[];
  createdAt: string;
  updatedAt: string;
}

export interface InterviewFeedback {
  interviewerId: string;
  interviewerName: string;
  rating: number; // 1-5
  recommendation: 'strong-hire' | 'hire' | 'neutral' | 'no-hire' | 'strong-no-hire';
  strengths: string[];
  concerns: string[];
  notes: string;
  submittedAt: string;
}

export interface InterviewSlot {
  date: string;
  startTime: string;
  endTime: string;
  interviewerId: string;
  available: boolean;
}

// Mock data
const mockInterviews: Interview[] = [
  {
    id: '1',
    jobId: '1',
    jobTitle: 'Senior Software Engineer',
    candidateId: 'c1',
    candidateName: 'Sarah Johnson',
    candidateEmail: 'sarah.j@email.com',
    interviewerIds: ['i1', 'i2'],
    interviewerNames: ['John Doe', 'Jane Smith'],
    type: 'video',
    round: 1,
    scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 60,
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    status: 'scheduled',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    jobId: '1',
    jobTitle: 'Senior Software Engineer',
    candidateId: 'c2',
    candidateName: 'Michael Chen',
    candidateEmail: 'm.chen@email.com',
    interviewerIds: ['i1'],
    interviewerNames: ['John Doe'],
    type: 'technical',
    round: 2,
    scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 90,
    meetingLink: 'https://meet.google.com/xyz-abcd-efg',
    status: 'scheduled',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function getInterviews(filters?: {
  jobId?: string;
  candidateId?: string;
  status?: Interview['status'];
  startDate?: string;
  endDate?: string;
}): Interview[] {
  let filtered = [...mockInterviews];

  if (filters?.jobId) {
    filtered = filtered.filter((i) => i.jobId === filters.jobId);
  }
  if (filters?.candidateId) {
    filtered = filtered.filter((i) => i.candidateId === filters.candidateId);
  }
  if (filters?.status) {
    filtered = filtered.filter((i) => i.status === filters.status);
  }
  if (filters?.startDate) {
    filtered = filtered.filter((i) => i.scheduledDate >= filters.startDate!);
  }
  if (filters?.endDate) {
    filtered = filtered.filter((i) => i.scheduledDate <= filters.endDate!);
  }

  return filtered.sort((a, b) => 
    new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
  );
}

export function scheduleInterview(
  interview: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>
): Interview {
  const newInterview: Interview = {
    ...interview,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockInterviews.push(newInterview);
  return newInterview;
}

export function updateInterview(
  id: string,
  updates: Partial<Interview>
): Interview | null {
  const index = mockInterviews.findIndex((i) => i.id === id);
  if (index === -1) return null;

  mockInterviews[index] = {
    ...mockInterviews[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  return mockInterviews[index];
}

export function cancelInterview(id: string): boolean {
  return updateInterview(id, { status: 'cancelled' }) !== null;
}

export function submitFeedback(
  interviewId: string,
  feedback: InterviewFeedback
): Interview | null {
  const interview = mockInterviews.find((i) => i.id === interviewId);
  if (!interview) return null;

  const existingFeedback = interview.feedback || [];
  const updatedFeedback = [
    ...existingFeedback.filter((f) => f.interviewerId !== feedback.interviewerId),
    feedback,
  ];

  return updateInterview(interviewId, { feedback: updatedFeedback });
}

export function getAvailableSlots(
  interviewerId: string,
  date: string
): InterviewSlot[] {
  // Mock available slots
  const slots: InterviewSlot[] = [];
  const hours = [9, 10, 11, 13, 14, 15, 16];

  hours.forEach((hour) => {
    slots.push({
      date,
      startTime: `${hour.toString().padStart(2, '0')}:00`,
      endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
      interviewerId,
      available: Math.random() > 0.3, // 70% chance of being available
    });
  });

  return slots;
}

export function getInterviewStats(jobId?: string) {
  const interviews = jobId ? getInterviews({ jobId }) : mockInterviews;

  return {
    total: interviews.length,
    scheduled: interviews.filter((i) => i.status === 'scheduled').length,
    completed: interviews.filter((i) => i.status === 'completed').length,
    cancelled: interviews.filter((i) => i.status === 'cancelled').length,
    upcoming: interviews.filter(
      (i) => i.status === 'scheduled' && new Date(i.scheduledDate) > new Date()
    ).length,
  };
}
