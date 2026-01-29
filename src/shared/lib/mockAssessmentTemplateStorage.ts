import type { AssessmentTemplate } from '@/shared/types/assessment';

const STORAGE_KEY = 'hrm8_assessment_templates';

const defaultTemplates: AssessmentTemplate[] = [
  {
    id: 'template-1',
    name: 'Software Engineer - Technical Assessment',
    description: 'Comprehensive technical assessment for software engineering roles covering coding, algorithms, and system design',
    assessmentType: 'technical-skills',
    provider: 'codility',
    duration: 90,
    questionCount: 15,
    passThreshold: 70,
    categories: ['Coding', 'Algorithms', 'Data Structures', 'System Design', 'Problem Solving'],
    isActive: true,
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
  },
  {
    id: 'template-2',
    name: 'Cognitive Ability - General',
    description: 'Standard cognitive ability test measuring reasoning, problem-solving, and critical thinking',
    assessmentType: 'cognitive',
    provider: 'testgorilla',
    duration: 45,
    questionCount: 30,
    passThreshold: 65,
    categories: ['Logical Reasoning', 'Numerical Reasoning', 'Verbal Reasoning', 'Pattern Recognition'],
    isActive: true,
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-02-05').toISOString(),
  },
  {
    id: 'template-3',
    name: 'Sales Personality Profile',
    description: 'Personality assessment tailored for sales positions, focusing on communication and persuasion traits',
    assessmentType: 'personality',
    provider: 'shl',
    duration: 30,
    questionCount: 50,
    passThreshold: 60,
    categories: ['Extraversion', 'Agreeableness', 'Communication', 'Persuasion', 'Resilience'],
    isActive: true,
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date('2024-02-01').toISOString(),
  },
  {
    id: 'template-4',
    name: 'Leadership Assessment',
    description: 'Comprehensive assessment for leadership roles including situational judgment and behavioral analysis',
    assessmentType: 'situational-judgment',
    provider: 'criteria',
    duration: 60,
    questionCount: 25,
    passThreshold: 75,
    categories: ['Decision Making', 'Team Management', 'Conflict Resolution', 'Strategic Thinking'],
    isActive: true,
    createdAt: new Date('2024-01-20').toISOString(),
    updatedAt: new Date('2024-01-20').toISOString(),
  },
  {
    id: 'template-5',
    name: 'Customer Service Behavioral',
    description: 'Behavioral assessment for customer service roles focusing on empathy and problem-solving',
    assessmentType: 'behavioral',
    provider: 'vervoe',
    duration: 40,
    questionCount: 20,
    passThreshold: 70,
    categories: ['Empathy', 'Communication', 'Problem Solving', 'Patience', 'Active Listening'],
    isActive: false,
    createdAt: new Date('2024-01-05').toISOString(),
    updatedAt: new Date('2024-01-25').toISOString(),
  },
];

function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultTemplates));
  }
}

export function getAssessmentTemplates(): AssessmentTemplate[] {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function getAssessmentTemplateById(id: string): AssessmentTemplate | undefined {
  return getAssessmentTemplates().find(t => t.id === id);
}

export function getActiveAssessmentTemplates(): AssessmentTemplate[] {
  return getAssessmentTemplates().filter(t => t.isActive);
}

export function getTemplatesByType(type: string): AssessmentTemplate[] {
  return getAssessmentTemplates().filter(t => t.assessmentType === type);
}

export function saveAssessmentTemplate(template: AssessmentTemplate): void {
  const templates = getAssessmentTemplates();
  templates.push(template);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function updateAssessmentTemplate(id: string, updates: Partial<AssessmentTemplate>): void {
  const templates = getAssessmentTemplates();
  const index = templates.findIndex(t => t.id === id);
  if (index !== -1) {
    templates[index] = { 
      ...templates[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  }
}

export function deleteAssessmentTemplate(id: string): void {
  const templates = getAssessmentTemplates();
  const filtered = templates.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function duplicateAssessmentTemplate(id: string): AssessmentTemplate | null {
  const template = getAssessmentTemplateById(id);
  if (!template) return null;

  const now = new Date().toISOString();
  const duplicated: AssessmentTemplate = {
    ...template,
    id: `template-${Date.now()}`,
    name: `${template.name} (Copy)`,
    createdAt: now,
    updatedAt: now,
  };

  saveAssessmentTemplate(duplicated);
  return duplicated;
}
