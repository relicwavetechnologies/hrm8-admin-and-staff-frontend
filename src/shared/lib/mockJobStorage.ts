import { Job, JobTemplate } from '@/shared/types/job';
import { mockJobs, mockJobTemplates } from '@/shared/data/mockJobsData';

const JOBS_STORAGE_KEY = 'hrm8_jobs';
const TEMPLATES_STORAGE_KEY = 'hrm8_job_templates';

// Job Management
export function getJobs(): Job[] {
  try {
    const stored = localStorage.getItem(JOBS_STORAGE_KEY);
    if (stored) {
      const customJobs = JSON.parse(stored) as Job[];
      // Merge with mock data, custom jobs first
      return [...customJobs, ...mockJobs.filter(mj => !customJobs.find(cj => cj.id === mj.id))];
    }
  } catch (error) {
    console.error('Error reading jobs from storage:', error);
  }
  return mockJobs;
}

export function saveJob(job: Job): void {
  try {
    const jobs = getJobs();
    const existingIndex = jobs.findIndex(j => j.id === job.id);
    
    if (existingIndex >= 0) {
      jobs[existingIndex] = { ...job, updatedAt: new Date().toISOString() };
    } else {
      jobs.unshift({ ...job, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    
    // Only store non-mock jobs
    const customJobs = jobs.filter(j => !mockJobs.find(mj => mj.id === j.id));
    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(customJobs));
  } catch (error) {
    console.error('Error saving job to storage:', error);
  }
}

export function getJobById(id: string): Job | undefined {
  const jobs = getJobs();
  return jobs.find(j => j.id === id);
}

export function updateJob(id: string, updates: Partial<Job>): void {
  try {
    const jobs = getJobs();
    const jobIndex = jobs.findIndex(j => j.id === id);
    
    if (jobIndex >= 0) {
      jobs[jobIndex] = { ...jobs[jobIndex], ...updates, updatedAt: new Date().toISOString() };
      
      // Only store non-mock jobs
      const customJobs = jobs.filter(j => !mockJobs.find(mj => mj.id === j.id));
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(customJobs));
    }
  } catch (error) {
    console.error('Error updating job in storage:', error);
  }
}

export function deleteJob(id: string): void {
  try {
    const jobs = getJobs();
    const filteredJobs = jobs.filter(j => j.id !== id);
    
    // Only store non-mock jobs
    const customJobs = filteredJobs.filter(j => !mockJobs.find(mj => mj.id === j.id));
    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(customJobs));
  } catch (error) {
    console.error('Error deleting job from storage:', error);
  }
}

// Template Management
export function getJobTemplates(): JobTemplate[] {
  try {
    const stored = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (stored) {
      const customTemplates = JSON.parse(stored) as JobTemplate[];
      // Merge with mock data
      return [...customTemplates, ...mockJobTemplates.filter(mt => !customTemplates.find(ct => ct.id === mt.id))];
    }
  } catch (error) {
    console.error('Error reading templates from storage:', error);
  }
  return mockJobTemplates;
}

export function saveJobTemplate(template: JobTemplate): void {
  try {
    const templates = getJobTemplates();
    const existingIndex = templates.findIndex(t => t.id === template.id);
    
    if (existingIndex >= 0) {
      templates[existingIndex] = template;
    } else {
      templates.unshift({ ...template, createdAt: new Date().toISOString() });
    }
    
    // Only store non-system templates
    const customTemplates = templates.filter(t => !t.isSystemTemplate);
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(customTemplates));
  } catch (error) {
    console.error('Error saving template to storage:', error);
  }
}

export function getJobTemplateById(id: string): JobTemplate | undefined {
  const templates = getJobTemplates();
  return templates.find(t => t.id === id);
}

export function deleteJobTemplate(id: string): void {
  try {
    const templates = getJobTemplates();
    const filteredTemplates = templates.filter(t => t.id !== id && !t.isSystemTemplate);
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(filteredTemplates));
  } catch (error) {
    console.error('Error deleting template from storage:', error);
  }
}

export function clearAllJobs(): void {
  try {
    localStorage.removeItem(JOBS_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing jobs from storage:', error);
  }
}

export function clearAllTemplates(): void {
  try {
    localStorage.removeItem(TEMPLATES_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing templates from storage:', error);
  }
}
