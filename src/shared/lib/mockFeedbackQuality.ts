export interface FeedbackQualityScore {
  overall: number; // 0-100
  dimensions: {
    detail: number;
    balance: number;
    actionability: number;
    specificity: number;
    objectivity: number;
  };
  suggestions: string[];
  strengths: string[];
}

export const calculateFeedbackQuality = (feedbackText: string, commentsCount: number): FeedbackQualityScore => {
  const wordCount = feedbackText.split(' ').length;
  const hasExamples = /example|instance|specifically|demonstrated/i.test(feedbackText);
  const hasPositiveAndNegative = /strength|good|excellent/i.test(feedbackText) && /concern|improve|weakness/i.test(feedbackText);
  const hasActionable = /should|could|recommend|suggest/i.test(feedbackText);
  
  const detail = Math.min(100, (wordCount / 200) * 100 + (commentsCount * 10));
  const balance = hasPositiveAndNegative ? 90 : 60;
  const actionability = hasActionable ? 85 : 50;
  const specificity = hasExamples ? 90 : 55;
  const objectivity = feedbackText.includes('I feel') || feedbackText.includes('I think') ? 60 : 85;
  
  const overall = (detail + balance + actionability + specificity + objectivity) / 5;
  
  const suggestions = [];
  const strengths = [];
  
  if (detail < 60) suggestions.push('Add more detailed observations');
  else strengths.push('Comprehensive detail level');
  
  if (!hasPositiveAndNegative) suggestions.push('Include both strengths and areas for improvement');
  else strengths.push('Well-balanced feedback');
  
  if (!hasActionable) suggestions.push('Add specific recommendations');
  else strengths.push('Actionable insights provided');
  
  if (!hasExamples) suggestions.push('Include concrete examples');
  else strengths.push('Specific examples given');
  
  if (objectivity < 70) suggestions.push('Use more objective language');
  else strengths.push('Maintains objectivity');
  
  return {
    overall: Math.round(overall),
    dimensions: {
      detail: Math.round(detail),
      balance: Math.round(balance),
      actionability: Math.round(actionability),
      specificity: Math.round(specificity),
      objectivity: Math.round(objectivity),
    },
    suggestions,
    strengths,
  };
};
