import type { InterviewTemplate } from '@/shared/types/interviewTemplate';

const STORAGE_KEY = 'interview_templates';

const defaultTemplates: InterviewTemplate[] = [
  {
    id: 'tmpl-1',
    name: 'Technical Screen',
    description: 'Initial technical screening for software engineering positions',
    type: 'video',
    duration: 45,
    questions: [
      {
        id: 'q1',
        question: 'Tell me about your experience with React and TypeScript',
        category: 'technical',
        isRequired: true,
        expectedDuration: 10,
      },
      {
        id: 'q2',
        question: 'Explain the difference between useMemo and useCallback',
        category: 'technical',
        isRequired: true,
        expectedDuration: 8,
      },
      {
        id: 'q3',
        question: 'How do you approach debugging complex issues?',
        category: 'technical',
        isRequired: false,
        expectedDuration: 7,
      },
      {
        id: 'q4',
        question: 'Describe a challenging project you worked on',
        category: 'behavioral',
        isRequired: true,
        expectedDuration: 10,
      },
    ],
    ratingCriteria: [
      {
        id: 'rc1',
        name: 'Technical Skills',
        description: 'Proficiency in required technologies',
        weight: 40,
      },
      {
        id: 'rc2',
        name: 'Problem Solving',
        description: 'Ability to solve complex technical problems',
        weight: 30,
      },
      {
        id: 'rc3',
        name: 'Communication',
        description: 'Clear technical communication',
        weight: 20,
      },
      {
        id: 'rc4',
        name: 'Culture Fit',
        description: 'Alignment with team values',
        weight: 10,
      },
    ],
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tmpl-2',
    name: 'Behavioral Interview',
    description: 'Assessment of soft skills and culture fit',
    type: 'video',
    duration: 60,
    questions: [
      {
        id: 'q5',
        question: 'Tell me about a time you disagreed with a team member',
        category: 'behavioral',
        isRequired: true,
        expectedDuration: 12,
      },
      {
        id: 'q6',
        question: 'How do you handle tight deadlines and pressure?',
        category: 'behavioral',
        isRequired: true,
        expectedDuration: 10,
      },
      {
        id: 'q7',
        question: 'Describe your ideal work environment',
        category: 'cultural',
        isRequired: true,
        expectedDuration: 8,
      },
      {
        id: 'q8',
        question: 'What motivates you in your career?',
        category: 'behavioral',
        isRequired: false,
        expectedDuration: 10,
      },
    ],
    ratingCriteria: [
      {
        id: 'rc5',
        name: 'Communication',
        description: 'Clarity and effectiveness of communication',
        weight: 30,
      },
      {
        id: 'rc6',
        name: 'Culture Fit',
        description: 'Alignment with company values',
        weight: 35,
      },
      {
        id: 'rc7',
        name: 'Leadership',
        description: 'Leadership potential and initiative',
        weight: 20,
      },
      {
        id: 'rc8',
        name: 'Adaptability',
        description: 'Flexibility and learning mindset',
        weight: 15,
      },
    ],
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tmpl-3',
    name: 'Phone Screen',
    description: 'Quick initial screening call',
    type: 'phone',
    duration: 30,
    questions: [
      {
        id: 'q9',
        question: 'Why are you interested in this position?',
        category: 'general',
        isRequired: true,
        expectedDuration: 8,
      },
      {
        id: 'q10',
        question: 'What are your salary expectations?',
        category: 'general',
        isRequired: true,
        expectedDuration: 5,
      },
      {
        id: 'q11',
        question: 'When could you start?',
        category: 'general',
        isRequired: true,
        expectedDuration: 3,
      },
    ],
    ratingCriteria: [
      {
        id: 'rc9',
        name: 'Interest Level',
        description: 'Genuine interest in the role',
        weight: 40,
      },
      {
        id: 'rc10',
        name: 'Communication',
        description: 'Clear phone communication',
        weight: 35,
      },
      {
        id: 'rc11',
        name: 'Availability',
        description: 'Timeline and logistics fit',
        weight: 25,
      },
    ],
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function getTemplates(): InterviewTemplate[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultTemplates));
    return defaultTemplates;
  }
  return JSON.parse(stored);
}

export function getTemplateById(id: string): InterviewTemplate | undefined {
  const templates = getTemplates();
  return templates.find((t) => t.id === id);
}

export function saveTemplate(template: InterviewTemplate): void {
  const templates = getTemplates();
  const index = templates.findIndex((t) => t.id === template.id);
  
  if (index >= 0) {
    templates[index] = { ...template, updatedAt: new Date().toISOString() };
  } else {
    templates.push(template);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function deleteTemplate(id: string): void {
  const templates = getTemplates();
  const filtered = templates.filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}
