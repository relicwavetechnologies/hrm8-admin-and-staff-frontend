/**
 * Hook to fetch and manage the most recent draft job for the current user
 */

import { useState, useEffect, useCallback } from 'react';
import { jobService } from '@/shared/lib/api/jobService';
import { mapBackendJobToFrontend } from '@/shared/lib/jobDataMapper';
import { Job } from '@/shared/types/job';
import { useAuth } from '@/contexts/AuthContext';

interface UseDraftJobReturn {
  draftJob: Job | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<Job | null>;
}

/**
 * Hook to get the most recent draft job for the current user
 */
export function useDraftJob(): UseDraftJobReturn {
  const { user } = useAuth();
  const [draftJob, setDraftJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDraft = useCallback(async (): Promise<Job | null> => {
    if (!user?.id) {
      setDraftJob(null);
      setLoading(false);
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await jobService.getJobs({ status: 'DRAFT' });

      if (response.success && response.data) {
        const { jobs } = response.data;
        const mappedJobs = jobs.map(mapBackendJobToFrontend);

        // Find the most recent draft job created by the current user
        const userDraftJobs = mappedJobs
          .filter(job => {
            const status = typeof job.status === 'string'
              ? job.status.toLowerCase()
              : job.status;
            return status === 'draft' && job.createdBy === user.id;
          })
          .sort((a, b) => {
            // Sort by updatedAt descending (most recent first)
            const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
            const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
            return bTime - aTime;
          });

        const draft = userDraftJobs.length > 0 ? userDraftJobs[0] : null;
        setDraftJob(draft);
        return draft;
      } else {
        setDraftJob(null);
        return null;
      }
    } catch (err) {
      console.error('Error fetching draft job:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch draft job'));
      setDraftJob(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchDraft();
  }, [fetchDraft]);

  return {
    draftJob,
    loading,
    error,
    refetch: fetchDraft,
  };
}

