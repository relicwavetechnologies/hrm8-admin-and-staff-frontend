import { z } from 'zod';
import {
  TeamMemberFeedback,
  HiringVote,
  ConsensusMetrics,
  DecisionHistoryEntry,
  RatingCriterion,
  CandidateComparison,
  // StructuredComment,
} from '@/shared/types/collaborativeFeedback';

// Storage keys
const FEEDBACK_KEY = 'collaborative_feedback';
const VOTES_KEY = 'hiring_votes';
const DECISIONS_KEY = 'decision_history';
const CRITERIA_KEY = 'rating_criteria';

// Validation schemas
export const feedbackSchema = z.object({
  candidateId: z.string(),
  applicationId: z.string().optional(),
  interviewId: z.string().optional(),
  reviewerId: z.string(),
  reviewerName: z.string(),
  reviewerRole: z.string(),
  ratings: z.array(z.object({
    criterionId: z.string(),
    value: z.union([z.number(), z.string()]),
    confidence: z.number().min(1).max(5),
    notes: z.string().optional(),
  })),
  comments: z.array(z.object({
    type: z.enum(['strength', 'concern', 'observation', 'question']),
    category: z.string(),
    content: z.string(),
    importance: z.enum(['low', 'medium', 'high']),
  })),
  overallScore: z.number().min(0).max(100),
  recommendation: z.enum(['strong-hire', 'hire', 'maybe', 'no-hire', 'strong-no-hire']),
  confidence: z.number().min(1).max(5),
});

// Initialize storage
function initializeStorage() {
  if (!localStorage.getItem(CRITERIA_KEY)) {
    const defaultCriteria: RatingCriterion[] = [
      { id: '1', name: 'Technical Skills', description: 'Proficiency in required technologies', scale: '1-10', weight: 0.25, category: 'technical' },
      { id: '2', name: 'Problem Solving', description: 'Analytical and critical thinking abilities', scale: '1-10', weight: 0.20, category: 'technical' },
      { id: '3', name: 'Communication', description: 'Clarity and effectiveness in communication', scale: '1-10', weight: 0.15, category: 'communication' },
      { id: '4', name: 'Cultural Fit', description: 'Alignment with company values and culture', scale: '1-10', weight: 0.15, category: 'cultural' },
      { id: '5', name: 'Leadership Potential', description: 'Ability to lead and inspire teams', scale: '1-10', weight: 0.15, category: 'leadership' },
      { id: '6', name: 'Growth Mindset', description: 'Willingness to learn and adapt', scale: '1-10', weight: 0.10, category: 'cultural' },
    ];
    localStorage.setItem(CRITERIA_KEY, JSON.stringify(defaultCriteria));
  }
}

// Import and initialize mock data
import { initializeMockFeedbackData } from './mockFeedbackData';

initializeStorage();
initializeMockFeedbackData();

