import type { Application } from '@/shared/types/application';

export interface AIInterviewQuestion {
  id: string;
  question: string;
  category: 'technical' | 'behavioral' | 'situational' | 'cultural' | 'competency';
  rationale: string;
  focusArea: string;
  difficulty: 'easy' | 'medium' | 'hard';
  followUp?: string;
}

export interface QuestionGenerationConfig {
  candidateName: string;
  candidateSkills: string[];
  candidateExperience?: string;
  jobTitle: string;
  jobRequirements?: string[];
  jobLevel?: string;
  companyName: string;
  focusAreas?: string[];
  questionCount?: number;
}

/**
 * Generate AI-powered interview questions based on candidate profile and job requirements
 * Frontend mock implementation - actual AI integration will be added later
 */
export function generateAIInterviewQuestions(config: QuestionGenerationConfig): AIInterviewQuestion[] {
  const {
    candidateName: _candidateName,
    candidateSkills,
    candidateExperience,
    jobTitle,
    jobRequirements = [],
    jobLevel: _jobLevel = 'mid',
    companyName,
    focusAreas: _focusAreas = [],
    questionCount = 8
  } = config;

  const questions: AIInterviewQuestion[] = [];
  let questionId = 1;

  // Technical questions based on candidate skills
  if (candidateSkills.length > 0) {
    const topSkills = candidateSkills.slice(0, 3);
    topSkills.forEach(skill => {
      questions.push({
        id: `tech-${questionId++}`,
        question: `Can you walk me through a recent project where you used ${skill}? What challenges did you face and how did you overcome them?`,
        category: 'technical',
        rationale: `Candidate lists ${skill} as a key competency - this validates their hands-on experience`,
        focusArea: skill,
        difficulty: 'medium',
        followUp: `What would you do differently if you could approach that project again?`
      });
    });
  }

  // Behavioral questions based on experience level
  if (candidateExperience) {
    questions.push({
      id: `behav-${questionId++}`,
      question: `With ${candidateExperience} of experience, what would you say is your most significant professional achievement? Walk me through the impact it had.`,
      category: 'behavioral',
      rationale: `Assesses their ability to reflect on career progression and measure impact`,
      focusArea: 'Career Development',
      difficulty: 'medium',
      followUp: `What skills did you develop through that experience that are relevant to this role?`
    });
  }

  // Role-specific technical questions
  if (jobTitle.toLowerCase().includes('senior') || jobTitle.toLowerCase().includes('lead')) {
    questions.push({
      id: `tech-${questionId++}`,
      question: `As a ${jobTitle}, how would you approach mentoring junior team members while maintaining your own technical contributions?`,
      category: 'technical',
      rationale: `Senior role requires both technical excellence and leadership capabilities`,
      focusArea: 'Technical Leadership',
      difficulty: 'hard',
      followUp: `Can you share an example of when you successfully balanced both responsibilities?`
    });
  }

  // Situational questions for problem-solving
  questions.push({
    id: `sit-${questionId++}`,
    question: `Imagine you're starting at ${companyName} as ${jobTitle} and discover a critical system issue that's affecting customers. How would you handle the situation in your first week?`,
    category: 'situational',
    rationale: `Tests problem-solving ability, prioritization, and communication in high-pressure scenarios`,
    focusArea: 'Crisis Management',
    difficulty: 'hard',
    followUp: `How would you balance fixing the immediate issue versus understanding the root cause?`
  });

  // Cultural fit questions
  questions.push({
    id: `cult-${questionId++}`,
    question: `What type of work environment and team culture helps you perform at your best? What are your non-negotiables?`,
    category: 'cultural',
    rationale: `Ensures alignment between candidate preferences and company culture`,
    focusArea: 'Cultural Alignment',
    difficulty: 'easy',
    followUp: `How do you adapt when working in environments that differ from your ideal?`
  });

  // Competency-based on job requirements
  if (jobRequirements.length > 0) {
    const keyRequirement = jobRequirements[0];
    questions.push({
      id: `comp-${questionId++}`,
      question: `This role requires strong ${keyRequirement}. Can you describe a time when you demonstrated this competency and the outcome you achieved?`,
      category: 'competency',
      rationale: `Directly validates candidate meets core job requirement: ${keyRequirement}`,
      focusArea: keyRequirement,
      difficulty: 'medium',
      followUp: `What did you learn from that experience that you'd apply to this role?`
    });
  }

  // Communication and collaboration
  questions.push({
    id: `behav-${questionId++}`,
    question: `Tell me about a time when you had to explain a complex technical concept to non-technical stakeholders. How did you approach it?`,
    category: 'behavioral',
    rationale: `Communication skills are critical for effective collaboration across teams`,
    focusArea: 'Communication',
    difficulty: 'medium',
    followUp: `How did you ensure they understood, and what was the outcome?`
  });

  // Growth mindset and learning
  questions.push({
    id: `behav-${questionId++}`,
    question: `What's a skill or technology you've learned recently, and what motivated you to learn it? How are you applying it?`,
    category: 'behavioral',
    rationale: `Assesses continuous learning mindset and adaptability - crucial for fast-paced environments`,
    focusArea: 'Growth & Learning',
    difficulty: 'easy',
    followUp: `How do you typically approach learning new skills while managing your current workload?`
  });

  // Return requested number of questions
  return questions.slice(0, questionCount);
}

/**
 * Generate questions from application data
 */
export function generateQuestionsFromApplication(
  application: Application,
  jobTitle: string,
  companyName: string
): AIInterviewQuestion[] {
  // Extract skills from custom answers if available
  const skillAnswers = application.customAnswers
    .filter(a => a.question.toLowerCase().includes('skill'))
    .flatMap(a => Array.isArray(a.answer) ? a.answer : [a.answer])
    .filter(Boolean);

  // Extract experience info
  const experienceAnswers = application.customAnswers.find(
    a => a.question.toLowerCase().includes('experience') || a.question.toLowerCase().includes('years')
  );

  const candidateSkills = skillAnswers.length > 0 ? skillAnswers : ['Leadership', 'Communication', 'Problem Solving'];
  const candidateExperience = experienceAnswers?.answer as string || undefined;

  return generateAIInterviewQuestions({
    candidateName: application.candidateName,
    candidateSkills,
    candidateExperience,
    jobTitle,
    jobRequirements: [],
    companyName,
    questionCount: 8
  });
}
