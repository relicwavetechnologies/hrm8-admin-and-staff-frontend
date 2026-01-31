import { QuestionBankItem, QuestionVersion, DifficultyLevel, QuestionType } from '@/shared/types/questionBank';

const QUESTION_BANK_KEY = 'hrm8_question_bank';

// Mock data
const mockQuestions: QuestionBankItem[] = [
  {
    id: 'q1',
    text: 'What is the time complexity of binary search?',
    type: 'single-choice',
    category: ['Technical', 'Algorithms'],
    difficulty: 'medium',
    options: [
      { id: 'o1', text: 'O(n)', isCorrect: false },
      { id: 'o2', text: 'O(log n)', isCorrect: true },
      { id: 'o3', text: 'O(n log n)', isCorrect: false },
      { id: 'o4', text: 'O(1)', isCorrect: false },
    ],
    points: 10,
    timeLimit: 120,
    isActive: true,
    version: 2,
    versionHistory: [
      {
        version: 1,
        text: 'What is the time complexity of binary search algorithm?',
        updatedBy: 'user-1',
        updatedAt: '2024-01-15T10:00:00Z',
        changeNotes: 'Initial version',
      },
      {
        version: 2,
        text: 'What is the time complexity of binary search?',
        updatedBy: 'user-1',
        updatedAt: '2024-02-20T14:30:00Z',
        changeNotes: 'Simplified question text',
      },
    ],
    usageStats: {
      totalUses: 45,
      assessmentCount: 12,
      lastUsedDate: '2024-03-10T09:00:00Z',
      averageScore: 75,
      passRate: 68,
    },
    createdBy: 'user-1',
    createdByName: 'Sarah Johnson',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-02-20T14:30:00Z',
    tags: ['data-structures', 'algorithms', 'complexity'],
  },
  {
    id: 'q2',
    text: 'Describe a situation where you had to resolve a conflict with a team member.',
    type: 'text-long',
    category: ['Behavioral', 'Soft Skills'],
    difficulty: 'medium',
    points: 15,
    timeLimit: 300,
    isActive: true,
    version: 1,
    versionHistory: [
      {
        version: 1,
        text: 'Describe a situation where you had to resolve a conflict with a team member.',
        updatedBy: 'user-2',
        updatedAt: '2024-01-20T11:00:00Z',
        changeNotes: 'Initial version',
      },
    ],
    usageStats: {
      totalUses: 32,
      assessmentCount: 18,
      lastUsedDate: '2024-03-12T10:30:00Z',
      averageScore: 82,
      passRate: 78,
    },
    createdBy: 'user-2',
    createdByName: 'Michael Chen',
    createdAt: '2024-01-20T11:00:00Z',
    updatedAt: '2024-01-20T11:00:00Z',
    tags: ['teamwork', 'conflict-resolution', 'communication'],
    instructions: 'Use the STAR method (Situation, Task, Action, Result) in your response.',
  },
  {
    id: 'q3',
    text: 'Write a function that reverses a string in JavaScript.',
    type: 'coding',
    category: ['Technical', 'Programming'],
    difficulty: 'easy',
    correctAnswer: 'function reverseString(str) { return str.split("").reverse().join(""); }',
    points: 20,
    timeLimit: 600,
    isActive: true,
    version: 1,
    versionHistory: [
      {
        version: 1,
        text: 'Write a function that reverses a string in JavaScript.',
        updatedBy: 'user-1',
        updatedAt: '2024-02-01T09:00:00Z',
        changeNotes: 'Initial version',
      },
    ],
    usageStats: {
      totalUses: 67,
      assessmentCount: 15,
      lastUsedDate: '2024-03-14T15:00:00Z',
      averageScore: 71,
      passRate: 65,
    },
    createdBy: 'user-1',
    createdByName: 'Sarah Johnson',
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-02-01T09:00:00Z',
    tags: ['javascript', 'strings', 'functions'],
    instructions: 'Write clean, efficient code with proper error handling.',
  },
  {
    id: 'q4',
    text: 'Is effective communication more important than technical skills in software development?',
    type: 'true-false',
    category: ['Soft Skills', 'Opinion'],
    difficulty: 'easy',
    options: [
      { id: 'o1', text: 'True', isCorrect: false },
      { id: 'o2', text: 'False', isCorrect: false },
    ],
    points: 5,
    timeLimit: 60,
    isActive: true,
    version: 1,
    versionHistory: [
      {
        version: 1,
        text: 'Is effective communication more important than technical skills in software development?',
        updatedBy: 'user-3',
        updatedAt: '2024-02-10T13:00:00Z',
        changeNotes: 'Initial version',
      },
    ],
    usageStats: {
      totalUses: 89,
      assessmentCount: 25,
      lastUsedDate: '2024-03-15T11:00:00Z',
      averageScore: 85,
      passRate: 80,
    },
    createdBy: 'user-3',
    createdByName: 'Emily Rodriguez',
    createdAt: '2024-02-10T13:00:00Z',
    updatedAt: '2024-02-10T13:00:00Z',
    tags: ['soft-skills', 'communication', 'opinion'],
    instructions: 'No right or wrong answer - we want to understand your perspective.',
  },
  {
    id: 'q5',
    text: 'Which of the following are principles of Agile methodology? (Select all that apply)',
    type: 'multiple-choice',
    category: ['Technical', 'Project Management'],
    difficulty: 'medium',
    options: [
      { id: 'o1', text: 'Individuals and interactions over processes and tools', isCorrect: true },
      { id: 'o2', text: 'Comprehensive documentation over working software', isCorrect: false },
      { id: 'o3', text: 'Customer collaboration over contract negotiation', isCorrect: true },
      { id: 'o4', text: 'Following a plan over responding to change', isCorrect: false },
      { id: 'o5', text: 'Working software over comprehensive documentation', isCorrect: true },
    ],
    points: 12,
    timeLimit: 180,
    isActive: true,
    version: 1,
    versionHistory: [
      {
        version: 1,
        text: 'Which of the following are principles of Agile methodology? (Select all that apply)',
        updatedBy: 'user-2',
        updatedAt: '2024-02-15T10:00:00Z',
        changeNotes: 'Initial version',
      },
    ],
    usageStats: {
      totalUses: 54,
      assessmentCount: 14,
      lastUsedDate: '2024-03-13T14:00:00Z',
      averageScore: 69,
      passRate: 58,
    },
    createdBy: 'user-2',
    createdByName: 'Michael Chen',
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-02-15T10:00:00Z',
    tags: ['agile', 'project-management', 'methodology'],
  },
];

