import type { QuestionnaireQuestion, QuestionType } from '@/shared/types/questionnaireBuilder';

export interface QuestionTemplate {
  id: string;
  category: string;
  text: string;
  description?: string;
  type: QuestionType;
  options?: { text: string; score?: number }[];
  ratingConfig?: {
    min: number;
    max: number;
    minLabel?: string;
    maxLabel?: string;
  };
  tags: string[];
}

export const QUESTION_CATEGORIES = [
  'Leadership',
  'Technical Skills',
  'Communication',
  'Teamwork',
  'Problem Solving',
  'Work Ethic',
  'Adaptability',
  'Customer Service',
  'Time Management',
  'Cultural Fit',
] as const;

export const QUESTION_TEMPLATES: QuestionTemplate[] = [
  // Leadership
  {
    id: 'lead-1',
    category: 'Leadership',
    text: 'How would you rate the candidate\'s ability to lead and motivate a team?',
    type: 'rating-scale',
    ratingConfig: {
      min: 1,
      max: 5,
      minLabel: 'Poor',
      maxLabel: 'Excellent',
    },
    tags: ['leadership', 'management', 'motivation'],
  },
  {
    id: 'lead-2',
    category: 'Leadership',
    text: 'Can you provide an example of when this person successfully led a project or team through a challenging situation?',
    type: 'long-text',
    tags: ['leadership', 'examples', 'challenges'],
  },
  {
    id: 'lead-3',
    category: 'Leadership',
    text: 'Does the candidate demonstrate strategic thinking and vision?',
    type: 'yes-no',
    tags: ['leadership', 'strategy', 'vision'],
  },
  {
    id: 'lead-4',
    category: 'Leadership',
    text: 'How does this person handle conflict within their team?',
    type: 'multiple-choice',
    options: [
      { text: 'Addresses conflicts directly and fairly', score: 5 },
      { text: 'Mediates and finds compromise', score: 4 },
      { text: 'Sometimes avoids difficult conversations', score: 2 },
      { text: 'Rarely addresses conflicts effectively', score: 1 },
    ],
    tags: ['leadership', 'conflict-resolution', 'management'],
  },
  {
    id: 'lead-5',
    category: 'Leadership',
    text: 'Rate the candidate\'s ability to delegate tasks effectively',
    type: 'rating-scale',
    ratingConfig: {
      min: 1,
      max: 5,
      minLabel: 'Rarely delegates',
      maxLabel: 'Excellent delegator',
    },
    tags: ['leadership', 'delegation', 'management'],
  },

  // Technical Skills
  {
    id: 'tech-1',
    category: 'Technical Skills',
    text: 'How would you rate the candidate\'s technical proficiency in their role?',
    type: 'rating-scale',
    ratingConfig: {
      min: 1,
      max: 5,
      minLabel: 'Below expectations',
      maxLabel: 'Exceptional',
    },
    tags: ['technical', 'skills', 'proficiency'],
  },
  {
    id: 'tech-2',
    category: 'Technical Skills',
    text: 'Does this person stay current with industry trends and technologies?',
    type: 'yes-no',
    tags: ['technical', 'learning', 'development'],
  },
  {
    id: 'tech-3',
    category: 'Technical Skills',
    text: 'Can you describe the candidate\'s approach to learning new technologies or skills?',
    type: 'long-text',
    tags: ['technical', 'learning', 'adaptability'],
  },
  {
    id: 'tech-4',
    category: 'Technical Skills',
    text: 'What is the candidate\'s strongest technical skill?',
    type: 'short-text',
    tags: ['technical', 'strengths', 'expertise'],
  },
  {
    id: 'tech-5',
    category: 'Technical Skills',
    text: 'How does the candidate handle technical challenges or roadblocks?',
    type: 'multiple-choice',
    options: [
      { text: 'Proactively researches solutions', score: 5 },
      { text: 'Seeks guidance from team members', score: 4 },
      { text: 'Works through problems systematically', score: 4 },
      { text: 'Sometimes struggles to find solutions', score: 2 },
      { text: 'Often requires significant help', score: 1 },
    ],
    tags: ['technical', 'problem-solving', 'independence'],
  },

  // Communication
  {
    id: 'comm-1',
    category: 'Communication',
    text: 'How would you rate the candidate\'s written communication skills?',
    type: 'rating-scale',
    ratingConfig: {
      min: 1,
      max: 5,
      minLabel: 'Needs improvement',
      maxLabel: 'Excellent',
    },
    tags: ['communication', 'writing', 'clarity'],
  },
  {
    id: 'comm-2',
    category: 'Communication',
    text: 'How would you rate the candidate\'s verbal communication skills?',
    type: 'rating-scale',
    ratingConfig: {
      min: 1,
      max: 5,
      minLabel: 'Needs improvement',
      maxLabel: 'Excellent',
    },
    tags: ['communication', 'verbal', 'presentation'],
  },
  {
    id: 'comm-3',
    category: 'Communication',
    text: 'Is the candidate an active listener who understands others\' perspectives?',
    type: 'yes-no',
    tags: ['communication', 'listening', 'empathy'],
  },
  {
    id: 'comm-4',
    category: 'Communication',
    text: 'Describe how effectively this person communicates complex information to non-technical audiences',
    type: 'long-text',
    tags: ['communication', 'clarity', 'translation'],
  },
  {
    id: 'comm-5',
    category: 'Communication',
    text: 'How does the candidate handle difficult or sensitive conversations?',
    type: 'multiple-choice',
    options: [
      { text: 'Addresses issues professionally and tactfully', score: 5 },
      { text: 'Communicates clearly but may lack tact', score: 3 },
      { text: 'Avoids difficult conversations', score: 1 },
      { text: 'Sometimes becomes defensive', score: 2 },
    ],
    tags: ['communication', 'conflict', 'professionalism'],
  },

  // Teamwork
  {
    id: 'team-1',
    category: 'Teamwork',
    text: 'How well does this person work as part of a team?',
    type: 'rating-scale',
    ratingConfig: {
      min: 1,
      max: 5,
      minLabel: 'Prefers working alone',
      maxLabel: 'Excellent team player',
    },
    tags: ['teamwork', 'collaboration', 'cooperation'],
  },
  {
    id: 'team-2',
    category: 'Teamwork',
    text: 'Does the candidate actively contribute to team success beyond their own responsibilities?',
    type: 'yes-no',
    tags: ['teamwork', 'initiative', 'collaboration'],
  },
  {
    id: 'team-3',
    category: 'Teamwork',
    text: 'Can you provide an example of when this person went above and beyond to help their team?',
    type: 'long-text',
    tags: ['teamwork', 'examples', 'dedication'],
  },
  {
    id: 'team-4',
    category: 'Teamwork',
    text: 'How does the candidate handle disagreements with team members?',
    type: 'multiple-choice',
    options: [
      { text: 'Discusses respectfully and finds common ground', score: 5 },
      { text: 'Compromises when necessary', score: 4 },
      { text: 'Can be stubborn but eventually cooperates', score: 2 },
      { text: 'Often creates conflict', score: 1 },
    ],
    tags: ['teamwork', 'conflict-resolution', 'cooperation'],
  },
  {
    id: 'team-5',
    category: 'Teamwork',
    text: 'Rate how well the candidate shares knowledge and mentors others',
    type: 'rating-scale',
    ratingConfig: {
      min: 1,
      max: 5,
      minLabel: 'Rarely shares',
      maxLabel: 'Actively mentors',
    },
    tags: ['teamwork', 'mentoring', 'knowledge-sharing'],
  },

  // Problem Solving
  {
    id: 'prob-1',
    category: 'Problem Solving',
    text: 'How would you rate the candidate\'s analytical and problem-solving abilities?',
    type: 'rating-scale',
    ratingConfig: {
      min: 1,
      max: 5,
      minLabel: 'Limited',
      maxLabel: 'Exceptional',
    },
    tags: ['problem-solving', 'analytical', 'critical-thinking'],
  },
  {
    id: 'prob-2',
    category: 'Problem Solving',
    text: 'Does this person think creatively when approaching challenges?',
    type: 'yes-no',
    tags: ['problem-solving', 'creativity', 'innovation'],
  },
  {
    id: 'prob-3',
    category: 'Problem Solving',
    text: 'Describe a complex problem this person solved and their approach',
    type: 'long-text',
    tags: ['problem-solving', 'examples', 'methodology'],
  },
  {
    id: 'prob-4',
    category: 'Problem Solving',
    text: 'How does the candidate approach unfamiliar problems?',
    type: 'multiple-choice',
    options: [
      { text: 'Breaks down into smaller parts systematically', score: 5 },
      { text: 'Researches similar solutions', score: 4 },
      { text: 'Asks for guidance before starting', score: 3 },
      { text: 'Sometimes gets overwhelmed', score: 2 },
    ],
    tags: ['problem-solving', 'methodology', 'independence'],
  },

  // Work Ethic
  {
    id: 'work-1',
    category: 'Work Ethic',
    text: 'How would you rate the candidate\'s overall work ethic and dedication?',
    type: 'rating-scale',
    ratingConfig: {
      min: 1,
      max: 5,
      minLabel: 'Below expectations',
      maxLabel: 'Outstanding',
    },
    tags: ['work-ethic', 'dedication', 'commitment'],
  },
  {
    id: 'work-2',
    category: 'Work Ethic',
    text: 'Is this person reliable and dependable?',
    type: 'yes-no',
    tags: ['work-ethic', 'reliability', 'dependability'],
  },
  {
    id: 'work-3',
    category: 'Work Ethic',
    text: 'How does the candidate handle tight deadlines?',
    type: 'multiple-choice',
    options: [
      { text: 'Consistently meets or exceeds deadlines', score: 5 },
      { text: 'Usually meets deadlines with good quality', score: 4 },
      { text: 'Sometimes needs deadline extensions', score: 2 },
      { text: 'Often misses deadlines', score: 1 },
    ],
    tags: ['work-ethic', 'deadlines', 'time-management'],
  },
  {
    id: 'work-4',
    category: 'Work Ethic',
    text: 'Rate the quality and attention to detail in the candidate\'s work',
    type: 'rating-scale',
    ratingConfig: {
      min: 1,
      max: 5,
      minLabel: 'Often needs revisions',
      maxLabel: 'Consistently high quality',
    },
    tags: ['work-ethic', 'quality', 'attention-to-detail'],
  },

  // Adaptability
  {
    id: 'adapt-1',
    category: 'Adaptability',
    text: 'How well does this person adapt to change and new situations?',
    type: 'rating-scale',
    ratingConfig: {
      min: 1,
      max: 5,
      minLabel: 'Resists change',
      maxLabel: 'Highly adaptable',
    },
    tags: ['adaptability', 'flexibility', 'change-management'],
  },
  {
    id: 'adapt-2',
    category: 'Adaptability',
    text: 'Does the candidate remain productive during organizational changes?',
    type: 'yes-no',
    tags: ['adaptability', 'resilience', 'productivity'],
  },
  {
    id: 'adapt-3',
    category: 'Adaptability',
    text: 'Describe how this person handled a significant change in their role or responsibilities',
    type: 'long-text',
    tags: ['adaptability', 'examples', 'change-management'],
  },

  // Customer Service
  {
    id: 'cust-1',
    category: 'Customer Service',
    text: 'How would you rate the candidate\'s customer service skills?',
    type: 'rating-scale',
    ratingConfig: {
      min: 1,
      max: 5,
      minLabel: 'Needs improvement',
      maxLabel: 'Exceptional',
    },
    tags: ['customer-service', 'client-relations', 'satisfaction'],
  },
  {
    id: 'cust-2',
    category: 'Customer Service',
    text: 'Does this person handle difficult customers or clients professionally?',
    type: 'yes-no',
    tags: ['customer-service', 'professionalism', 'conflict-resolution'],
  },
  {
    id: 'cust-3',
    category: 'Customer Service',
    text: 'Rate the candidate\'s ability to build and maintain client relationships',
    type: 'rating-scale',
    ratingConfig: {
      min: 1,
      max: 5,
      minLabel: 'Limited',
      maxLabel: 'Outstanding',
    },
    tags: ['customer-service', 'relationships', 'rapport'],
  },

  // Time Management
  {
    id: 'time-1',
    category: 'Time Management',
    text: 'How effectively does this person manage their time and priorities?',
    type: 'rating-scale',
    ratingConfig: {
      min: 1,
      max: 5,
      minLabel: 'Poor prioritization',
      maxLabel: 'Excellent organization',
    },
    tags: ['time-management', 'organization', 'prioritization'],
  },
  {
    id: 'time-2',
    category: 'Time Management',
    text: 'Can the candidate successfully manage multiple projects simultaneously?',
    type: 'yes-no',
    tags: ['time-management', 'multitasking', 'organization'],
  },
  {
    id: 'time-3',
    category: 'Time Management',
    text: 'How does the candidate balance competing priorities?',
    type: 'multiple-choice',
    options: [
      { text: 'Assesses urgency and adjusts accordingly', score: 5 },
      { text: 'Creates clear priority lists', score: 4 },
      { text: 'Sometimes struggles with prioritization', score: 2 },
      { text: 'Often overwhelmed by multiple tasks', score: 1 },
    ],
    tags: ['time-management', 'prioritization', 'multitasking'],
  },

  // Cultural Fit
  {
    id: 'cult-1',
    category: 'Cultural Fit',
    text: 'How well did this person fit with your organization\'s culture and values?',
    type: 'rating-scale',
    ratingConfig: {
      min: 1,
      max: 5,
      minLabel: 'Poor fit',
      maxLabel: 'Perfect fit',
    },
    tags: ['cultural-fit', 'values', 'alignment'],
  },
  {
    id: 'cult-2',
    category: 'Cultural Fit',
    text: 'Would you rehire this person if given the opportunity?',
    type: 'yes-no',
    tags: ['cultural-fit', 'recommendation', 'rehire'],
  },
  {
    id: 'cult-3',
    category: 'Cultural Fit',
    text: 'What makes this person a good cultural fit (or not) for a collaborative, fast-paced environment?',
    type: 'long-text',
    tags: ['cultural-fit', 'environment', 'compatibility'],
  },
];

