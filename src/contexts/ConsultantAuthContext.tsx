/**
 * Consultant Authentication Context
 * Manages consultant authentication state
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { consultantAuthService } from '@/shared/lib/consultantAuthService';
import { useToast } from '@/shared/hooks/use-toast';
import { consultantService, ConsultantProfile } from '@/shared/lib/consultant/consultantService';

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
      !!profile.firstName &&
      !!profile.lastName &&
      !!profile.phone &&
      !!profile.address &&
      !!profile.city &&
      !!profile.stateProvince &&
      !!profile.country;

    const hasLanguages =
      Array.isArray(profile.languages) &&
      profile.languages.length > 0 &&
      profile.languages.every((l) => l.language && l.proficiency);

    const hasIndustries =
      Array.isArray(profile.industryExpertise) &&
      profile.industryExpertise.length > 0 &&
      profile.industryExpertise.length <= 5;

    const hasPayment =
      !!profile.paymentMethod && Object.keys(profile.paymentMethod || {}).length > 0;

    const hasTax =
      !!profile.taxInformation && Object.keys(profile.taxInformation || {}).length > 0;

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
          const profile = profileResponse.success ? profileResponse.data?.consultant : null;
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
  const context = useContext(ConsultantAuthContext);
  if (context === undefined) {
    throw new Error('useConsultantAuth must be used within a ConsultantAuthProvider');
  }
  return context;
}
