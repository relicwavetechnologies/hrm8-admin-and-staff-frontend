import { FeedbackRequestTemplate } from '@/shared/types/feedbackRequestTemplate';

const TEMPLATES_KEY = 'feedback_request_templates';

export function getTemplates(): FeedbackRequestTemplate[] {
  const data = localStorage.getItem(TEMPLATES_KEY);
  return data ? JSON.parse(data) : [];
}

export function getTemplateById(id: string): FeedbackRequestTemplate | undefined {
  const templates = getTemplates();
  return templates.find(t => t.id === id);
}

export function getTemplatesByRole(role: string): FeedbackRequestTemplate[] {
  const templates = getTemplates();
  return templates.filter(t => t.role === role || !t.role);
}

export function getTemplatesByStage(stage: string): FeedbackRequestTemplate[] {
  const templates = getTemplates();
  return templates.filter(t => t.interviewStage === stage || !t.interviewStage);
}

export function createTemplate(
  template: Omit<FeedbackRequestTemplate, 'id' | 'createdAt' | 'updatedAt'>
): FeedbackRequestTemplate {
  const templates = getTemplates();
  const newTemplate: FeedbackRequestTemplate = {
    ...template,
    id: `tmpl-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  templates.push(newTemplate);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  
  return newTemplate;
}

export function updateTemplate(
  id: string,
  updates: Partial<Omit<FeedbackRequestTemplate, 'id' | 'createdAt'>>
): FeedbackRequestTemplate | null {
  const templates = getTemplates();
  const index = templates.findIndex(t => t.id === id);
  
  if (index === -1) return null;
  
  templates[index] = {
    ...templates[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  
  return templates[index];
}

export function deleteTemplate(id: string): boolean {
  const templates = getTemplates();
  const filtered = templates.filter(t => t.id !== id);
  
  if (filtered.length === templates.length) return false;
  
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(filtered));
  return true;
}

export function duplicateTemplate(id: string): FeedbackRequestTemplate | null {
  const template = getTemplateById(id);
  if (!template) return null;
  
  const { id: _, createdAt: __, updatedAt: ___, ...rest } = template;
  
  return createTemplate({
    ...rest,
    name: `${rest.name} (Copy)`,
    isDefault: false,
  });
}
