import { Job } from "@/shared/types/job";

export interface JobVersion {
  id: string;
  jobId: string;
  version: number;
  changes: JobChange[];
  changedBy: string;
  changedAt: Date;
  snapshot: Partial<Job>;
}

export interface JobChange {
  field: string;
  oldValue: any;
  newValue: any;
  label: string;
}

const jobVersions: JobVersion[] = [
  {
    id: "v1",
    jobId: "1",
    version: 3,
    changes: [
      { field: "title", oldValue: "Senior Software Engineer", newValue: "Senior Full Stack Engineer", label: "Job Title" },
      { field: "salaryMax", oldValue: 150000, newValue: 160000, label: "Maximum Salary" },
    ],
    changedBy: "Sarah Johnson",
    changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    snapshot: { title: "Senior Full Stack Engineer", salaryMax: 160000 },
  },
  {
    id: "v2",
    jobId: "1",
    version: 2,
    changes: [
      { field: "experienceLevel", oldValue: "mid", newValue: "senior", label: "Experience Level" },
      { field: "requirements", oldValue: ["5+ years"], newValue: ["7+ years"], label: "Requirements" },
    ],
    changedBy: "Michael Chen",
    changedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    snapshot: { experienceLevel: "senior" },
  },
  {
    id: "v3",
    jobId: "1",
    version: 1,
    changes: [
      { field: "status", oldValue: "draft", newValue: "open", label: "Status" },
    ],
    changedBy: "Sarah Johnson",
    changedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    snapshot: { status: "open" },
  },
];

export function getJobVersionHistory(jobId: string): JobVersion[] {
  return jobVersions.filter(v => v.jobId === jobId).sort((a, b) => b.version - a.version);
}

export function getJobVersion(jobId: string, version: number): JobVersion | undefined {
  return jobVersions.find(v => v.jobId === jobId && v.version === version);
}

export function compareVersions(jobId: string, versionA: number, versionB: number): JobChange[] {
  const a = getJobVersion(jobId, versionA);
  const b = getJobVersion(jobId, versionB);
  
  if (!a || !b) return [];
  
  const changes: JobChange[] = [];
  const allFields = new Set([
    ...Object.keys(a.snapshot),
    ...Object.keys(b.snapshot),
  ]);
  
  allFields.forEach(field => {
    const oldVal = (a.snapshot as any)[field];
    const newVal = (b.snapshot as any)[field];
    
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes.push({
        field,
        oldValue: oldVal,
        newValue: newVal,
        label: field.charAt(0).toUpperCase() + field.slice(1),
      });
    }
  });
  
  return changes;
}

export function revertToVersion(jobId: string, version: number): Partial<Job> | null {
  const jobVersion = getJobVersion(jobId, version);
  return jobVersion ? jobVersion.snapshot : null;
}

export function trackJobChange(jobId: string, changes: JobChange[], changedBy: string): void {
  const existingVersions = getJobVersionHistory(jobId);
  const newVersion = existingVersions.length > 0 ? existingVersions[0].version + 1 : 1;
  
  const newJobVersion: JobVersion = {
    id: `v${Date.now()}`,
    jobId,
    version: newVersion,
    changes,
    changedBy,
    changedAt: new Date(),
    snapshot: {},
  };
  
  jobVersions.unshift(newJobVersion);
}
