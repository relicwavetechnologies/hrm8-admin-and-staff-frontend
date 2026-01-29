import { LibraryQuestion } from '@/shared/types/applicationForm';
import { questionTemplates } from '@/shared/data/questionTemplates';

const QUESTION_LIBRARY_KEY = 'hrm8_question_library';

// Get all library questions (system + user-saved)
export function getQuestionLibrary(): LibraryQuestion[] {
  const userQuestions = getUserQuestions();
  const systemQuestions = getSystemTemplates();
  
  return [...systemQuestions, ...userQuestions];
}

// Get system templates
export function getSystemTemplates(): LibraryQuestion[] {
  return questionTemplates.map((q) => ({
    ...q,
    isSystemTemplate: true,
  })) as LibraryQuestion[];
}

// Get user-saved questions from localStorage
export function getUserQuestions(): LibraryQuestion[] {
  try {
    const stored = localStorage.getItem(QUESTION_LIBRARY_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading user questions:', error);
    return [];
  }
}

// Save question to library
export function saveQuestionToLibrary(question: Partial<LibraryQuestion>): void {
  const userQuestions = getUserQuestions();
  
  const libraryQuestion: LibraryQuestion = {
    ...question,
    libraryId: question.libraryId || `user-${Date.now()}`,
    isSystemTemplate: false,
    savedAt: question.savedAt || new Date().toISOString(),
    usageCount: question.usageCount || 0,
  } as LibraryQuestion;
  
  // Check if updating existing question
  const existingIndex = userQuestions.findIndex(
    (q) => q.libraryId === libraryQuestion.libraryId
  );
  
  if (existingIndex >= 0) {
    userQuestions[existingIndex] = libraryQuestion;
  } else {
    userQuestions.push(libraryQuestion);
  }
  
  try {
    localStorage.setItem(QUESTION_LIBRARY_KEY, JSON.stringify(userQuestions));
  } catch (error) {
    console.error('Error saving question to library:', error);
  }
}

// Delete question from library (user questions only)
export function deleteQuestionFromLibrary(libraryId: string): void {
  const userQuestions = getUserQuestions();
  const filtered = userQuestions.filter((q) => q.libraryId !== libraryId);
  
  try {
    localStorage.setItem(QUESTION_LIBRARY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting question from library:', error);
  }
}

// Get single question by libraryId
export function getQuestionById(libraryId: string): LibraryQuestion | undefined {
  const allQuestions = getQuestionLibrary();
  return allQuestions.find((q) => q.libraryId === libraryId);
}

// Increment usage count when question is used
export function incrementQuestionUsage(libraryId: string): void {
  const userQuestions = getUserQuestions();
  const questionIndex = userQuestions.findIndex((q) => q.libraryId === libraryId);
  
  if (questionIndex >= 0) {
    userQuestions[questionIndex].usageCount = 
      (userQuestions[questionIndex].usageCount || 0) + 1;
    
    try {
      localStorage.setItem(QUESTION_LIBRARY_KEY, JSON.stringify(userQuestions));
    } catch (error) {
      console.error('Error updating question usage:', error);
    }
  }
}

// Clear all user questions
export function clearUserQuestions(): void {
  try {
    localStorage.removeItem(QUESTION_LIBRARY_KEY);
  } catch (error) {
    console.error('Error clearing user questions:', error);
  }
}

// Get all unique categories
export function getCategories(): string[] {
  const allQuestions = getQuestionLibrary();
  const categories = new Set<string>();
  
  allQuestions.forEach((q) => {
    if (q.category) {
      categories.add(q.category);
    }
  });
  
  return Array.from(categories).sort();
}
