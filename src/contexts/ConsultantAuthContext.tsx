/**
 * Consultant Authentication Context
 * Manages consultant authentication state
 */

import { createContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { consultantAuthService } from '@/shared/lib/consultantAuthService';
import { useToast } from '@/shared/hooks/use-toast';
import { consultantService, ConsultantProfile } from '@/shared/lib/consultant/consultantService';
import { useAuth } from '@/shared/contexts/AuthContext';

export interface ConsultantUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'RECRUITER' | 'SALES_AGENT' | 'CONSULTANT_360';
  status: string;
}

interface ConsultantAuthContextType {
  consultant: ConsultantUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshConsultant: () => Promise<void>;
}

const ConsultantAuthContext = createContext<ConsultantAuthContextType | undefined>(undefined);

export function ConsultantAuthProvider({ children }: { children: ReactNode }) {
  const [consultant, setConsultant] = useState<ConsultantUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if consultant is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await consultantAuthService.getCurrentConsultant();
      if (response.success && response.data?.consultant) {
        setConsultant(response.data.consultant);
      } else {
        setConsultant(null);
      }
    } catch (error) {
      setConsultant(null);
    } finally {
      setIsLoading(false);
    }
  };

  const isProfileComplete = (profile: ConsultantProfile): boolean => {
    const hasBasicInfo =
      !!profile.first_name &&
      !!profile.last_name &&
      !!profile.phone &&
      !!profile.address &&
      !!profile.city &&
      !!profile.state_province &&
      !!profile.country;

    const hasLanguages =
      Array.isArray(profile.languages) &&
      profile.languages.length > 0 &&
      profile.languages.every((l) => l.language && l.proficiency);

    const hasIndustries =
      Array.isArray(profile.industry_expertise) &&
      profile.industry_expertise.length > 0 &&
      profile.industry_expertise.length <= 5;

    const hasPayment =
      !!profile.payment_method && Object.keys(profile.payment_method || {}).length > 0;

    const hasTax =
      !!profile.tax_information && Object.keys(profile.tax_information || {}).length > 0;

    return hasBasicInfo && hasLanguages && hasIndustries && hasPayment && hasTax;
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    console.log('[ConsultantAuth] Login attempt started for:', email);
    try {
      setIsLoading(true);
      const response = await consultantAuthService.login({ email, password });
      console.log('[ConsultantAuth] Login API response:', response);

      if (response.success && response.data?.consultant) {
        const userRole = response.data.consultant.role;
        console.log('[ConsultantAuth] Login successful. User role:', userRole);

        setConsultant(response.data.consultant);
        toast({
          title: 'Welcome back!',
          description: `Logged in as ${response.data.consultant.firstName} ${response.data.consultant.lastName}`,
        });

        // STRICT ROLE-BASED REDIRECT - each role goes to their dedicated dashboard only
        // Redirect mapping:
        // - RECRUITER → /consultant/dashboard (with profile check)
        // - SALES_AGENT → /sales-agent/dashboard
        // - CONSULTANT_360 → /consultant360/dashboard

        if (userRole === 'SALES_AGENT') {
          console.log('[ConsultantAuth] Redirecting SALES_AGENT to /sales-agent/dashboard');
          navigate('/sales-agent/dashboard', { replace: true });
          return { success: true };
        }

        if (userRole === 'CONSULTANT_360') {
          console.log('[ConsultantAuth] Redirecting CONSULTANT_360 to /consultant360/dashboard');
          navigate('/consultant360/dashboard', { replace: true });
          return { success: true };
        }

        // RECRUITER - check profile completeness before redirect
        console.log('[ConsultantAuth] User is RECRUITER. Checking profile completeness...');
        try {
          const profileResponse = await consultantService.getProfile();
          // Backend returns consultant directly in response.data, not response.data.consultant
          const profile = profileResponse.success ? ((profileResponse.data?.consultant || profileResponse.data) as ConsultantProfile) : null;
          console.log('[ConsultantAuth] Profile data:', profile);

          if (profile && !isProfileComplete(profile)) {
            console.log('[ConsultantAuth] Profile incomplete. Redirecting to onboarding.');
            navigate('/consultant/profile?onboarding=1', { replace: true });
          } else {
            console.log('[ConsultantAuth] Profile complete. Redirecting to /consultant/dashboard');
            navigate('/consultant/dashboard', { replace: true });
          }
        } catch (profileError) {
          console.error('[ConsultantAuth] Profile check failed:', profileError);
          navigate('/consultant/dashboard', { replace: true });
        }
        return { success: true };
      }

      const errorMessage = response.error || 'Login failed';
      console.warn('[ConsultantAuth] Login failed with response error:', errorMessage);
      toast({
        title: 'Login failed',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, error: errorMessage };
    } catch (error: unknown) {
      console.error('[ConsultantAuth] Login exception:', error);
      let errorMessage = 'Login failed. Please check your credentials.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: 'Login failed',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await consultantAuthService.logout();
    } catch (error) {
      // Ignore logout errors
    } finally {
      // Check current role to determine redirect path before clearing state
      const isSalesAgent = consultant?.role === 'SALES_AGENT';
      setConsultant(null);

      if (isSalesAgent) {
        navigate('/sales-agent/login');
      } else {
        navigate('/consultant/login');
      }
    }
  };

  const refreshConsultant = async (): Promise<void> => {
    try {
      const response = await consultantAuthService.getCurrentConsultant();
      if (response.success && response.data?.consultant) {
        setConsultant(response.data.consultant);
      } else {
        setConsultant(null);
      }
    } catch (error) {
      setConsultant(null);
    }
  };

  return (
    <ConsultantAuthContext.Provider
      value={{
        consultant,
        isLoading,
        isAuthenticated: !!consultant,
        login,
        logout,
        refreshConsultant,
      }}
    >
      {children}
    </ConsultantAuthContext.Provider>
  );
}

export function useConsultantAuth() {
  const { user, userType, isLoading, isAuthenticated, login, logout, refreshUser } = useAuth();

  return {
    consultant: (userType === 'CONSULTANT' || userType === 'SALES_AGENT' || userType === 'CONSULTANT360')
      ? (user?.rawUser as ConsultantUser)
      : null,
    isLoading,
    isAuthenticated: isAuthenticated && (userType === 'CONSULTANT' || userType === 'SALES_AGENT' || userType === 'CONSULTANT360'),
    login: async (email: string, password: string) => {
      // Default to CONSULTANT type for legacy login calls
      const res = await login(email, password, 'CONSULTANT');
      return { success: res.success, error: res.error };
    },
    logout,
    refreshConsultant: refreshUser,
  };
}
