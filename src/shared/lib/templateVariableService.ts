export interface TemplateVariable {
  name: string;
  placeholder: string;
  description: string;
  example: string;
  category: 'candidate' | 'job' | 'company' | 'interview' | 'general';
}

export const availableVariables: TemplateVariable[] = [
  {
    name: 'Candidate Name',
    placeholder: '{candidateName}',
    description: 'Full name of the candidate',
    example: 'John Doe',
    category: 'candidate',
  },
  {
    name: 'Candidate Email',
    placeholder: '{candidateEmail}',
    description: 'Email address of the candidate',
    example: 'john.doe@example.com',
    category: 'candidate',
  },
  {
    name: 'Job Title',
    placeholder: '{jobTitle}',
    description: 'Title of the job position',
    example: 'Senior Software Engineer',
    category: 'job',
  },
  {
    name: 'Job Location',
    placeholder: '{jobLocation}',
    description: 'Location of the job',
    example: 'San Francisco, CA',
    category: 'job',
  },
  {
    name: 'Company Name',
    placeholder: '{companyName}',
    description: 'Name of the company',
    example: 'Tech Corp Inc.',
    category: 'company',
  },
  {
    name: 'Interview Date',
    placeholder: '{interviewDate}',
    description: 'Date of the scheduled interview',
    example: 'March 15, 2024',
    category: 'interview',
  },
  {
    name: 'Interview Time',
    placeholder: '{interviewTime}',
    description: 'Time of the scheduled interview',
    example: '2:00 PM',
    category: 'interview',
  },
  {
    name: 'Interviewer Name',
    placeholder: '{interviewerName}',
    description: 'Name of the interviewer',
    example: 'Sarah Johnson',
    category: 'interview',
  },
  {
    name: 'Application Date',
    placeholder: '{applicationDate}',
    description: 'Date when the candidate applied',
    example: 'February 20, 2024',
    category: 'general',
  },
];

export function getVariablesByCategory(category?: TemplateVariable['category']): TemplateVariable[] {
  if (!category) return availableVariables;
  return availableVariables.filter(v => v.category === category);
}

export function validateTemplate(template: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const variablePlaceholders = availableVariables.map(v => v.placeholder);
  
  // Find all variables in the template
  const variablesInTemplate = template.match(/\{[^}]+\}/g) || [];
  
  // Check for invalid variables
  variablesInTemplate.forEach(variable => {
    if (!variablePlaceholders.includes(variable)) {
      errors.push(`Unknown variable: ${variable}`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

export function replaceVariables(template: string, data: Record<string, any>): string {
  let result = template;
  
  availableVariables.forEach(variable => {
    const key = variable.placeholder.replace(/[{}]/g, '');
    if (data[key]) {
      result = result.replace(new RegExp(variable.placeholder.replace(/[{}]/g, '\\{$&\\}'), 'g'), data[key]);
    }
  });
  
  return result;
}

export function suggestVariables(context: string, cursorPosition: number): TemplateVariable[] {
  // Simple suggestion logic - in a real app, this would be more sophisticated
  const textBeforeCursor = context.substring(0, cursorPosition);
  const lastWord = textBeforeCursor.split(/\s/).pop() || '';
  
  if (!lastWord.includes('{')) return [];
  
  const searchTerm = lastWord.replace('{', '').toLowerCase();
  
  return availableVariables.filter(variable => 
    variable.name.toLowerCase().includes(searchTerm) ||
    variable.placeholder.toLowerCase().includes(searchTerm)
  );
}
