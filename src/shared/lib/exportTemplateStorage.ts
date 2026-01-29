import { z } from 'zod';

export interface ExportTemplate {
  id: string;
  name: string;
  description?: string;
  fields: string[];
  currencyFields: string[];
  createdAt: string;
  updatedAt: string;
}

// Validation schema
const exportTemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "Template name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().trim().max(500, "Description must be less than 500 characters").optional(),
  fields: z.array(z.string()).min(1, "At least one field must be selected"),
  currencyFields: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const STORAGE_KEY = 'hrm8_export_templates';

/**
 * Get all saved export templates
 */
export function getExportTemplates(): ExportTemplate[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const templates = JSON.parse(stored);
    
    // Validate each template
    return templates.filter((template: any) => {
      try {
        exportTemplateSchema.parse(template);
        return true;
      } catch {
        console.warn('Invalid template found and skipped:', template);
        return false;
      }
    });
  } catch (error) {
    console.error('Failed to load export templates:', error);
    return [];
  }
}

/**
 * Get a specific template by ID
 */
export function getExportTemplate(id: string): ExportTemplate | null {
  const templates = getExportTemplates();
  return templates.find(t => t.id === id) || null;
}

/**
 * Save a new export template
 */
export function saveExportTemplate(
  template: Omit<ExportTemplate, 'id' | 'createdAt' | 'updatedAt'>
): ExportTemplate {
  // Validate input
  exportTemplateSchema.omit({ 
    id: true, 
    createdAt: true, 
    updatedAt: true 
  }).parse(template);
  
  const templates = getExportTemplates();
  
  const newTemplate: ExportTemplate = {
    id: generateTemplateId(),
    name: template.name,
    description: template.description,
    fields: template.fields,
    currencyFields: template.currencyFields,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  templates.push(newTemplate);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  
  return newTemplate;
}

/**
 * Update an existing export template
 */
export function updateExportTemplate(
  id: string,
  updates: Partial<Omit<ExportTemplate, 'id' | 'createdAt' | 'updatedAt'>>
): ExportTemplate | null {
  const templates = getExportTemplates();
  const index = templates.findIndex(t => t.id === id);
  
  if (index === -1) return null;
  
  const existingTemplate = templates[index];
  const updatedTemplate: ExportTemplate = {
    id: existingTemplate.id,
    name: updates.name ?? existingTemplate.name,
    description: updates.description ?? existingTemplate.description,
    fields: updates.fields ?? existingTemplate.fields,
    currencyFields: updates.currencyFields ?? existingTemplate.currencyFields,
    createdAt: existingTemplate.createdAt,
    updatedAt: new Date().toISOString(),
  };
  
  // Validate updated template
  try {
    exportTemplateSchema.parse(updatedTemplate);
  } catch (error) {
    console.error('Invalid template update:', error);
    return null;
  }
  
  templates[index] = updatedTemplate;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  
  return updatedTemplate;
}

/**
 * Delete an export template
 */
export function deleteExportTemplate(id: string): boolean {
  const templates = getExportTemplates();
  const filteredTemplates = templates.filter(t => t.id !== id);
  
  if (filteredTemplates.length === templates.length) {
    return false; // Template not found
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredTemplates));
  return true;
}

/**
 * Duplicate an export template
 */
export function duplicateExportTemplate(id: string): ExportTemplate | null {
  const template = getExportTemplate(id);
  if (!template) return null;
  
  const duplicated = saveExportTemplate({
    name: `${template.name} (Copy)`,
    description: template.description,
    fields: [...template.fields],
    currencyFields: [...template.currencyFields],
  });
  
  return duplicated;
}

/**
 * Validate template name uniqueness
 */
export function isTemplateNameUnique(name: string, excludeId?: string): boolean {
  const templates = getExportTemplates();
  return !templates.some(t => 
    t.name.toLowerCase() === name.toLowerCase() && t.id !== excludeId
  );
}

/**
 * Generate a unique template ID
 */
function generateTemplateId(): string {
  return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Export templates for backup
 */
export function exportTemplatesBackup(): string {
  const templates = getExportTemplates();
  return JSON.stringify(templates, null, 2);
}

/**
 * Import templates from backup
 */
export function importTemplatesBackup(jsonString: string): {
  success: boolean;
  imported: number;
  errors: string[];
} {
  const errors: string[] = [];
  let imported = 0;
  
  try {
    const templates = JSON.parse(jsonString);
    
    if (!Array.isArray(templates)) {
      return {
        success: false,
        imported: 0,
        errors: ['Invalid backup format: expected an array of templates']
      };
    }
    
    const existingTemplates = getExportTemplates();
    
    templates.forEach((template: any, index: number) => {
      try {
        // Validate template
        exportTemplateSchema.omit({ id: true }).parse(template);
        
        // Create new template (generates new ID to avoid conflicts)
        const newTemplate: ExportTemplate = {
          ...template,
          id: generateTemplateId(),
          createdAt: template.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        existingTemplates.push(newTemplate);
        imported++;
      } catch (error) {
        errors.push(`Template ${index + 1}: ${error instanceof Error ? error.message : 'Invalid format'}`);
      }
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingTemplates));
    
    return {
      success: imported > 0,
      imported,
      errors
    };
  } catch (error) {
    return {
      success: false,
      imported: 0,
      errors: ['Failed to parse backup file']
    };
  }
}
