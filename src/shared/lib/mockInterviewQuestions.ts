export interface InterviewQuestion {
  id: string;
  question: string;
  category: 'technical' | 'behavioral' | 'situational' | 'cultural';
  rationale: string;
  focusArea: string;
}

export const generateInterviewQuestions = (

  concerns: string[],
  strengths: string[]
): InterviewQuestion[] => {
  const questions: InterviewQuestion[] = [];

  // Generate questions based on concerns
  if (concerns.some(c => c.toLowerCase().includes('technical'))) {
    questions.push({
      id: 'tech-1',
      question: 'Can you walk me through a recent technical challenge you faced and how you approached solving it?',
      category: 'technical',
      rationale: 'Addresses technical skill concerns mentioned in feedback',
      focusArea: 'Technical Problem Solving',
    });
  }

  if (concerns.some(c => c.toLowerCase().includes('communication'))) {
    questions.push({
      id: 'comm-1',
      question: 'Describe a time when you had to explain a complex technical concept to a non-technical stakeholder. How did you approach it?',
      category: 'behavioral',
      rationale: 'Explores communication abilities in detail',
      focusArea: 'Communication Skills',
    });
  }

  if (concerns.some(c => c.toLowerCase().includes('team') || c.toLowerCase().includes('collaboration'))) {
    questions.push({
      id: 'team-1',
      question: 'Tell me about a time when you disagreed with a team member. How did you handle it?',
      category: 'situational',
      rationale: 'Assesses teamwork and conflict resolution',
      focusArea: 'Team Collaboration',
    });
  }

  // Generate questions to explore strengths
  if (strengths.length > 0) {
    questions.push({
      id: 'strength-1',
      question: 'What projects are you most proud of, and what made them successful?',
      category: 'behavioral',
      rationale: 'Validates and deepens understanding of candidate strengths',
      focusArea: 'Achievements & Impact',
    });
  }

  // Add cultural fit questions
  questions.push(
    {
      id: 'culture-1',
      question: 'What type of work environment brings out your best work?',
      category: 'cultural',
      rationale: 'Assesses cultural fit and work style preferences',
      focusArea: 'Cultural Alignment',
    },
    {
      id: 'situational-1',
      question: 'How do you prioritize your work when you have multiple competing deadlines?',
      category: 'situational',
      rationale: 'Evaluates time management and decision-making',
      focusArea: 'Work Management',
    }
  );

  return questions.slice(0, 5);
};