// Initialize storage
export function initializeQuestionBankStorage(): void {
  const existing = localStorage.getItem(QUESTION_BANK_KEY);
  if (!existing) {
    localStorage.setItem(QUESTION_BANK_KEY, JSON.stringify(mockQuestions));
  }
}

// Get all questions
export function getQuestionBankItems(): QuestionBankItem[] {
  initializeQuestionBankStorage();
  const stored = localStorage.getItem(QUESTION_BANK_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Get question by ID
export function getQuestionById(id: string): QuestionBankItem | undefined {
  const questions = getQuestionBankItems();
  return questions.find((q) => q.id === id);
}

// Save question
export function saveQuestion(question: QuestionBankItem): void {
  const questions = getQuestionBankItems();
  const existingIndex = questions.findIndex((q) => q.id === question.id);

  if (existingIndex >= 0) {
    questions[existingIndex] = question;
  } else {
    questions.push(question);
  }

  localStorage.setItem(QUESTION_BANK_KEY, JSON.stringify(questions));
}

// Update question (with version control)
export function updateQuestion(
  id: string,
  updates: Partial<QuestionBankItem>,
  changeNotes?: string,
  updatedBy?: string
): void {
  const questions = getQuestionBankItems();
  const index = questions.findIndex((q) => q.id === id);

  if (index >= 0) {
    const currentQuestion = questions[index];

    // Create version history entry
    const newVersion: QuestionVersion = {
      version: currentQuestion.version,
      text: currentQuestion.text,
      options: currentQuestion.options,
      updatedBy: updatedBy || 'current-user',
      updatedAt: new Date().toISOString(),
      changeNotes: changeNotes || 'Updated question',
    };

    // Update question
    questions[index] = {
      ...currentQuestion,
      ...updates,
      version: currentQuestion.version + 1,
      versionHistory: [...currentQuestion.versionHistory, newVersion],
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(QUESTION_BANK_KEY, JSON.stringify(questions));
  }
}

// Delete question
export function deleteQuestion(id: string): void {
  const questions = getQuestionBankItems();
  const filtered = questions.filter((q) => q.id !== id);
  localStorage.setItem(QUESTION_BANK_KEY, JSON.stringify(filtered));
}

// Track question usage
export function trackQuestionUsage(id: string, _assessmentId: string): void {
  const questions = getQuestionBankItems();
  const index = questions.findIndex((q) => q.id === id);

  if (index >= 0) {
    questions[index].usageStats.totalUses += 1;
    questions[index].usageStats.lastUsedDate = new Date().toISOString();
    localStorage.setItem(QUESTION_BANK_KEY, JSON.stringify(questions));
  }
}

// Get questions by filters
export function filterQuestions(filters: {
  categories?: string[];
  difficulty?: DifficultyLevel[];
  type?: QuestionType[];
  tags?: string[];
  isActive?: boolean;
}): QuestionBankItem[] {
  let questions = getQuestionBankItems();

  if (filters.categories && filters.categories.length > 0) {
    questions = questions.filter((q) =>
      q.category.some((cat) => filters.categories!.includes(cat))
    );
  }

  if (filters.difficulty && filters.difficulty.length > 0) {
    questions = questions.filter((q) => filters.difficulty!.includes(q.difficulty));
  }

  if (filters.type && filters.type.length > 0) {
    questions = questions.filter((q) => filters.type!.includes(q.type));
  }

  if (filters.tags && filters.tags.length > 0) {
    questions = questions.filter((q) =>
      q.tags.some((tag) => filters.tags!.includes(tag))
    );
  }

  if (filters.isActive !== undefined) {
    questions = questions.filter((q) => q.isActive === filters.isActive);
  }

  return questions;
}

// Get all unique categories
export function getAllCategories(): string[] {
  const questions = getQuestionBankItems();
  const categories = new Set<string>();
  questions.forEach((q) => q.category.forEach((cat) => categories.add(cat)));
  return Array.from(categories).sort();
}

// Get all unique tags
export function getAllTags(): string[] {
  const questions = getQuestionBankItems();
  const tags = new Set<string>();
  questions.forEach((q) => q.tags.forEach((tag) => tags.add(tag)));
  return Array.from(tags).sort();
}

// Duplicate question
export function duplicateQuestion(id: string): QuestionBankItem | null {
  const question = getQuestionById(id);
  if (!question) return null;

  const duplicate: QuestionBankItem = {
    ...question,
    id: `q-${Date.now()}`,
    text: `${question.text} (Copy)`,
    version: 1,
    versionHistory: [
      {
        version: 1,
        text: `${question.text} (Copy)`,
        updatedBy: 'current-user',
        updatedAt: new Date().toISOString(),
        changeNotes: `Duplicated from question ${id}`,
      },
    ],
    usageStats: {
      totalUses: 0,
      assessmentCount: 0,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveQuestion(duplicate);
  return duplicate;
}

// Get question statistics
export function getQuestionBankStats() {
  const questions = getQuestionBankItems();

  return {
    totalQuestions: questions.length,
    activeQuestions: questions.filter((q) => q.isActive).length,
    totalUses: questions.reduce((sum, q) => sum + q.usageStats.totalUses, 0),
    averagePassRate: questions.length > 0
      ? questions.reduce((sum, q) => sum + (q.usageStats.passRate || 0), 0) / questions.length
      : 0,
  };
}
