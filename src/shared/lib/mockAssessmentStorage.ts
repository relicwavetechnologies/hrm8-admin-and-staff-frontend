import type { Assessment } from '@/shared/types/assessment';

const STORAGE_KEY = 'hrm8_assessments';
const VERSION_KEY = 'hrm8_assessments_version';
const CURRENT_VERSION = '1.3'; // Update this when mock data structure changes

const mockAssessments: Assessment[] = [
  {
    id: 'asmt-001',
    candidateId: 'cand-001',
    candidateName: 'Sarah Johnson',
    candidateEmail: 'sarah.johnson@example.com',
    jobId: 'job-001',
    jobTitle: 'Senior Software Engineer',
    employerId: 'emp-001',
    employerName: 'TechCorp Solutions',
    employerLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=TechCorp',
    applicationId: 'app-001',
    assessmentType: 'technical-skills',
    provider: 'codility',
    status: 'completed',
    invitedBy: 'rec-001',
    invitedByName: 'Michael Chen',
    invitedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    completedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    result: {
      assessmentType: 'technical-skills',
      score: 87,
      percentile: 92,
      status: 'passed',
      completedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      timeSpent: 85,
      details: {
        categoryScores: { 'Algorithms': 90, 'Data Structures': 85, 'System Design': 86 },
        strengths: ['Problem solving', 'Code optimization'],
        weaknesses: ['Edge case handling']
      }
    },
    overallScore: 87,
    passed: true,
    passThreshold: 70,
    invitationToken: 'token-001',
    remindersSent: 1,
    lastReminderDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    cost: 89,
    paymentStatus: 'paid',
    country: 'United States',
    region: 'California',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'asmt-002',
    candidateId: 'cand-002',
    candidateName: 'David Martinez',
    candidateEmail: 'david.martinez@example.com',
    jobId: 'job-002',
    jobTitle: 'Marketing Manager',
    employerId: 'emp-002',
    employerName: 'InnovateCo',
    employerLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=InnovateCo',
    applicationId: 'app-002',
    assessmentType: 'personality',
    provider: 'shl',
    status: 'in-progress',
    invitedBy: 'rec-002',
    invitedByName: 'Emily Rodriguez',
    invitedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    passThreshold: 65,
    invitationToken: 'token-002',
    remindersSent: 0,
    cost: 59,
    paymentStatus: 'paid',
    country: 'United States',
    region: 'Texas',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'asmt-003',
    candidateId: 'cand-003',
    candidateName: 'Jennifer Lee',
    candidateEmail: 'jennifer.lee@example.com',
    jobId: 'job-003',
    jobTitle: 'Data Analyst',
    employerId: 'emp-003',
    employerName: 'DataFlow Analytics',
    employerLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=DataFlow',
    applicationId: 'app-003',
    assessmentType: 'cognitive',
    provider: 'criteria',
    status: 'invited',
    invitedBy: 'rec-001',
    invitedByName: 'Michael Chen',
    invitedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    passThreshold: 75,
    invitationToken: 'token-003',
    remindersSent: 0,
    cost: 69,
    paymentStatus: 'paid',
    country: 'United States',
    region: 'New York',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'asmt-004',
    candidateId: 'cand-004',
    candidateName: 'Robert Anderson',
    candidateEmail: 'robert.anderson@example.com',
    jobId: 'job-004',
    jobTitle: 'Sales Director',
    employerId: 'emp-004',
    employerName: 'Global Sales Inc',
    employerLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=GlobalSales',
    applicationId: 'app-004',
    assessmentType: 'behavioral',
    provider: 'testgorilla',
    status: 'completed',
    invitedBy: 'rec-003',
    invitedByName: 'Lisa Thompson',
    invitedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    completedDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    result: {
      assessmentType: 'behavioral',
      score: 72,
      percentile: 78,
      status: 'passed',
      completedDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      timeSpent: 45,
      details: {
        categoryScores: { 'Leadership': 75, 'Communication': 78, 'Teamwork': 65 },
        strengths: ['Client engagement', 'Persuasion'],
        weaknesses: ['Delegation']
      }
    },
    overallScore: 72,
    passed: true,
    passThreshold: 65,
    invitationToken: 'token-004',
    remindersSent: 2,
    lastReminderDate: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    cost: 69,
    paymentStatus: 'paid',
    country: 'Canada',
    region: 'Ontario',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'asmt-005',
    candidateId: 'cand-005',
    candidateName: 'Maria Garcia',
    candidateEmail: 'maria.garcia@example.com',
    jobId: 'job-005',
    jobTitle: 'Product Manager',
    employerId: 'emp-005',
    employerName: 'ProductVision Labs',
    employerLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=ProductVision',
    applicationId: 'app-005',
    assessmentType: 'situational-judgment',
    provider: 'harver',
    status: 'expired',
    invitedBy: 'rec-002',
    invitedByName: 'Emily Rodriguez',
    invitedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    passThreshold: 70,
    invitationToken: 'token-005',
    remindersSent: 3,
    lastReminderDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    cost: 69,
    paymentStatus: 'paid',
    country: 'United States',
    region: 'Florida',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'asmt-006',
    candidateId: 'cand-006',
    candidateName: 'James Wilson',
    candidateEmail: 'james.wilson@example.com',
    jobId: 'job-006',
    jobTitle: 'UX Designer',
    employerId: 'emp-006',
    employerName: 'DesignHub Studios',
    employerLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=DesignHub',
    applicationId: 'app-006',
    assessmentType: 'culture-fit',
    provider: 'vervoe',
    status: 'completed',
    invitedBy: 'rec-001',
    invitedByName: 'Michael Chen',
    invitedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    completedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    result: {
      assessmentType: 'culture-fit',
      score: 91,
      percentile: 95,
      status: 'passed',
      completedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      timeSpent: 30,
      details: {
        categoryScores: { 'Values Alignment': 95, 'Work Style': 88, 'Team Dynamics': 90 },
        strengths: ['Collaboration', 'Innovation'],
        weaknesses: []
      }
    },
    overallScore: 91,
    passed: true,
    passThreshold: 70,
    invitationToken: 'token-006',
    remindersSent: 1,
    lastReminderDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    cost: 59,
    paymentStatus: 'paid',
    country: 'United Kingdom',
    region: 'London',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'asmt-007',
    candidateId: 'cand-007',
    candidateName: 'Patricia Brown',
    candidateEmail: 'patricia.brown@example.com',
    jobId: 'job-007',
    jobTitle: 'Financial Analyst',
    employerId: 'emp-007',
    employerName: 'FinancePro Group',
    employerLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=FinancePro',
    assessmentType: 'cognitive',
    provider: 'criteria',
    status: 'pending-invitation',
    invitedBy: 'rec-003',
    invitedByName: 'Lisa Thompson',
    invitedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    passThreshold: 75,
    invitationToken: 'token-007',
    remindersSent: 0,
    cost: 69,
    paymentStatus: 'pending',
    country: 'Australia',
    region: 'Sydney',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'asmt-008',
    candidateId: 'cand-008',
    candidateName: 'Michael Taylor',
    candidateEmail: 'michael.taylor@example.com',
    jobId: 'job-008',
    jobTitle: 'DevOps Engineer',
    employerId: 'emp-008',
    employerName: 'CloudOps Solutions',
    employerLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=CloudOps',
    applicationId: 'app-008',
    assessmentType: 'technical-skills',
    provider: 'codility',
    status: 'completed',
    invitedBy: 'rec-002',
    invitedByName: 'Emily Rodriguez',
    invitedDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    completedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    result: {
      assessmentType: 'technical-skills',
      score: 58,
      percentile: 45,
      status: 'failed',
      completedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      timeSpent: 90,
      details: {
        categoryScores: { 'Cloud Infrastructure': 55, 'CI/CD': 60, 'Monitoring': 59 },
        strengths: ['Deployment automation'],
        weaknesses: ['Security practices', 'Performance optimization']
      }
    },
    overallScore: 58,
    passed: false,
    passThreshold: 70,
    invitationToken: 'token-008',
    remindersSent: 1,
    lastReminderDate: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    cost: 89,
    paymentStatus: 'paid',
    country: 'United States',
    region: 'Washington',
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'asmt-009',
    candidateId: 'cand-009',
    candidateName: 'Linda Davis',
    candidateEmail: 'linda.davis@example.com',
    jobId: 'job-009',
    jobTitle: 'Content Writer',
    employerId: 'emp-009',
    employerName: 'ContentCraft Media',
    employerLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=ContentCraft',
    applicationId: 'app-009',
    assessmentType: 'custom',
    provider: 'internal',
    status: 'in-progress',
    invitedBy: 'rec-001',
    invitedByName: 'Michael Chen',
    invitedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    passThreshold: 70,
    invitationToken: 'token-009',
    remindersSent: 0,
    cost: 49,
    paymentStatus: 'paid',
    country: 'United States',
    region: 'Illinois',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'asmt-010',
    candidateId: 'cand-010',
    candidateName: 'Christopher Moore',
    candidateEmail: 'christopher.moore@example.com',
    jobId: 'job-010',
    jobTitle: 'Operations Manager',
    employerId: 'emp-010',
    employerName: 'OptiManage Corp',
    employerLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=OptiManage',
    applicationId: 'app-010',
    assessmentType: 'personality',
    provider: 'shl',
    status: 'invited',
    invitedBy: 'rec-003',
    invitedByName: 'Lisa Thompson',
    invitedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    passThreshold: 65,
    invitationToken: 'token-010',
    remindersSent: 0,
    cost: 59,
    paymentStatus: 'paid',
    country: 'Canada',
    region: 'British Columbia',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

function initializeStorage() {
  const storedVersion = localStorage.getItem(VERSION_KEY);
  
  // Force reload if version mismatch or no data exists
  if (storedVersion !== CURRENT_VERSION) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockAssessments));
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
  } else if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockAssessments));
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
  }
}

