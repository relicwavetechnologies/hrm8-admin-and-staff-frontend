import { AIFeedbackAnalysis } from '@/shared/types/aiAnalysis';

export const generateMockAIAnalysis = (feedbackText: string): AIFeedbackAnalysis => {
  // Mock analysis - will be replaced with real AI later
  const hasStrongWords = /excellent|outstanding|poor|weak/i.test(feedbackText);
  const hasBiasedLanguage = /he|she|young|old|looks/i.test(feedbackText);
  const wordCount = feedbackText.split(' ').length;

  return {
    biasDetection: hasBiasedLanguage ? [
      {
        detected: true,
        type: 'gender',
        severity: 'low',
        excerpt: 'Using gendered pronouns',
        suggestion: 'Consider using "they/them" or the candidate\'s name for gender-neutral language.'
      }
    ] : [],
    sentiment: {
      overall: hasStrongWords ? 'positive' : 'neutral',
      score: hasStrongWords ? 0.7 : 0.1,
      emotions: {
        confidence: 0.75,
        enthusiasm: hasStrongWords ? 0.8 : 0.5,
        concern: 0.2,
        objectivity: 0.7
      }
    },
    suggestions: [
      {
        type: 'improvement',
        title: 'Add specific examples',
        suggestion: 'Consider adding concrete examples to support your assessment.'
      },
      {
        type: 'clarification',
        title: 'Elaborate on technical skills',
        suggestion: 'Provide more details about the candidate\'s technical competencies.'
      }
    ],
    summary: `This feedback provides a ${wordCount > 50 ? 'comprehensive' : 'brief'} assessment focusing on the candidate's performance and potential fit.`,
    keyPoints: [
      'Technical competency assessment',
      'Communication skills evaluation',
      'Cultural fit observations'
    ],
    confidenceScore: 0.85
  };
};
