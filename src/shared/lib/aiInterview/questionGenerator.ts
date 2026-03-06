import type { InterviewQuestion, QuestionCategory } from '@/shared/types/aiInterview';

const PREDEFINED_QUESTIONS: Record<QuestionCategory, InterviewQuestion[]> = {
  technical: [
    {
      id: 'tech-1',
      question: 'Can you walk me through a complex technical problem you solved recently?',
      category: 'technical',
      rationale: 'Assesses problem-solving and technical depth',
      expectedKeywords: ['problem', 'solution', 'approach', 'result'],
      followUpQuestions: ['What alternative approaches did you consider?', 'How did you measure success?'],
      order: 1
    },
    {
      id: 'tech-2',
      question: 'How do you stay current with new technologies and industry trends?',
      category: 'technical',
      rationale: 'Evaluates continuous learning and growth mindset',
      expectedKeywords: ['learning', 'courses', 'community', 'practice'],
      followUpQuestions: ['What technology are you most excited about learning next?'],
      order: 2
    },
    {
      id: 'tech-3',
      question: 'Describe a time when you had to debug a particularly difficult issue.',
      category: 'technical',
      rationale: 'Tests debugging skills and persistence',
      expectedKeywords: ['debugging', 'tools', 'investigation', 'resolved'],
      followUpQuestions: ['What debugging strategies do you typically use?'],
      order: 3
    }
  ],
  behavioral: [
    {
      id: 'behav-1',
      question: 'Tell me about a time when you had to work with a difficult team member.',
      category: 'behavioral',
      rationale: 'Evaluates interpersonal skills and conflict resolution',
      expectedKeywords: ['communication', 'resolution', 'outcome', 'learned'],
      followUpQuestions: ['How would you handle it differently now?'],
      order: 1
    },
    {
      id: 'behav-2',
      question: 'Describe a situation where you had to meet a tight deadline.',
      category: 'behavioral',
      rationale: 'Assesses time management and stress handling',
      expectedKeywords: ['prioritize', 'manage', 'deliver', 'pressure'],
      followUpQuestions: ['What strategies do you use to manage competing priorities?'],
      order: 2
    },
    {
      id: 'behav-3',
      question: 'Can you give an example of when you showed leadership?',
      category: 'behavioral',
      rationale: 'Evaluates leadership potential and initiative',
      expectedKeywords: ['led', 'initiative', 'motivated', 'result'],
      followUpQuestions: ['What leadership style resonates most with you?'],
      order: 3
    }
  ],
  situational: [
    {
      id: 'sit-1',
      question: 'How would you handle disagreeing with a decision made by senior leadership?',
      category: 'situational',
      rationale: 'Tests judgment and professional communication',
      expectedKeywords: ['approach', 'communicate', 'respect', 'perspective'],
      followUpQuestions: ['Have you been in this situation before?'],
      order: 1
    },
    {
      id: 'sit-2',
      question: 'What would you do if you discovered a critical bug right before a major release?',
      category: 'situational',
      rationale: 'Evaluates decision-making under pressure',
      expectedKeywords: ['assess', 'communicate', 'decision', 'stakeholders'],
      followUpQuestions: ['How do you balance quality with timelines?'],
      order: 2
    }
  ],
  cultural: [
    {
      id: 'cult-1',
      question: 'What kind of work environment helps you do your best work?',
      category: 'cultural',
      rationale: 'Assesses cultural fit and work preferences',
      expectedKeywords: ['environment', 'collaborate', 'autonomy', 'support'],
      followUpQuestions: ['How do you handle remote vs office work?'],
      order: 1
    },
    {
      id: 'cult-2',
      question: 'How do you define success in your role?',
      category: 'cultural',
      rationale: 'Evaluates values alignment and motivation',
      expectedKeywords: ['success', 'impact', 'goals', 'measure'],
      followUpQuestions: ['What motivates you most in your work?'],
      order: 2
    }
  ],
  experience: [
    {
      id: 'exp-1',
      question: 'What was your biggest professional achievement in the last year?',
      category: 'experience',
      rationale: 'Identifies accomplishments and impact',
      expectedKeywords: ['achievement', 'impact', 'result', 'proud'],
      followUpQuestions: ['What made this particularly meaningful to you?'],
      order: 1
    },
    {
      id: 'exp-2',
      question: 'Tell me about a project that didn\'t go as planned.',
      category: 'experience',
      rationale: 'Assesses learning from failure and resilience',
      expectedKeywords: ['challenge', 'learned', 'adapt', 'improve'],
      followUpQuestions: ['How did this experience change your approach?'],
      order: 2
    }
  ]
};

export function getPredefinedQuestions(category?: QuestionCategory): InterviewQuestion[] {
  if (category) {
    return PREDEFINED_QUESTIONS[category] || [];
  }
  return Object.values(PREDEFINED_QUESTIONS).flat();
}

export function generateQuestionsForJob(_jobTitle: string, count: number = 10): InterviewQuestion[] {
  const questions: InterviewQuestion[] = [];
  const categories: QuestionCategory[] = ['technical', 'behavioral', 'cultural', 'experience'];

  categories.forEach((category, idx) => {
    const categoryQuestions = PREDEFINED_QUESTIONS[category];
    const questionsToAdd = Math.ceil(count / categories.length);

    categoryQuestions.slice(0, questionsToAdd).forEach((q, qIdx) => {
      questions.push({
        ...q,
        id: `${category}-${idx}-${qIdx}`,
        order: questions.length + 1
      });
    });
  });

  return questions.slice(0, count);
}

export function generateQuestionsForCandidate(
  _candidateName: string,
  jobTitle: string,
  count: number = 10
): InterviewQuestion[] {
  return generateQuestionsForJob(jobTitle, count);
}

export function generateHybridQuestions(jobTitle: string, count: number = 10): InterviewQuestion[] {
  const predefined = getPredefinedQuestions().slice(0, Math.ceil(count / 2));
  const aiGenerated = generateQuestionsForJob(jobTitle, Math.floor(count / 2));

  return [...predefined, ...aiGenerated].slice(0, count);
}
