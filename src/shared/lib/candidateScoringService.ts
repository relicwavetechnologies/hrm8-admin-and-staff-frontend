import { z } from "zod";

export interface ScoringWeights {
  skills: number;
  experience: number;
  education: number;
  interview: number;
  culture: number;
}

export interface CandidateScores {
  skills: number;
  experience: number;
  education: number;
  interview: number;
  culture: number;
  overall: number;
}

export interface CandidateScoringResult {
  scores: CandidateScores;
  strengths: string[];
  concerns: string[];
  recommendation: 'strong_hire' | 'hire' | 'maybe' | 'no_hire' | 'strong_no_hire';
  justification: string;
  improvementAreas: string[];
  analyzedAt: string;
}

export interface CandidateScoringRequest {
  candidateName: string;
  resume?: string;
  experience?: string;
  skills?: string[];
  education?: string;
  jobRequirements: string;
  jobDescription: string;
  interviewFeedback?: string;
  weights?: Partial<ScoringWeights>;
}

// Validation schema
const scoringRequestSchema = z.object({
  candidateName: z.string().trim().min(1).max(200),
  resume: z.string().max(10000).optional(),
  experience: z.string().max(5000).optional(),
  skills: z.array(z.string().max(100)).max(50).optional(),
  education: z.string().max(2000).optional(),
  jobRequirements: z.string().trim().min(10).max(5000),
  jobDescription: z.string().trim().min(10).max(5000),
  interviewFeedback: z.string().max(5000).optional(),
  weights: z.object({
    skills: z.number().min(0).max(100).optional(),
    experience: z.number().min(0).max(100).optional(),
    education: z.number().min(0).max(100).optional(),
    interview: z.number().min(0).max(100).optional(),
    culture: z.number().min(0).max(100).optional(),
  }).optional(),
});

export async function scoreCandidateWithAI(
  request: CandidateScoringRequest
): Promise<CandidateScoringResult> {
  // Validate input
  const validated = scoringRequestSchema.parse(request);

  // Default weights
  const defaultWeights: ScoringWeights = {
    skills: 30,
    experience: 25,
    education: 15,
    interview: 20,
    culture: 10,
  };

  const weights = { ...defaultWeights, ...validated.weights };

  // Call edge function
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const response = await fetch(`${SUPABASE_URL}/functions/v1/score-candidate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      ...validated,
      weights,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to score candidate');
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Scoring failed');
  }

  return {
    ...data.scoring,
    analyzedAt: data.analyzedAt,
  };
}

export function getRecommendationColor(recommendation: string): string {
  switch (recommendation) {
    case 'strong_hire':
      return 'text-green-600 bg-green-50 dark:bg-green-950/20';
    case 'hire':
      return 'text-teal-600 bg-teal-50 dark:bg-teal-950/20';
    case 'maybe':
      return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20';
    case 'no_hire':
      return 'text-orange-600 bg-orange-50 dark:bg-orange-950/20';
    case 'strong_no_hire':
      return 'text-red-600 bg-red-50 dark:bg-red-950/20';
    default:
      return 'text-gray-600 bg-gray-50 dark:bg-gray-950/20';
  }
}

export function getRecommendationLabel(recommendation: string): string {
  switch (recommendation) {
    case 'strong_hire':
      return 'Strong Hire';
    case 'hire':
      return 'Hire';
    case 'maybe':
      return 'Maybe';
    case 'no_hire':
      return 'No Hire';
    case 'strong_no_hire':
      return 'Strong No Hire';
    default:
      return recommendation;
  }
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-teal-600';
  if (score >= 40) return 'text-yellow-600';
  if (score >= 20) return 'text-orange-600';
  return 'text-red-600';
}
