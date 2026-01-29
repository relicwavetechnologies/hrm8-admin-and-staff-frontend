import { TemplateVariable } from '../api/emailTemplateService';

/**
 * Available merge fields for email templates
 */
export const MERGE_FIELDS: TemplateVariable[] = [
  // Candidate fields
  { key: 'candidateName', label: 'Candidate Name', description: 'Full name of the candidate', example: 'John Doe', category: 'Candidate' },
  { key: 'candidateFirstName', label: 'First Name', description: 'First name only', example: 'John', category: 'Candidate' },
  { key: 'candidateLastName', label: 'Last Name', description: 'Last name only', example: 'Doe', category: 'Candidate' },
  { key: 'candidateEmail', label: 'Email', description: 'Candidate email address', example: 'john@example.com', category: 'Candidate' },
  { key: 'candidatePhone', label: 'Phone', description: 'Candidate phone number', example: '+1 555-0123', category: 'Candidate' },
  
  // Application fields
  { key: 'applicationDate', label: 'Application Date', description: 'When they applied', example: 'January 1, 2025', category: 'Application' },
  { key: 'currentStage', label: 'Current Stage', description: 'Current pipeline stage', example: 'Technical Interview', category: 'Application' },
  { key: 'applicationStatus', label: 'Application Status', description: 'Current status', example: 'SCREENING', category: 'Application' },
  { key: 'score', label: 'Score', description: 'Application score', example: '85', category: 'Application' },
  { key: 'rank', label: 'Rank', description: 'Application rank', example: '1', category: 'Application' },
  
  // Job fields
  { key: 'jobTitle', label: 'Job Title', description: 'Position title', example: 'Senior Software Engineer', category: 'Job' },
  { key: 'companyName', label: 'Company Name', description: 'Your company name', example: 'Acme Corp', category: 'Job' },
  { key: 'jobLocation', label: 'Job Location', description: 'Job location', example: 'San Francisco, CA', category: 'Job' },
  { key: 'jobDepartment', label: 'Job Department', description: 'Job department', example: 'Engineering', category: 'Job' },
  
  // Round fields
  { key: 'roundName', label: 'Round Name', description: 'Round name', example: 'Technical Interview', category: 'Round' },
  { key: 'roundType', label: 'Round Type', description: 'Round type', example: 'INTERVIEW', category: 'Round' },
  
  // Recruiter fields
  { key: 'recruiterName', label: 'Recruiter Name', description: 'Your name', example: 'Jane Smith', category: 'Recruiter' },
  { key: 'recruiterEmail', label: 'Recruiter Email', description: 'Your email', example: 'jane@acme.com', category: 'Recruiter' },
];

/**
 * Get merge fields by category
 */
export function getMergeFieldsByCategory(): Record<string, TemplateVariable[]> {
  const categories: Record<string, TemplateVariable[]> = {};
  
  MERGE_FIELDS.forEach(field => {
    if (!categories[field.category]) {
      categories[field.category] = [];
    }
    categories[field.category].push(field);
  });
  
  return categories;
}

/**
 * Extract merge fields from text
 */
export function extractMergeFields(text: string): string[] {
  const regex = /\{\{(\w+)\}\}/g;
  const fields = new Set<string>();
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    fields.add(match[1]);
  }
  
  return Array.from(fields);
}

/**
 * Validate merge field syntax
 */
export function validateMergeFields(text: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for unmatched braces
  const openBraces = (text.match(/\{\{/g) || []).length;
  const closeBraces = (text.match(/\}\}/g) || []).length;
  
  if (openBraces !== closeBraces) {
    errors.push('Unmatched merge field braces detected');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Insert merge field into text at cursor position
 */
export function insertMergeField(
  text: string,
  cursorPosition: number,
  fieldKey: string
): { newText: string; newCursorPosition: number } {
  const field = `{{${fieldKey}}}`;
  const newText = text.slice(0, cursorPosition) + field + text.slice(cursorPosition);
  const newCursorPosition = cursorPosition + field.length;
  
  return { newText, newCursorPosition };
}

