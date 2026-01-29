import { JobFormData } from "@/shared/types/job";

export interface JobTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  data: Partial<JobFormData>;
  isShared: boolean;
  createdBy: string;
  createdAt: Date;
  usageCount: number;
}

export const templateCategories = [
  "Engineering",
  "Product",
  "Design",
  "Marketing",
  "Sales",
  "Operations",
  "Finance",
  "HR",
  "Customer Support",
  "Custom"
];

const jobTemplates: JobTemplate[] = [
  {
    id: "1",
    name: "Senior Software Engineer",
    description: "Template for senior engineering roles",
    category: "Engineering",
    data: {
      title: "Senior Software Engineer",
      department: "Engineering",
      employmentType: "full-time",
      experienceLevel: "senior",
      requirements: [
        { id: "1", text: "5+ years of professional software development experience", order: 0 },
        { id: "2", text: "Strong knowledge of React, TypeScript, and Node.js", order: 1 },
        { id: "3", text: "Experience with cloud platforms (AWS/GCP/Azure)", order: 2 },
        { id: "4", text: "Excellent problem-solving and communication skills", order: 3 }
      ],
      responsibilities: [
        { id: "1", text: "Design and develop scalable web applications", order: 0 },
        { id: "2", text: "Mentor junior engineers and conduct code reviews", order: 1 },
        { id: "3", text: "Collaborate with product and design teams", order: 2 },
        { id: "4", text: "Contribute to technical architecture decisions", order: 3 }
      ],
    },
    isShared: true,
    createdBy: "System",
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    usageCount: 45,
  },
  {
    id: "2",
    name: "Product Manager",
    description: "Standard PM role template",
    category: "Product",
    data: {
      title: "Product Manager",
      department: "Product",
      employmentType: "full-time",
      experienceLevel: "mid",
      requirements: [
        { id: "1", text: "3+ years of product management experience", order: 0 },
        { id: "2", text: "Strong analytical and data-driven decision making", order: 1 },
        { id: "3", text: "Experience with agile methodologies", order: 2 },
        { id: "4", text: "Excellent stakeholder management skills", order: 3 }
      ],
      responsibilities: [
        { id: "1", text: "Define product roadmap and strategy", order: 0 },
        { id: "2", text: "Gather and prioritize product requirements", order: 1 },
        { id: "3", text: "Work closely with engineering and design teams", order: 2 },
        { id: "4", text: "Analyze metrics and user feedback", order: 3 }
      ],
    },
    isShared: true,
    createdBy: "Sarah Johnson",
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    usageCount: 28,
  },
  {
    id: "3",
    name: "UX Designer",
    category: "Design",
    data: {
      title: "UX Designer",
      department: "Design",
      employmentType: "full-time",
      experienceLevel: "mid",
    },
    isShared: false,
    createdBy: "Emma Wilson",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    usageCount: 12,
  },
];

export function getJobTemplates(category?: string): JobTemplate[] {
  if (category) {
    return jobTemplates.filter(t => t.category === category);
  }
  return [...jobTemplates];
}

export function getJobTemplate(id: string): JobTemplate | undefined {
  return jobTemplates.find(t => t.id === id);
}

export function createJobTemplate(template: Omit<JobTemplate, "id" | "createdAt" | "usageCount">): JobTemplate {
  const newTemplate: JobTemplate = {
    ...template,
    id: Date.now().toString(),
    createdAt: new Date(),
    usageCount: 0,
  };
  
  jobTemplates.push(newTemplate);
  return newTemplate;
}

export function updateJobTemplate(id: string, updates: Partial<JobTemplate>): JobTemplate | null {
  const index = jobTemplates.findIndex(t => t.id === id);
  if (index === -1) return null;
  
  jobTemplates[index] = { ...jobTemplates[index], ...updates };
  return jobTemplates[index];
}

export function deleteJobTemplate(id: string): boolean {
  const index = jobTemplates.findIndex(t => t.id === id);
  if (index === -1) return false;
  
  jobTemplates.splice(index, 1);
  return true;
}

export function incrementTemplateUsage(id: string): void {
  const template = jobTemplates.find(t => t.id === id);
  if (template) {
    template.usageCount++;
  }
}

export function getMostUsedTemplates(limit: number = 5): JobTemplate[] {
  return [...jobTemplates]
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, limit);
}
