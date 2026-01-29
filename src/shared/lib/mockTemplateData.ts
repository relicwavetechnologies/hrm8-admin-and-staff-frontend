import { FeedbackRequestTemplate } from '@/shared/types/feedbackRequestTemplate';

export const mockTemplates: FeedbackRequestTemplate[] = [
  {
    id: 'tmpl-1',
    name: 'Technical Round Feedback',
    description: 'Request feedback after technical interview',
    role: 'Technical Interviewer',
    interviewStage: 'Technical Round',
    message: "Please provide your feedback on the technical interview. Focus on problem-solving abilities, code quality, and technical depth. Your insights are valuable for our hiring decision.",
    dueDaysFromNow: 2,
    autoSelectRoles: ['Senior Engineer', 'Tech Lead', 'Engineering Manager'],
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tmpl-2',
    name: 'Culture Fit Assessment',
    description: 'Request feedback on cultural alignment',
    role: 'HR Manager',
    interviewStage: 'Culture Fit',
    message: "Please share your assessment of the candidate's cultural fit with our team. Consider communication style, values alignment, and team collaboration potential.",
    dueDaysFromNow: 3,
    autoSelectRoles: ['HR Manager', 'Team Lead', 'Engineering Manager'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tmpl-3',
    name: 'System Design Review',
    description: 'Feedback on system design interview',
    role: 'Senior Engineer',
    interviewStage: 'System Design',
    message: "Please evaluate the candidate's system design approach. Consider scalability thinking, architectural decisions, and trade-off analysis. Share specific examples from the interview.",
    dueDaysFromNow: 1,
    autoSelectRoles: ['Senior Engineer', 'Principal Engineer', 'CTO'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tmpl-4',
    name: 'Leadership Assessment',
    description: 'Feedback on leadership potential',
    role: 'Engineering Manager',
    interviewStage: 'Leadership',
    message: "Please assess the candidate's leadership qualities and potential. Focus on team management experience, decision-making approach, and strategic thinking.",
    dueDaysFromNow: 3,
    autoSelectRoles: ['Engineering Manager', 'CTO'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tmpl-5',
    name: 'Quick Feedback Request',
    description: 'Urgent feedback needed',
    message: "We need your feedback urgently for this candidate. Please share your thoughts as soon as possible.",
    dueDaysFromNow: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function initializeMockTemplates() {
  const TEMPLATES_KEY = 'feedback_request_templates';
  
  if (!localStorage.getItem(TEMPLATES_KEY)) {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(mockTemplates));
  }
}
