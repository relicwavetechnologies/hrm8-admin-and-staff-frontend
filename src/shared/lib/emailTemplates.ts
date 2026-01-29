export interface EmailTemplate {
  id: string;
  name: string;
  type: string;
  message: string;
  isCustom: boolean;
}

const STORAGE_KEY = "onboarding_email_templates";

export const defaultTemplates: EmailTemplate[] = [
  {
    id: "welcome",
    name: "Welcome Email",
    type: "welcome",
    message: "Welcome to the team, {{employee_name}}! We're excited to have you onboard as our new {{job_title}} in the {{department}} department. Your onboarding process has been prepared and we look forward to working with you starting {{start_date}}.",
    isCustom: false,
  },
  {
    id: "reminder",
    name: "Onboarding Reminder",
    type: "reminder",
    message: "Hi {{employee_name}}, this is a friendly reminder about your pending onboarding tasks. Please complete them at your earliest convenience to ensure a smooth start on {{start_date}}. If you need any assistance, please reach out to {{manager_name}}.",
    isCustom: false,
  },
  {
    id: "checkin",
    name: "Check-in Email",
    type: "checkin",
    message: "Hi {{employee_name}}, we hope your onboarding as {{job_title}} is going well! Please let us know if you have any questions or need any assistance. Your manager {{manager_name}} is here to help.",
    isCustom: false,
  },
];

export function getSavedTemplates(): EmailTemplate[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    return JSON.parse(saved);
  } catch (error) {
    console.error("Error loading saved templates:", error);
    return [];
  }
}

export function getAllTemplates(): EmailTemplate[] {
  return [...defaultTemplates, ...getSavedTemplates()];
}

export function saveTemplate(template: Omit<EmailTemplate, "id" | "isCustom">): EmailTemplate {
  const savedTemplates = getSavedTemplates();
  const newTemplate: EmailTemplate = {
    ...template,
    id: `custom-${Date.now()}`,
    isCustom: true,
  };
  
  const updatedTemplates = [...savedTemplates, newTemplate];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTemplates));
  
  return newTemplate;
}

export function deleteTemplate(id: string): void {
  const savedTemplates = getSavedTemplates();
  const updatedTemplates = savedTemplates.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTemplates));
}
