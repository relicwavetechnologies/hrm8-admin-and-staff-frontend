import type { QuestionnaireTemplate } from '@/shared/types/referee';

const TEMPLATES_KEY = 'hrm8_questionnaire_templates';

const DEFAULT_TEMPLATES: QuestionnaireTemplate[] = [
  {
    id: 'standard-professional',
    name: 'Standard Professional Reference',
    description: 'Comprehensive professional reference check covering performance, reliability, and teamwork',
    isDefault: true,
    category: 'general',
    questions: [
      {
        id: 'q1',
        type: 'rating',
        question: 'How would you rate this candidate\'s overall performance?',
        required: true,
        ratingScale: { min: 1, max: 5, labels: ['Poor', 'Below Average', 'Average', 'Good', 'Excellent'] },
        order: 1
      },
      {
        id: 'q2',
        type: 'rating',
        question: 'How would you rate their reliability and attendance?',
        required: true,
        ratingScale: { min: 1, max: 5 },
        order: 2
      },
      {
        id: 'q3',
        type: 'rating',
        question: 'How would you rate their teamwork and collaboration skills?',
        required: true,
        ratingScale: { min: 1, max: 5 },
        order: 3
      },
      {
        id: 'q4',
        type: 'rating',
        question: 'How would you rate their communication skills?',
        required: true,
        ratingScale: { min: 1, max: 5 },
        order: 4
      },
      {
        id: 'q5',
        type: 'yes-no',
        question: 'Would you re-hire this person if given the opportunity?',
        required: true,
        order: 5
      },
      {
        id: 'q6',
        type: 'text',
        question: 'What are this person\'s greatest strengths?',
        required: true,
        maxLength: 500,
        placeholder: 'Describe their key strengths...',
        order: 6
      },
      {
        id: 'q7',
        type: 'text',
        question: 'What areas could this person improve?',
        required: false,
        maxLength: 500,
        placeholder: 'Areas for development...',
        order: 7
      },
      {
        id: 'q8',
        type: 'textarea',
        question: 'Any additional comments or information you\'d like to share?',
        required: false,
        maxLength: 1000,
        placeholder: 'Additional feedback...',
        order: 8
      }
    ],
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'leadership-reference',
    name: 'Leadership Reference',
    description: 'Focused on leadership qualities, team management, and strategic thinking',
    isDefault: false,
    category: 'leadership',
    questions: [
      {
        id: 'q1',
        type: 'rating',
        question: 'How would you rate their leadership abilities?',
        required: true,
        ratingScale: { min: 1, max: 5 },
        order: 1
      },
      {
        id: 'q2',
        type: 'rating',
        question: 'How effective were they at motivating team members?',
        required: true,
        ratingScale: { min: 1, max: 5 },
        order: 2
      },
      {
        id: 'q3',
        type: 'rating',
        question: 'How would you rate their decision-making skills?',
        required: true,
        ratingScale: { min: 1, max: 5 },
        order: 3
      },
      {
        id: 'q4',
        type: 'rating',
        question: 'How effective were they at conflict resolution?',
        required: true,
        ratingScale: { min: 1, max: 5 },
        order: 4
      },
      {
        id: 'q5',
        type: 'rating',
        question: 'How would you rate their strategic thinking?',
        required: true,
        ratingScale: { min: 1, max: 5 },
        order: 5
      },
      {
        id: 'q6',
        type: 'yes-no',
        question: 'Did they successfully manage and develop their team members?',
        required: true,
        order: 6
      },
      {
        id: 'q7',
        type: 'text',
        question: 'Describe their leadership style',
        required: true,
        maxLength: 500,
        order: 7
      },
      {
        id: 'q8',
        type: 'textarea',
        question: 'Can you provide an example of a challenging situation they handled well?',
        required: false,
        maxLength: 1000,
        order: 8
      }
    ],
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'quick-reference',
    name: 'Quick Reference',
    description: 'Brief 5-question reference check for fast turnaround',
    isDefault: false,
    category: 'quick',
    questions: [
      {
        id: 'q1',
        type: 'rating',
        question: 'Overall performance rating',
        required: true,
        ratingScale: { min: 1, max: 5 },
        order: 1
      },
      {
        id: 'q2',
        type: 'rating',
        question: 'Work quality rating',
        required: true,
        ratingScale: { min: 1, max: 5 },
        order: 2
      },
      {
        id: 'q3',
        type: 'yes-no',
        question: 'Would you recommend this candidate?',
        required: true,
        order: 3
      },
      {
        id: 'q4',
        type: 'text',
        question: 'Key strengths',
        required: true,
        maxLength: 300,
        order: 4
      },
      {
        id: 'q5',
        type: 'text',
        question: 'Any concerns?',
        required: false,
        maxLength: 300,
        order: 5
      }
    ],
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

function initializeStorage() {
  const existing = localStorage.getItem(TEMPLATES_KEY);
  if (!existing) {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(DEFAULT_TEMPLATES));
  }
}

export function saveTemplate(template: QuestionnaireTemplate): void {
  initializeStorage();
  const templates = getTemplates();
  templates.push(template);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

export function getTemplates(): QuestionnaireTemplate[] {
  initializeStorage();
  const data = localStorage.getItem(TEMPLATES_KEY);
  return data ? JSON.parse(data) : DEFAULT_TEMPLATES;
}

export function getTemplateById(id: string): QuestionnaireTemplate | undefined {
  return getTemplates().find(t => t.id === id);
}

export function getQuestionnaireTemplate(id: string): QuestionnaireTemplate | undefined {
  if (id === 'default') {
    return getDefaultTemplate();
  }
  return getTemplateById(id);
}

export function getDefaultTemplate(): QuestionnaireTemplate {
  const templates = getTemplates();
  return templates.find(t => t.isDefault) || templates[0];
}

export function updateTemplate(id: string, updates: Partial<QuestionnaireTemplate>): void {
  const templates = getTemplates();
  const index = templates.findIndex(t => t.id === id);
  if (index !== -1) {
    templates[index] = {
      ...templates[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  }
}

export function deleteTemplate(id: string): void {
  const templates = getTemplates();
  const filtered = templates.filter(t => t.id !== id || t.isDefault);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(filtered));
}

export function duplicateTemplate(id: string, newName: string): QuestionnaireTemplate {
  const original = getTemplateById(id);
  if (!original) throw new Error('Template not found');
  
  const duplicate: QuestionnaireTemplate = {
    ...original,
    id: `${original.id}-copy-${Date.now()}`,
    name: newName,
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  saveTemplate(duplicate);
  return duplicate;
}
