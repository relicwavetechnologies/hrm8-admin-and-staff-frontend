import type { AIReferenceCheckSession, InterviewTranscript, AIAnalysis } from '@/shared/types/aiReferenceCheck';
import type { AITranscriptionSummary } from '@/shared/types/aiReferenceReport';

// Frontend-only mock implementation - actual AI integration deferred for backend phase
export async function generateTranscriptionSummary(
  session: AIReferenceCheckSession,
  transcript: InterviewTranscript,
  analysis: AIAnalysis,
  candidateName: string,
  refereeInfo: {
    name: string;
    relationship: string;
    companyName: string;
    yearsKnown?: string;
  }
): Promise<AITranscriptionSummary> {
  try {
    console.log('Generating transcription summary for session (mock):', session.id);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate mock summary based on the analysis data
    const summary: AITranscriptionSummary = {
      sessionId: session.id,
      candidateId: session.candidateId,
      candidateName,
      refereeInfo,
      sessionDetails: {
        mode: (session.mode === 'questionnaire' ? 'phone' : session.mode) as 'video' | 'phone',
        duration: session.duration || 0,
        completedAt: session.completedAt || new Date().toISOString(),
        questionsAsked: transcript.turns.filter(t => t.speaker === 'ai-recruiter').length,
      },
      executiveSummary: `Based on a comprehensive ${session.mode} interview with ${refereeInfo.name} (${refereeInfo.relationship} at ${refereeInfo.companyName}), ${candidateName} demonstrates strong professional capabilities. The conversation revealed consistent patterns of reliability, technical competence, and positive interpersonal skills. ${refereeInfo.name} provided detailed examples of ${candidateName}'s contributions and impact on team outcomes.`,
      keyFindings: {
        strengths: analysis.strengths.length > 0 ? analysis.strengths : [
          'Strong technical skills and problem-solving ability',
          'Excellent communication and collaboration with team members',
          'Consistent reliability and meeting deadlines'
        ],
        concerns: analysis.concerns.length > 0 ? analysis.concerns : [],
        neutralObservations: [
          'Relatively short tenure in current role',
          'Limited experience with specific tools mentioned in job requirements'
        ]
      },
      categoryBreakdown: analysis.categories.map(cat => ({
        category: cat.category,
        score: cat.score,
        summary: `${candidateName} demonstrated ${cat.score >= 4 ? 'excellent' : cat.score >= 3 ? 'good' : 'satisfactory'} performance in ${cat.category.toLowerCase()}.`,
        evidence: cat.evidence.slice(0, 3)
      })),
      conversationHighlights: transcript.turns
        .filter(t => t.speaker === 'referee')
        .slice(0, 5)
        .map((turn, idx) => ({
          question: transcript.turns[idx * 2]?.text || 'Question about candidate performance',
          answer: turn.text,
          significance: 'This response provides valuable insight into the candidate\'s capabilities',
          timestamp: turn.timestamp
        })),
      redFlags: analysis.concerns.length > 0 ? [{
        description: analysis.concerns[0],
        severity: 'moderate' as const,
        evidence: 'Mentioned during discussion of team dynamics'
      }] : [],
      verificationItems: [
        { claim: 'Employment dates', verified: true, notes: 'Confirmed by referee' },
        { claim: 'Job title', verified: true, notes: 'Matches candidate claims' }
      ],
      recommendation: {
        overallScore: analysis.overallRating * 20,
        hiringRecommendation: analysis.recommendationScore >= 80 ? 'strongly-recommend' :
                            analysis.recommendationScore >= 60 ? 'recommend' :
                            analysis.recommendationScore >= 40 ? 'neutral' :
                            analysis.recommendationScore >= 20 ? 'concerns' : 'not-recommend',
        confidenceLevel: analysis.aiConfidence,
        reasoningSummary: `Based on the comprehensive interview, ${candidateName} receives a ${analysis.recommendationScore >= 80 ? 'strong recommendation' : analysis.recommendationScore >= 60 ? 'positive recommendation' : 'conditional recommendation'}. The assessment reveals consistent strengths in key competency areas with ${analysis.concerns.length > 0 ? 'some areas for development' : 'no significant concerns'}. The referee's detailed responses and examples provide reliable insight into the candidate's professional capabilities.`
      },
      generatedAt: new Date().toISOString(),
      generatedBy: 'ai',
    };

    console.log('Successfully generated mock transcription summary');
    return summary;
  } catch (error) {
    console.error('Error in generateTranscriptionSummary:', error);
    throw error;
  }
}

export function calculateReportCompleteness(summary: AITranscriptionSummary): number {
  let score = 0;
  const maxScore = 10;

  if (summary.executiveSummary && summary.executiveSummary.length > 100) score += 2;
  if (summary.keyFindings.strengths.length > 0) score += 1;
  if (summary.keyFindings.concerns.length > 0) score += 1;
  if (summary.categoryBreakdown.length >= 4) score += 2;
  if (summary.conversationHighlights.length >= 3) score += 2;
  if (summary.recommendation.reasoningSummary && summary.recommendation.reasoningSummary.length > 50) score += 2;

  return Math.round((score / maxScore) * 100);
}

export function getRecommendationLabel(recommendation: AITranscriptionSummary['recommendation']['hiringRecommendation']): string {
  const labels: Record<typeof recommendation, string> = {
    'strongly-recommend': 'Strongly Recommend',
    'recommend': 'Recommend',
    'neutral': 'Neutral',
    'concerns': 'Some Concerns',
    'not-recommend': 'Not Recommended',
  };
  return labels[recommendation];
}

export function getRecommendationColor(recommendation: AITranscriptionSummary['recommendation']['hiringRecommendation']): string {
  const colors: Record<typeof recommendation, string> = {
    'strongly-recommend': 'text-green-600 dark:text-green-400',
    'recommend': 'text-blue-600 dark:text-blue-400',
    'neutral': 'text-yellow-600 dark:text-yellow-400',
    'concerns': 'text-orange-600 dark:text-orange-400',
    'not-recommend': 'text-red-600 dark:text-red-400',
  };
  return colors[recommendation];
}

export function getSeverityColor(severity: 'critical' | 'moderate' | 'minor'): string {
  const colors = {
    critical: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30',
    moderate: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30',
    minor: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30',
  };
  return colors[severity];
}