export function getAssessments(): Assessment[] {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function getAssessmentById(id: string): Assessment | undefined {
  return getAssessments().find(a => a.id === id);
}

export function getAssessmentsByCandidate(candidateId: string): Assessment[] {
  return getAssessments().filter(a => a.candidateId === candidateId);
}

export function getAssessmentsByJob(jobId: string): Assessment[] {
  return getAssessments().filter(a => a.jobId === jobId);
}

export function saveAssessment(assessment: Assessment): void {
  const assessments = getAssessments();
  assessments.push(assessment);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assessments));
}

export function updateAssessment(id: string, updates: Partial<Assessment>): void {
  const assessments = getAssessments();
  const index = assessments.findIndex(a => a.id === id);
  if (index !== -1) {
    assessments[index] = { ...assessments[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assessments));
  }
}

export function deleteAssessment(id: string): void {
  const assessments = getAssessments();
  const filtered = assessments.filter(a => a.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function getAssessmentByToken(token: string): Assessment | undefined {
  return getAssessments().find(a => a.invitationToken === token);
}

export function getPendingAssessments(): Assessment[] {
  const now = new Date();
  return getAssessments().filter(a => {
    if (a.status === 'completed' || a.status === 'expired' || a.status === 'cancelled') return false;
    
    const invitedDate = new Date(a.invitedDate);
    const daysSinceInvite = Math.floor((now.getTime() - invitedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysSinceInvite >= 3;
  });
}

export function getExpiringAssessments(): Assessment[] {
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
  
  return getAssessments().filter(a => {
    if (a.status === 'completed' || a.status === 'expired' || a.status === 'cancelled') return false;
    
    const expiryDate = new Date(a.expiryDate);
    return expiryDate <= threeDaysFromNow && expiryDate > now;
  });
}
