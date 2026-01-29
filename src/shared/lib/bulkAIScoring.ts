import type { Application } from '@/shared/types/application';
import type { Job } from '@/shared/types/job';
import { applicationService } from './applicationService';

export interface ScoringCriteria {
  job: Job;
}

export interface BulkScoringProgress {
  total: number;
  completed: number;
  failed: number;
  currentCandidate?: string;
}

export interface BulkScoringResult {
  applicationId: string;
  candidateName: string;
  oldScore?: number;
  newScore: number;
  scoreDelta: number;
  success: boolean;
  error?: string;
  fullAnalysis?: {
    scores: {
      skills: number;
      experience: number;
      education: number;
      interview: number;
      culture: number;
      overall: number;
    };
    strengths: string[];
    concerns: string[];
    recommendation: string;
    justification: string;
    improvementAreas: string[];
    detailedAnalysis: {
      skillsAnalysis: string;
      experienceAnalysis: string;
      educationAnalysis: string;
      culturalFitAnalysis: string;
      overallAssessment: string;
    };
  };
}

// Note: Individual scoring is now handled by backend bulk endpoint
// This function is kept for compatibility but bulk scoring happens server-side
async function scoreCandidate(
  application: Application,
  criteria: ScoringCriteria
): Promise<{ score: number; fullAnalysis?: any }> {
  // This should not be called directly - use bulkScoreCandidates instead
  throw new Error('Individual scoring should use backend bulk endpoint');
}

export async function bulkScoreCandidates(
  applications: Application[],
  criteria: ScoringCriteria,
  onProgress: (progress: BulkScoringProgress) => void
): Promise<BulkScoringResult[]> {
  console.log('🚀 Starting bulk scoring via backend API...', {
    candidateCount: applications.length,
    jobId: criteria.job.id,
  });

  const applicationIds = applications.map(app => app.id);
  const jobId = criteria.job.id;

  try {
    // Call backend API for bulk scoring
    const response = await applicationService.bulkScoreCandidates(applicationIds, jobId);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Bulk scoring failed');
    }

    const { results: backendResults, progress: backendProgress } = response.data;

    // Map backend results to frontend format
    const results: BulkScoringResult[] = applications.map((application) => {
      const backendResult = backendResults.find(r => r.applicationId === application.id);
      
      if (backendResult && backendResult.success) {
        return {
        applicationId: application.id,
        candidateName: application.candidateName,
          oldScore: application.aiMatchScore,
          newScore: backendResult.score,
          scoreDelta: application.aiMatchScore ? backendResult.score - application.aiMatchScore : 0,
        success: true,
          fullAnalysis: backendResult.analysis,
        };
      } else {
        return {
          applicationId: application.id,
          candidateName: application.candidateName,
          oldScore: application.aiMatchScore,
          newScore: application.aiMatchScore || 0,
          scoreDelta: 0,
          success: false,
          error: backendResult ? 'Scoring failed on backend' : 'Result not found',
        };
      }
    });

    // Emit progress updates based on backend progress
    if (backendProgress && backendProgress.length > 0) {
      backendProgress.forEach((progress) => {
        onProgress({
          total: progress.total,
          completed: progress.completed,
          failed: progress.total - progress.completed,
          currentCandidate: progress.current,
        });
      });
    } else {
      // Final progress update
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      onProgress({
        total: applications.length,
        completed: successful,
        failed,
      });
    }

    console.log('✅ Bulk scoring completed:', {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
    });

    return results;
    } catch (error) {
    console.error('❌ Bulk scoring failed:', error);
    
    // Return failed results for all candidates
    return applications.map((application) => ({
        applicationId: application.id,
        candidateName: application.candidateName,
        oldScore: application.aiMatchScore,
        newScore: application.aiMatchScore || 0,
        scoreDelta: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
    }));
    }
}

export function getScoreChangeLabel(delta: number): string {
  if (delta > 0) return `+${delta}`;
  if (delta < 0) return `${delta}`;
  return 'No change';
}

export function getScoreChangeColor(delta: number): string {
  if (delta > 10) return 'text-green-600 dark:text-green-400';
  if (delta > 0) return 'text-emerald-600 dark:text-emerald-400';
  if (delta < -10) return 'text-red-600 dark:text-red-400';
  if (delta < 0) return 'text-orange-600 dark:text-orange-400';
  return 'text-muted-foreground';
}