export function getQuestionsByCategory(category: string): QuestionTemplate[] {
  return QUESTION_TEMPLATES.filter(q => q.category === category);
}

export function searchQuestions(query: string): QuestionTemplate[] {
  const lowerQuery = query.toLowerCase();
  return QUESTION_TEMPLATES.filter(q => 
    q.text.toLowerCase().includes(lowerQuery) ||
    q.category.toLowerCase().includes(lowerQuery) ||
    q.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

export function convertTemplateToQuestion(template: QuestionTemplate, order: number): QuestionnaireQuestion {
  const baseQuestion: QuestionnaireQuestion = {
    id: `question-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: template.type,
    text: template.text,
    description: template.description,
    required: false,
    order,
  };

  if (template.options) {
    baseQuestion.options = template.options.map((opt, idx) => ({
      id: `option-${Date.now()}-${idx}`,
      text: opt.text,
      score: opt.score,
    }));
  }

  if (template.ratingConfig) {
    baseQuestion.ratingConfig = { ...template.ratingConfig };
  }

  if (template.options && template.options.some(opt => opt.score !== undefined)) {
    baseQuestion.scoringEnabled = true;
    baseQuestion.maxScore = Math.max(...template.options.map(opt => opt.score || 0));
  }

  return baseQuestion;
}
