import { Job } from "@/shared/types/job";
import { mockJobs } from "@/shared/data/mockJobsData";

export function getEmployerJobs(employerId: string): Job[] {
  return mockJobs.filter(job => job.employerId === employerId);
}

export function getEmployerJobStats(employerId: string) {
  const jobs = getEmployerJobs(employerId);
  
  return {
    total: jobs.length,
    open: jobs.filter(j => j.status === 'open').length,
    draft: jobs.filter(j => j.status === 'draft').length,
    closed: jobs.filter(j => j.status === 'closed').length,
    totalApplicants: jobs.reduce((sum, j) => sum + j.applicantsCount, 0),
    avgApplicantsPerJob: jobs.length > 0 
      ? Math.round(jobs.reduce((sum, j) => sum + j.applicantsCount, 0) / jobs.length)
      : 0,
  };
}
