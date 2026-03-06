export interface Recruiter {
  id: string;
  name: string;
  specialization?: string;
  activeJobs?: number;
}

export const mockRecruiters: Recruiter[] = [
  { id: 'recruiter_1', name: 'Jennifer Martinez', specialization: 'Tech Recruiting', activeJobs: 8 },
  { id: 'recruiter_2', name: 'Robert Taylor', specialization: 'Executive Search', activeJobs: 5 },
  { id: 'recruiter_3', name: 'Amanda Lee', specialization: 'Sales & Marketing', activeJobs: 12 },
  { id: 'recruiter_4', name: 'James Wilson', specialization: 'Healthcare', activeJobs: 6 },
  { id: 'recruiter_5', name: 'Patricia Brown', specialization: 'Finance & Accounting', activeJobs: 9 },
  { id: 'recruiter_6', name: 'Christopher Davis', specialization: 'Engineering', activeJobs: 11 },
  { id: 'recruiter_7', name: 'Michelle Garcia', specialization: 'HR & Operations', activeJobs: 7 },
  { id: 'recruiter_8', name: 'Daniel Rodriguez', specialization: 'Legal & Compliance', activeJobs: 4 },
];
