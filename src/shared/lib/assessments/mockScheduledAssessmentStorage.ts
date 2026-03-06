import { ScheduledAssessment, ScheduledAssessmentStatus } from '@/shared/types/scheduledAssessment';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'scheduled_assessments';

// Mock timezones
export const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
];

function getScheduledAssessments(): ScheduledAssessment[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : generateMockScheduledAssessments();
}

function saveScheduledAssessments(assessments: ScheduledAssessment[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assessments));
}

function generateMockScheduledAssessments(): ScheduledAssessment[] {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const mockData: ScheduledAssessment[] = [
    {
      id: uuidv4(),
      candidateId: 'cand-001',
      candidateName: 'Sarah Johnson',
      candidateEmail: 'sarah.johnson@email.com',
      jobId: 'job-001',
      jobTitle: 'Senior Software Engineer',
      assessmentType: 'cognitive',
      provider: 'testgorilla',
      passThreshold: 70,
      expiryDays: 7,
      customInstructions: 'Please complete this assessment at your earliest convenience.',
      scheduledDate: tomorrow.toISOString().split('T')[0],
      scheduledTime: '09:00',
      timezone: 'America/New_York',
      status: 'scheduled',
      createdBy: 'admin-001',
      createdByName: 'John Admin',
      createdAt: now.toISOString(),
      cost: 69,
    },
    {
      id: uuidv4(),
      candidateId: 'cand-002',
      candidateName: 'Michael Chen',
      candidateEmail: 'michael.chen@email.com',
      jobId: 'job-002',
      jobTitle: 'Full Stack Developer',
      assessmentType: 'technical-skills',
      provider: 'codility',
      passThreshold: 75,
      expiryDays: 5,
      scheduledDate: nextWeek.toISOString().split('T')[0],
      scheduledTime: '14:00',
      timezone: 'America/Los_Angeles',
      status: 'scheduled',
      createdBy: 'admin-001',
      createdByName: 'John Admin',
      createdAt: now.toISOString(),
      cost: 89,
    },
  ];

  saveScheduledAssessments(mockData);
  return mockData;
}

export function getAllScheduledAssessments(): ScheduledAssessment[] {
  return getScheduledAssessments();
}

export function getScheduledAssessmentById(id: string): ScheduledAssessment | undefined {
  return getScheduledAssessments().find(a => a.id === id);
}

export function createScheduledAssessment(
  assessment: Omit<ScheduledAssessment, 'id' | 'createdAt' | 'status'>
): ScheduledAssessment {
  const newAssessment: ScheduledAssessment = {
    ...assessment,
    id: uuidv4(),
    status: 'scheduled',
    createdAt: new Date().toISOString(),
  };

  const assessments = getScheduledAssessments();
  assessments.unshift(newAssessment);
  saveScheduledAssessments(assessments);

  return newAssessment;
}

export function updateScheduledAssessmentStatus(
  id: string,
  status: ScheduledAssessmentStatus,
  additionalData?: Partial<ScheduledAssessment>
): void {
  const assessments = getScheduledAssessments();
  const index = assessments.findIndex(a => a.id === id);

  if (index !== -1) {
    assessments[index] = {
      ...assessments[index],
      status,
      ...additionalData,
    };
    saveScheduledAssessments(assessments);
  }
}

export function cancelScheduledAssessment(id: string): void {
  updateScheduledAssessmentStatus(id, 'cancelled', {
    cancelledAt: new Date().toISOString(),
  });
}

export function deleteScheduledAssessment(id: string): void {
  const assessments = getScheduledAssessments().filter(a => a.id !== id);
  saveScheduledAssessments(assessments);
}

export function getUpcomingScheduledAssessments(): ScheduledAssessment[] {
  const now = new Date();
  return getScheduledAssessments().filter(a => {
    if (a.status !== 'scheduled') return false;
    const scheduledDateTime = new Date(`${a.scheduledDate}T${a.scheduledTime}`);
    return scheduledDateTime > now;
  });
}

// Mock function to simulate automatic sending
export function checkAndSendScheduledAssessments(): void {
  const now = new Date();
  const assessments = getScheduledAssessments();
  
  assessments.forEach(assessment => {
    if (assessment.status === 'scheduled') {
      const scheduledDateTime = new Date(`${assessment.scheduledDate}T${assessment.scheduledTime}`);
      
      // If scheduled time has passed, mark as sent
      if (scheduledDateTime <= now) {
        updateScheduledAssessmentStatus(assessment.id, 'sent', {
          sentAt: new Date().toISOString(),
        });
      }
    }
  });
}
