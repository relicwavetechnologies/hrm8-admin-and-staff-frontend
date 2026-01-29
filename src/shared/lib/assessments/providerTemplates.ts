import type { AssessmentType, AssessmentProvider, AssessmentTemplate } from '@/shared/types/assessment';

export interface ProviderTemplate {
  providerId: string;
  providerName: AssessmentProvider;
  templateId: string;
  name: string;
  description: string;
  assessmentType: AssessmentType;
  duration: number;
  questionCount: number;
  categories: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  popularity: number;
  lastUpdated: string;
}

// Mock provider templates
const TESTGORILLA_TEMPLATES: ProviderTemplate[] = [
  {
    providerId: 'tg-001',
    providerName: 'testgorilla',
    templateId: 'tg-cognitive-advanced',
    name: 'Advanced Cognitive Ability Test',
    description: 'Comprehensive assessment of problem-solving, critical thinking, and logical reasoning',
    assessmentType: 'cognitive',
    duration: 45,
    questionCount: 40,
    categories: ['Logical Reasoning', 'Numerical Reasoning', 'Verbal Reasoning', 'Pattern Recognition'],
    difficulty: 'advanced',
    popularity: 95,
    lastUpdated: '2025-01-15',
  },
  {
    providerId: 'tg-002',
    providerName: 'testgorilla',
    templateId: 'tg-personality-big5',
    name: 'Big Five Personality Assessment',
    description: 'Evaluate personality traits using the scientifically validated Big Five model',
    assessmentType: 'personality',
    duration: 30,
    questionCount: 50,
    categories: ['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism'],
    difficulty: 'intermediate',
    popularity: 88,
    lastUpdated: '2025-01-10',
  },
  {
    providerId: 'tg-003',
    providerName: 'testgorilla',
    templateId: 'tg-situational-leadership',
    name: 'Leadership Situational Judgment',
    description: 'Assess decision-making skills in leadership scenarios',
    assessmentType: 'situational-judgment',
    duration: 35,
    questionCount: 25,
    categories: ['Conflict Resolution', 'Team Management', 'Strategic Thinking', 'Communication'],
    difficulty: 'advanced',
    popularity: 82,
    lastUpdated: '2025-01-12',
  },
];

const CODILITY_TEMPLATES: ProviderTemplate[] = [
  {
    providerId: 'cod-001',
    providerName: 'codility',
    templateId: 'cod-javascript-senior',
    name: 'Senior JavaScript Developer Test',
    description: 'Advanced JavaScript coding challenges covering algorithms and data structures',
    assessmentType: 'technical-skills',
    duration: 90,
    questionCount: 5,
    categories: ['Algorithms', 'Data Structures', 'ES6+', 'Performance Optimization'],
    difficulty: 'advanced',
    popularity: 92,
    lastUpdated: '2025-01-18',
  },
  {
    providerId: 'cod-002',
    providerName: 'codility',
    templateId: 'cod-python-intermediate',
    name: 'Python Developer Assessment',
    description: 'Mid-level Python coding test with practical problem-solving',
    assessmentType: 'technical-skills',
    duration: 75,
    questionCount: 6,
    categories: ['Python Fundamentals', 'Object-Oriented Programming', 'Data Analysis', 'Testing'],
    difficulty: 'intermediate',
    popularity: 87,
    lastUpdated: '2025-01-16',
  },
  {
    providerId: 'cod-003',
    providerName: 'codility',
    templateId: 'cod-sql-database',
    name: 'SQL & Database Design Test',
    description: 'Comprehensive SQL queries and database optimization challenges',
    assessmentType: 'technical-skills',
    duration: 60,
    questionCount: 8,
    categories: ['SQL Queries', 'Database Design', 'Indexing', 'Query Optimization'],
    difficulty: 'intermediate',
    popularity: 79,
    lastUpdated: '2025-01-14',
  },
];

