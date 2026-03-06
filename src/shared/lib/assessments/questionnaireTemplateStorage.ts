import type { QuestionnaireTemplate } from '@/shared/types/questionnaireBuilder';

const QUESTIONNAIRE_TEMPLATES_KEY = 'hrm8_questionnaire_templates';

function initializeStorage() {
  if (!localStorage.getItem(QUESTIONNAIRE_TEMPLATES_KEY)) {
    localStorage.setItem(QUESTIONNAIRE_TEMPLATES_KEY, JSON.stringify([]));
  }
}

export function saveQuestionnaireTemplate(template: QuestionnaireTemplate): void {
  initializeStorage();
  const templates = getQuestionnaireTemplates();
  
  const existingIndex = templates.findIndex(t => t.id === template.id);
  if (existingIndex !== -1) {
    templates[existingIndex] = {
      ...template,
      updatedAt: new Date().toISOString(),
      version: templates[existingIndex].version + 1,
    };
  } else {
    templates.push(template);
  }
  
  localStorage.setItem(QUESTIONNAIRE_TEMPLATES_KEY, JSON.stringify(templates));
}

export function getQuestionnaireTemplates(): QuestionnaireTemplate[] {
  initializeStorage();
  const data = localStorage.getItem(QUESTIONNAIRE_TEMPLATES_KEY);
  return data ? JSON.parse(data) : [];
}

export function getQuestionnaireTemplateById(id: string): QuestionnaireTemplate | undefined {
  return getQuestionnaireTemplates().find(t => t.id === id);
}

export function deleteQuestionnaireTemplate(id: string): void {
  const templates = getQuestionnaireTemplates();
  const filtered = templates.filter(t => t.id !== id);
  localStorage.setItem(QUESTIONNAIRE_TEMPLATES_KEY, JSON.stringify(filtered));
}

export function duplicateQuestionnaireTemplate(id: string): QuestionnaireTemplate | null {
  const template = getQuestionnaireTemplateById(id);
  if (!template) return null;
  
  const duplicate: QuestionnaireTemplate = {
    ...template,
    id: `questionnaire-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: `${template.name} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
  };
  
  saveQuestionnaireTemplate(duplicate);
  return duplicate;
}
