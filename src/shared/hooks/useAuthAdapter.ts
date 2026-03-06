/**
 * Unified Auth Adapter Hook
 * Provides a consistent interface across all dashboard auth contexts
 */

import { useMemo } from "react";
import { useAuth } from "@/shared/contexts/AuthContext";
import type { AuthAdapter, DashboardType } from "@/shared/types/dashboard";

/**
 * Hook that provides a unified auth interface for any dashboard type.
 * Automatically maps to the unified auth context.
 */
export function useAuthAdapter(_dashboardType: DashboardType): AuthAdapter {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  return useMemo(() => {
    return {
      user: user as unknown as any, // Cast to any to satisfy the specific user types in AuthAdapter if strict
      isAuthenticated,
      isLoading,
      logout,
      getEmail: () => user?.email,
    };
  }, [user, isAuthenticated, isLoading, logout]);
}

/**
 * Type-safe auth adapter variants for each dashboard type.
 */
export function useCandidateAuthAdapter() {
  return useAuthAdapter("candidate");
}

export function useConsultantAuthAdapter() {
  return useAuthAdapter("consultant");
}

export function useHrm8AuthAdapter() {
  return useAuthAdapter("hrm8");
}

export function useMainAuthAdapter() {
  return useAuthAdapter("main");
}