const VERVOE_TEMPLATES: ProviderTemplate[] = [
  {
    providerId: 'ver-001',
    providerName: 'vervoe',
    templateId: 'ver-sales-skills',
    name: 'Sales Representative Skills Assessment',
    description: 'Evaluate sales techniques, communication, and negotiation skills',
    assessmentType: 'behavioral',
    duration: 40,
    questionCount: 15,
    categories: ['Communication', 'Negotiation', 'Product Knowledge', 'Customer Service'],
    difficulty: 'intermediate',
    popularity: 85,
    lastUpdated: '2025-01-17',
  },
  {
    providerId: 'ver-002',
    providerName: 'vervoe',
    templateId: 'ver-customer-support',
    name: 'Customer Support Excellence Test',
    description: 'Assess problem-solving and communication in customer service scenarios',
    assessmentType: 'situational-judgment',
    duration: 35,
    questionCount: 20,
    categories: ['Problem Solving', 'Empathy', 'Technical Aptitude', 'Conflict Resolution'],
    difficulty: 'beginner',
    popularity: 80,
    lastUpdated: '2025-01-11',
  },
];

const CRITERIA_TEMPLATES: ProviderTemplate[] = [
  {
    providerId: 'cri-001',
    providerName: 'criteria',
    templateId: 'cri-ccat-standard',
    name: 'Criteria Cognitive Aptitude Test (CCAT)',
    description: 'Industry-standard cognitive ability assessment',
    assessmentType: 'cognitive',
    duration: 15,
    questionCount: 50,
    categories: ['Verbal Reasoning', 'Math & Logic', 'Spatial Reasoning'],
    difficulty: 'intermediate',
    popularity: 96,
    lastUpdated: '2025-01-19',
  },
  {
    providerId: 'cri-002',
    providerName: 'criteria',
    templateId: 'cri-personality-workplace',
    name: 'Workplace Personality Inventory',
    description: 'Evaluate workplace behavior and cultural fit',
    assessmentType: 'personality',
    duration: 25,
    questionCount: 35,
    categories: ['Work Style', 'Team Dynamics', 'Leadership Potential', 'Stress Management'],
    difficulty: 'intermediate',
    popularity: 83,
    lastUpdated: '2025-01-13',
  },
];

const HARVER_TEMPLATES: ProviderTemplate[] = [
  {
    providerId: 'har-001',
    providerName: 'harver',
    templateId: 'har-culture-fit',
    name: 'Organizational Culture Fit Assessment',
    description: 'Measure alignment with company values and culture',
    assessmentType: 'culture-fit',
    duration: 30,
    questionCount: 40,
    categories: ['Values Alignment', 'Work Environment Preferences', 'Communication Style', 'Team Collaboration'],
    difficulty: 'beginner',
    popularity: 78,
    lastUpdated: '2025-01-09',
  },
];

export const PROVIDER_TEMPLATES_MAP: Record<AssessmentProvider, ProviderTemplate[]> = {
  testgorilla: TESTGORILLA_TEMPLATES,
  codility: CODILITY_TEMPLATES,
  vervoe: VERVOE_TEMPLATES,
  criteria: CRITERIA_TEMPLATES,
  harver: HARVER_TEMPLATES,
  shl: [],
  internal: [],
};

export function getAllProviderTemplates(): ProviderTemplate[] {
  return Object.values(PROVIDER_TEMPLATES_MAP).flat();
}

export function getTemplatesByProvider(provider: AssessmentProvider): ProviderTemplate[] {
  return PROVIDER_TEMPLATES_MAP[provider] || [];
}

export function getTemplatesByType(type: AssessmentType): ProviderTemplate[] {
  return getAllProviderTemplates().filter(t => t.assessmentType === type);
}

export function searchProviderTemplates(query: string): ProviderTemplate[] {
  const lowerQuery = query.toLowerCase();
  return getAllProviderTemplates().filter(t =>
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery) ||
    t.categories.some(c => c.toLowerCase().includes(lowerQuery))
  );
}

export function convertProviderTemplateToAssessmentTemplate(
  providerTemplate: ProviderTemplate
): Omit<AssessmentTemplate, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name: `${providerTemplate.name} (${providerTemplate.providerName})`,
    description: providerTemplate.description,
    assessmentType: providerTemplate.assessmentType,
    provider: providerTemplate.providerName,
    duration: providerTemplate.duration,
    questionCount: providerTemplate.questionCount,
    passThreshold: 70,
    categories: providerTemplate.categories,
    isActive: true,
  };
}