// Rating Criteria Management
export function getRatingCriteria(): RatingCriterion[] {
  const data = localStorage.getItem(CRITERIA_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveRatingCriterion(criterion: Omit<RatingCriterion, 'id'>): void {
  const criteria = getRatingCriteria();
  const newCriterion: RatingCriterion = {
    ...criterion,
    id: Date.now().toString(),
  };
  criteria.push(newCriterion);
  localStorage.setItem(CRITERIA_KEY, JSON.stringify(criteria));
}

export function updateRatingCriterion(id: string, updates: Partial<RatingCriterion>): void {
  const criteria = getRatingCriteria();
  const index = criteria.findIndex(c => c.id === id);
  if (index !== -1) {
    criteria[index] = { ...criteria[index], ...updates };
    localStorage.setItem(CRITERIA_KEY, JSON.stringify(criteria));
  }
}

export function deleteRatingCriterion(id: string): void {
  const criteria = getRatingCriteria().filter(c => c.id !== id);
  localStorage.setItem(CRITERIA_KEY, JSON.stringify(criteria));
}

export function reorderRatingCriteria(reorderedCriteria: RatingCriterion[]): void {
  localStorage.setItem(CRITERIA_KEY, JSON.stringify(reorderedCriteria));
}

// Feedback Management
export function getCandidateFeedback(candidateId: string): TeamMemberFeedback[] {
  const data = localStorage.getItem(FEEDBACK_KEY);
  const allFeedback: TeamMemberFeedback[] = data ? JSON.parse(data) : [];
  return allFeedback.filter(f => f.candidateId === candidateId);
}

export function getAllFeedback(): TeamMemberFeedback[] {
  const data = localStorage.getItem(FEEDBACK_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveFeedback(feedback: Omit<TeamMemberFeedback, 'id' | 'submittedAt' | 'updatedAt'>): TeamMemberFeedback {
  const allFeedback = getAllFeedback();
  const newFeedback: TeamMemberFeedback = {
    ...feedback,
    id: Date.now().toString(),
    comments: feedback.comments.map(c => ({
      ...c,
      id: `${Date.now()}-${Math.random()}`,
      createdAt: new Date().toISOString(),
    })),
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  allFeedback.push(newFeedback);
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(allFeedback));
  return newFeedback;
}

export function updateFeedback(id: string, updates: Partial<TeamMemberFeedback>): void {
  const allFeedback = getAllFeedback();
  const index = allFeedback.findIndex(f => f.id === id);
  if (index !== -1) {
    allFeedback[index] = {
      ...allFeedback[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(allFeedback));
  }
}

export function deleteFeedback(id: string): void {
  const allFeedback = getAllFeedback().filter(f => f.id !== id);
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(allFeedback));
}

export function getFeedbackByCandidateId(candidateId: string): TeamMemberFeedback[] {
  return getCandidateFeedback(candidateId);
}

export function getVotesByCandidateId(candidateId: string): HiringVote[] {
  return getCandidateVotes(candidateId);
}

// Voting Management
export function getCandidateVotes(candidateId: string): HiringVote[] {
  const data = localStorage.getItem(VOTES_KEY);
  const allVotes: HiringVote[] = data ? JSON.parse(data) : [];
  return allVotes.filter(v => v.candidateId === candidateId);
}

export function saveVote(vote: Omit<HiringVote, 'id' | 'votedAt'>): HiringVote {
  const allVotes: HiringVote[] = JSON.parse(localStorage.getItem(VOTES_KEY) || '[]');

  // Remove existing vote from same voter for same candidate
  const filteredVotes = allVotes.filter(
    v => !(v.candidateId === vote.candidateId && v.voterId === vote.voterId)
  );

  const newVote: HiringVote = {
    ...vote,
    id: Date.now().toString(),
    votedAt: new Date().toISOString(),
  };

  filteredVotes.push(newVote);
  localStorage.setItem(VOTES_KEY, JSON.stringify(filteredVotes));
  return newVote;
}

// Decision History
export function getCandidateDecisionHistory(candidateId: string): DecisionHistoryEntry[] {
  const data = localStorage.getItem(DECISIONS_KEY);
  const allDecisions: DecisionHistoryEntry[] = data ? JSON.parse(data) : [];
  return allDecisions.filter(d => d.candidateId === candidateId);
}

export function saveDecision(decision: Omit<DecisionHistoryEntry, 'id' | 'decidedAt'>): DecisionHistoryEntry {
  const allDecisions: DecisionHistoryEntry[] = JSON.parse(localStorage.getItem(DECISIONS_KEY) || '[]');
  const newDecision: DecisionHistoryEntry = {
    ...decision,
    id: Date.now().toString(),
    decidedAt: new Date().toISOString(),
  };
  allDecisions.push(newDecision);
  localStorage.setItem(DECISIONS_KEY, JSON.stringify(allDecisions));
  return newDecision;
}

// Consensus Calculations
export function calculateConsensusMetrics(candidateId: string): ConsensusMetrics {
  const feedback = getCandidateFeedback(candidateId);
  const votes = getCandidateVotes(candidateId);

  if (feedback.length === 0) {
    return {
      candidateId,
      totalFeedbacks: 0,
      averageScore: 0,
      scoreStdDev: 0,
      agreementLevel: 0,
      criteriaAverages: {},
      recommendationDistribution: {},
      voteResults: { hire: 0, noHire: 0, abstain: 0 },
      topStrengths: [],
      topConcerns: [],
      lastUpdated: new Date().toISOString(),
    };
  }

  // Calculate average score
  const scores = feedback.map(f => f.overallScore);
  const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;

  // Calculate standard deviation
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - averageScore, 2), 0) / scores.length;
  const scoreStdDev = Math.sqrt(variance);

  // Calculate agreement level (inverse of coefficient of variation, normalized to 0-1)
  const agreementLevel = averageScore > 0 ? Math.max(0, 1 - (scoreStdDev / averageScore)) : 0;

  // Aggregate criteria ratings
  const criteriaAverages: Record<string, number> = {};
  const criteria = getRatingCriteria();

  criteria.forEach(criterion => {
    const ratings = feedback
      .flatMap(f => f.ratings)
      .filter(r => r.criterionId === criterion.id)
      .map(r => typeof r.value === 'number' ? r.value : parseFloat(r.value as string) || 0);

    if (ratings.length > 0) {
      criteriaAverages[criterion.id] = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    }
  });

  // Recommendation distribution
  const recommendationDistribution: Record<string, number> = {};
  feedback.forEach(f => {
    recommendationDistribution[f.recommendation] = (recommendationDistribution[f.recommendation] || 0) + 1;
  });

  // Vote results
  const voteResults = {
    hire: votes.filter(v => v.decision === 'hire').length,
    noHire: votes.filter(v => v.decision === 'no-hire').length,
    abstain: votes.filter(v => v.decision === 'abstain').length,
  };

  // Extract top strengths and concerns
  const strengths: Record<string, number> = {};
  const concerns: Record<string, number> = {};

  feedback.forEach(f => {
    f.comments.forEach(comment => {
      if (comment.type === 'strength') {
        const key = comment.content.substring(0, 50);
        strengths[key] = (strengths[key] || 0) + 1;
      } else if (comment.type === 'concern') {
        const key = comment.content.substring(0, 50);
        concerns[key] = (concerns[key] || 0) + 1;
      }
    });
  });

  const topStrengths = Object.entries(strengths)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key]) => key);

  const topConcerns = Object.entries(concerns)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key]) => key);

  return {
    candidateId,
    totalFeedbacks: feedback.length,
    averageScore,
    scoreStdDev,
    agreementLevel,
    criteriaAverages,
    recommendationDistribution,
    voteResults,
    topStrengths,
    topConcerns,
    lastUpdated: new Date().toISOString(),
  };
}

