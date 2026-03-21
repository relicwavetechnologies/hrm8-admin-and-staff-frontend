import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api';

interface CanUseAiResponse {
  canUseAi: boolean;
  reason?: 'PAYG' | 'PLAN_EXPIRED' | 'NO_SUBSCRIPTION' | 'OK';
  planType?: string;
}

async function fetchCanUseAi(): Promise<CanUseAiResponse> {
  const res = await apiClient.get<CanUseAiResponse>('/api/subscription/can-use-ai');
  if (!res.success || !res.data) {
    return { canUseAi: false, reason: 'NO_SUBSCRIPTION' };
  }
  return res.data;
}

/**
 * Returns whether the current company can use AI features (screening, copilot, analysis).
 * Gated by backend; PAYG and expired plans return false.
 * @param enabled - When false, skips the API call (e.g. for non-company users). Default true.
 */
export function useCanUseAiFeatures(enabled = true) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['canUseAi'],
    queryFn: fetchCanUseAi,
    staleTime: 60_000, // 1 min
    enabled,
  });

  return {
    canUseAi: data?.canUseAi ?? false,
    reason: data?.reason,
    planType: data?.planType,
    isLoading,
    error,
    refetch,
  };
}
