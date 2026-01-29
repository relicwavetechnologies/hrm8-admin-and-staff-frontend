import type { Interview } from '@/shared/types/interview';

const STORAGE_KEY = 'hrm8_interviews';

const mockInterviews: Interview[] = [
  {
    id: 'int-1',
    applicationId: 'app-1',
    candidateId: 'cand-1',
    candidateName: 'Sarah Johnson',
    jobId: 'job-1',
    jobTitle: 'Senior Frontend Developer',
    interviewers: [
      { userId: 'user-1', name: 'John Smith', email: 'john@company.com', role: 'interviewer', responseStatus: 'accepted' },
      { userId: 'user-2', name: 'Emily Davis', email: 'emily@company.com', role: 'interviewer', responseStatus: 'pending' },
    ],
    scheduledDate: '2025-01-20',
    scheduledTime: '10:00 AM',
    duration: 60,
    type: 'video',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    status: 'scheduled',
    agenda: 'Technical assessment and cultural fit discussion',
    feedback: [],
    createdBy: 'user-1',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-10T10:00:00Z',
  },
  {
    id: 'int-2',
    applicationId: 'app-2',
    candidateId: 'cand-2',
    candidateName: 'Michael Chen',
    jobId: 'job-2',
    jobTitle: 'Product Manager',
    interviewers: [
      { userId: 'user-3', name: 'Sarah Williams', email: 'sarah@company.com', role: 'interviewer', responseStatus: 'accepted' },
    ],
    scheduledDate: '2025-01-22',
    scheduledTime: '2:00 PM',
    duration: 45,
    type: 'phone',
    status: 'scheduled',
    agenda: 'Initial phone screening',
    feedback: [],
    createdBy: 'user-1',
    createdAt: '2025-01-11T14:00:00Z',
    updatedAt: '2025-01-11T14:00:00Z',
  },
  {
    id: 'int-3',
    applicationId: 'app-3',
    candidateId: 'cand-3',
    candidateName: 'Emma Davis',
    jobId: 'job-1',
    jobTitle: 'Senior Frontend Developer',
    interviewers: [
      { userId: 'user-1', name: 'John Smith', email: 'john@company.com', role: 'interviewer', responseStatus: 'accepted' },
      { userId: 'user-4', name: 'Mark Johnson', email: 'mark@company.com', role: 'interviewer', responseStatus: 'accepted' },
      { userId: 'user-5', name: 'Lisa Brown', email: 'lisa@company.com', role: 'organizer', responseStatus: 'accepted' },
    ],
    scheduledDate: '2025-01-15',
    scheduledTime: '11:00 AM',
    duration: 90,
    type: 'panel',
    meetingLink: 'https://zoom.us/j/123456789',
    status: 'completed',
    agenda: 'Final round panel interview',
    feedback: [
      {
        interviewerId: 'user-1',
        interviewerName: 'John Smith',
        technicalSkills: 5,
        communication: 4,
        cultureFit: 5,
        problemSolving: 5,
        overallRating: 5,
        strengths: 'Excellent technical skills and problem-solving abilities',
        concerns: 'None',
        recommendation: 'strong-yes',
        notes: 'Outstanding candidate, highly recommend for the position',
        submittedAt: '2025-01-15T14:00:00Z',
      },
    ],
    rating: 4.8,
    recommendation: 'strong-yes',
    createdBy: 'user-1',
    createdAt: '2025-01-08T09:00:00Z',
    updatedAt: '2025-01-15T14:00:00Z',
  },
  {
    id: 'int-4',
    applicationId: 'app-4',
    candidateId: 'cand-4',
    candidateName: 'James Wilson',
    jobId: 'job-3',
    jobTitle: 'UX Designer',
    interviewers: [
      { userId: 'user-6', name: 'Anna Taylor', email: 'anna@company.com', role: 'interviewer', responseStatus: 'accepted' },
    ],
    scheduledDate: '2025-01-12',
    scheduledTime: '3:00 PM',
    duration: 60,
    type: 'in-person',
    location: '123 Main St, Building A, Floor 5',
    status: 'cancelled',
    agenda: 'Portfolio review and design challenge',
    feedback: [],
    createdBy: 'user-1',
    createdAt: '2025-01-05T10:00:00Z',
    updatedAt: '2025-01-12T10:00:00Z',
  },
  {
    id: 'int-5',
    applicationId: 'app-5',
    candidateId: 'cand-5',
    candidateName: 'Lisa Anderson',
    jobId: 'job-4',
    jobTitle: 'Backend Engineer',
    interviewers: [
      { userId: 'user-7', name: 'David Kim', email: 'david@company.com', role: 'interviewer', responseStatus: 'accepted' },
    ],
    scheduledDate: '2025-01-18',
    scheduledTime: '9:00 AM',
    duration: 30,
    type: 'phone',
    status: 'no-show',
    agenda: 'Initial screening call',
    feedback: [],
    createdBy: 'user-1',
    createdAt: '2025-01-09T11:00:00Z',
    updatedAt: '2025-01-18T09:30:00Z',
  },
];

function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockInterviews));
  }
}

export function getInterviews(): Interview[] {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function getInterviewById(id: string): Interview | undefined {
  return getInterviews().find(i => i.id === id);
}

export function getInterviewsByApplication(applicationId: string): Interview[] {
  return getInterviews().filter(i => i.applicationId === applicationId);
}

export function getInterviewsByDate(date: Date): Interview[] {
  const dateStr = date.toISOString().split('T')[0];
  return getInterviews().filter(i => i.scheduledDate.startsWith(dateStr));
}

export function saveInterview(interview: Interview): void {
  const interviews = getInterviews();
  interviews.push(interview);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(interviews));
}

export function updateInterview(id: string, updates: Partial<Interview>): void {
  const interviews = getInterviews();
  const index = interviews.findIndex(i => i.id === id);
  if (index !== -1) {
    interviews[index] = { ...interviews[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(interviews));
  }
}

export function deleteInterview(id: string): void {
  const interviews = getInterviews();
  const filtered = interviews.filter(i => i.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}
