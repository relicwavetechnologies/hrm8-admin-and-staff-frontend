import type { InterviewAnalysis, TranscriptEntry } from '@/shared/types/aiInterview';

export function calculateInterviewScore(transcript: TranscriptEntry[]): InterviewAnalysis {
  // Mock AI scoring - in production, this would call an actual AI service
  
  const technicalScore = Math.floor(Math.random() * 30) + 70;
  const communicationScore = Math.floor(Math.random() * 30) + 70;
  const culturalFitScore = Math.floor(Math.random() * 30) + 70;
  const experienceScore = Math.floor(Math.random() * 30) + 70;
  const problemSolvingScore = Math.floor(Math.random() * 30) + 70;
  
  const overallScore = Math.round(
    (technicalScore + communicationScore + culturalFitScore + experienceScore + problemSolvingScore) / 5
  );
  
  const strengths = generateStrengths(overallScore);
  const concerns = generateConcerns(overallScore);
  const redFlags = overallScore < 60 ? ['Concerns about overall qualification level'] : [];
  
  return {
    overallScore,
    categoryScores: {
      technical: technicalScore,
      communication: communicationScore,
      culturalFit: culturalFitScore,
      experience: experienceScore,
      problemSolving: problemSolvingScore
    },
    strengths,
    concerns,
    redFlags,
    keyHighlights: extractKeyHighlights(transcript),
    recommendation: getRecommendation(overallScore),
    confidenceScore: Math.floor(Math.random() * 20) + 80,
    summary: generateSummary(overallScore, strengths, concerns)
  };
}

function generateStrengths(score: number): string[] {
  const allStrengths = [
    'Strong technical problem-solving abilities',
    'Excellent communication and articulation',
    'Proven track record of delivering results',
    'Good understanding of best practices',
    'Demonstrates continuous learning mindset',
    'Collaborative team player',
    'Adaptable to changing requirements'
  ];
  
  const count = score >= 85 ? 5 : score >= 70 ? 4 : 3;
  return allStrengths.slice(0, count);
}

function generateConcerns(score: number): string[] {
  if (score >= 85) return [];
  if (score >= 70) {
    return ['Could provide more specific examples in some areas'];
  }
  return [
    'Limited depth in technical responses',
    'Could improve communication clarity',
    'Needs more experience in key areas'
  ];
}

function extractKeyHighlights(transcript: TranscriptEntry[]) {
  const candidateResponses = transcript.filter(t => t.speaker === 'candidate');
  
  return candidateResponses.slice(0, 3).map(response => ({
    quote: response.content.substring(0, 100) + (response.content.length > 100 ? '...' : ''),
    context: 'Interview response',
    sentiment: 'positive' as const
  }));
}

function getRecommendation(score: number): InterviewAnalysis['recommendation'] {
  if (score >= 85) return 'strongly-recommend';
  if (score >= 70) return 'recommend';
  if (score >= 60) return 'maybe';
  return 'not-recommend';
}

function generateSummary(score: number, strengths: string[], concerns: string[]): string {
  let summary = '';
  
  if (score >= 85) {
    summary = 'Exceptional candidate who demonstrates strong qualifications across all key areas. ';
  } else if (score >= 70) {
    summary = 'Solid candidate with good qualifications and relevant experience. ';
  } else if (score >= 60) {
    summary = 'Candidate shows potential but has some areas that need development. ';
  } else {
    summary = 'Candidate may not be the best fit for this position at this time. ';
  }
  
  summary += `Key strengths include ${strengths[0]?.toLowerCase() || 'various capabilities'}.`;
  
  if (concerns.length > 0) {
    summary += ` Areas for potential growth: ${concerns[0]?.toLowerCase()}.`;
  }
  
  return summary;
}