// Comparison Reports
export function generateCandidateComparison(candidateIds: string[]): CandidateComparison[] {
  return candidateIds.map(candidateId => {
    const feedback = getCandidateFeedback(candidateId);
    const votes = getCandidateVotes(candidateId);
    const decisionHistory = getCandidateDecisionHistory(candidateId);
    const consensusMetrics = calculateConsensusMetrics(candidateId);

    // Get candidate info (mock for now)
    const candidateName = `Candidate ${candidateId}`;
    const jobTitle = 'Position';

    return {
      candidateId,
      candidateName,
      jobTitle,
      consensusMetrics,
      feedback,
      votes,
      decisionHistory,
    };
  });
}

export function getRecommendationColor(recommendation: string): string {
  const colors: Record<string, string> = {
    'strong-hire': 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950',
    'hire': 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950',
    'maybe': 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950',
    'no-hire': 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950',
    'strong-no-hire': 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950',
  };
  return colors[recommendation] || 'text-muted-foreground bg-muted';
}

export function getRecommendationLabel(recommendation: string): string {
  const labels: Record<string, string> = {
    'strong-hire': 'Strong Hire',
    'hire': 'Hire',
    'maybe': 'Maybe',
    'no-hire': 'No Hire',
    'strong-no-hire': 'Strong No Hire',
  };
  return labels[recommendation] || recommendation;
}
