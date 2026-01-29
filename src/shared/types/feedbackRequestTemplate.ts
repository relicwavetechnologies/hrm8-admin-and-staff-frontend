export interface FeedbackRequestTemplate {
  id: string;
  name: string;
  description?: string;
  role?: string; // e.g., "Technical Interviewer", "HR Manager"
  interviewStage?: string; // e.g., "Technical Round", "Culture Fit"
  message: string;
  dueDaysFromNow: number; // Days from request date
  autoSelectRoles?: string[]; // Automatically select team members with these roles
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateCategory {
  id: string;
  name: string;
  templates: FeedbackRequestTemplate[];
}
