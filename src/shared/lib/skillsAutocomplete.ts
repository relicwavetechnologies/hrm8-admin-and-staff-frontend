// Mock skills dictionary for autocomplete
export const TECH_SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'Go', 'Rust', 'PHP', 'Ruby',
  'React', 'Angular', 'Vue.js', 'Next.js', 'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot',
  'HTML', 'CSS', 'Tailwind CSS', 'Bootstrap', 'Material-UI', 'SASS', 'LESS',
  'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Cassandra', 'Firebase',
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'Git', 'GitHub Actions',
  'GraphQL', 'REST API', 'Microservices', 'Agile', 'Scrum', 'TDD', 'Unit Testing', 'Jest', 'Cypress',
  'Machine Learning', 'Data Science', 'AI', 'TensorFlow', 'PyTorch', 'NLP',
  'iOS Development', 'Android Development', 'React Native', 'Flutter', 'Swift', 'Kotlin',
  'DevOps', 'Linux', 'Bash', 'PowerShell', 'Terraform', 'Ansible',
  'UI/UX Design', 'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator',
];

export const SOFT_SKILLS = [
  'Leadership', 'Communication', 'Teamwork', 'Problem Solving', 'Critical Thinking',
  'Time Management', 'Adaptability', 'Creativity', 'Emotional Intelligence', 'Conflict Resolution',
  'Project Management', 'Strategic Planning', 'Decision Making', 'Mentoring', 'Coaching',
  'Negotiation', 'Presentation Skills', 'Active Listening', 'Empathy', 'Collaboration',
  'Innovation', 'Analytical Thinking', 'Attention to Detail', 'Multitasking', 'Self-Motivation',
];

export const INDUSTRY_SKILLS = [
  'Healthcare', 'Finance', 'Banking', 'Insurance', 'Retail', 'E-commerce', 'Manufacturing',
  'Real Estate', 'Marketing', 'Sales', 'Customer Service', 'Human Resources', 'Accounting',
  'Legal', 'Education', 'Non-Profit', 'Government', 'Telecommunications', 'Transportation',
  'Supply Chain', 'Logistics', 'Quality Assurance', 'Compliance', 'Risk Management',
];

export const ALL_SKILLS = [...TECH_SKILLS, ...SOFT_SKILLS, ...INDUSTRY_SKILLS].sort();

export function searchSkills(query: string): string[] {
  if (!query) return ALL_SKILLS.slice(0, 10);
  
  const lowerQuery = query.toLowerCase();
  return ALL_SKILLS.filter(skill => 
    skill.toLowerCase().includes(lowerQuery)
  ).slice(0, 15);
}