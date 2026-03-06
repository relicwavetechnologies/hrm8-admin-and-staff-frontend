/**
 * Authentication Context
 * Manages authentication state across the application
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService, User } from '@/shared/lib/authService';
import { useToast } from '@/shared/hooks/use-toast';
import { CompanyProfileSummary } from '@/shared/types/companyProfile';

const PENDING_VERIFICATION_KEY = 'hrm8PendingVerification';
const LAST_VERIFICATION_KEY = 'hrm8LastVerification';
const ONBOARDING_SKIP_KEY = 'hrm8OnboardingSkipUntil';
const ONBOARDING_SNOOZE_HOURS = 12;

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  profileSummary: CompanyProfileSummary | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; pendingVerification?: { email: string; companyId?: string } }>;
  logout: () => Promise<void>;
  registerCompany: (data: {
    companyName: string;
    companyWebsite: string;
    adminFirstName: string;
    adminLastName: string;
    adminEmail: string;
    password: string;
    countryOrRegion: string;
    acceptTerms: boolean;
  }) => Promise<{ success: boolean; verificationRequired?: boolean; email?: string }>;
  verifyCompany: (
    token: string,
    companyId: string,
    email?: string,
    password?: string
  ) => Promise<{ success: boolean; email?: string; needsPassword?: boolean; error?: string }>;
  refreshProfileSummary: () => Promise<CompanyProfileSummary | null>;
  snoozeOnboardingReminder: (hours?: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileSummary, setProfileSummary] = useState<CompanyProfileSummary | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const profile = await refreshProfileSummary();
      if (!profile) {
        setUser(null);
        setProfileSummary(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const shouldRedirectToOnboarding = () => {
    const skipUntilRaw = localStorage.getItem(ONBOARDING_SKIP_KEY);
    if (!skipUntilRaw) {
      return true;
    }
    const skipUntil = new Date(skipUntilRaw).getTime();
    if (Number.isNaN(skipUntil) || skipUntil < Date.now()) {
      localStorage.removeItem(ONBOARDING_SKIP_KEY);
      return true;
    }
    return false;
  };

  const handleOnboardingPrompt = (profile?: CompanyProfileSummary | null) => {
    if (!profile || profile.status === 'COMPLETED') {
      navigate('/home');
      return;
    }

    toast({
      title: "Let's finish your company profile",
      description: 'Complete your company profile to start posting jobs and invite your team.',
    });

    if (shouldRedirectToOnboarding() || location.pathname === '/company-profile') {
      navigate('/company-profile');
    } else {
      navigate('/home');
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; pendingVerification?: { email: string; companyId?: string } }> => {
    try {
      setIsLoading(true);
      const response = await authService.login({ email, password });

      if (response.success && response.data) {
        setUser(response.data.user);
        setProfileSummary(response.data.profile);
        toast({
          title: 'Welcome back!',
          description: `Logged in as ${response.data.user.email}`,
        });
        handleOnboardingPrompt(response.data.profile);
        return { success: true };
      } else {
        const errorMessage =
          response.error?.toLowerCase().includes('invalid email or password')
            ? 'Invalid email or password'
            : response.error || 'Invalid email or password';
        const pendingDetails =
          response.details?.code === 'PENDING_VERIFICATION'
            ? {
                email: (response.details.email as string) || email,
                companyId: response.details.companyId as string | undefined,
              }
            : null;

        if (pendingDetails) {
          toast({
            title: 'Verify your email',
            description: 'Please check your inbox for the verification link we just sent.',
          });
          return { success: false, pendingVerification: pendingDetails };
        }

        toast({
          title: 'Login failed',
          description: errorMessage,
          variant: 'destructive',
        });
        return { success: false };
      }
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setProfileSummary(null);
      localStorage.removeItem(ONBOARDING_SKIP_KEY);
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
      });
      navigate('/login');
    } catch (error) {
      // Even if logout fails, clear local state
      setUser(null);
      navigate('/login');
    }
  };

  const registerCompany = async (data: {
    companyName: string;
    companyWebsite: string;
    adminFirstName: string;
    adminLastName: string;
    adminEmail: string;
    password: string;
    countryOrRegion: string;
    acceptTerms: boolean;
  }): Promise<{ success: boolean; verificationRequired?: boolean; email?: string }> => {
    try {
      setIsLoading(true);
      const response = await authService.registerCompany(data);

      if (response.success && response.data) {
        // Check if verification is required
        if (response.data.verificationRequired) {
          // Store credentials temporarily for auto-login after verification
          const pendingPayload = JSON.stringify({
            email: data.adminEmail,
            password: data.password,
          });
          sessionStorage.setItem(PENDING_VERIFICATION_KEY, pendingPayload);
          localStorage.setItem(PENDING_VERIFICATION_KEY, pendingPayload);

          toast({
            title: 'Verification email sent!',
            description: `Please check your email (${data.adminEmail}) to verify your company.`,
          });

          return {
            success: true,
            verificationRequired: true,
            email: data.adminEmail,
          };
        } else {
          // Auto-verified (domain matched), auto-login
          toast({
            title: 'Company registered!',
            description: response.data.message || 'Company registered and verified successfully',
          });
          const loginResult = await login(data.adminEmail, data.password);
          return { success: loginResult.success };
        }
      } else {
        toast({
          title: 'Registration failed',
          description: response.error || 'Failed to register company',
          variant: 'destructive',
        });
        return { success: false };
      }
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCompany = async (
    token: string,
    companyId: string,
    email?: string,
    password?: string
  ): Promise<{ success: boolean; email?: string; needsPassword?: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const response = await authService.verifyCompany({ token, companyId });

      if (response.success && response.data) {
        const verifiedEmail = response.data.email || email;
        
        if (!verifiedEmail) {
          return { success: false, needsPassword: false, error: 'No email found in verification response' };
        }

        // If backend returned user data, it means a session was created automatically
        // Set the user in context and we're done
        if (response.data.user) {
          setUser(response.data.user);
          if (response.data.profile) {
            setProfileSummary(response.data.profile);
          }
          toast({
            title: 'Company verified!',
            description: response.data.message || 'Your company has been verified successfully',
          });
          
          // Clear stored credentials
          sessionStorage.removeItem('pendingVerification');
          
          // Don't redirect - let VerifyCompany page handle onboarding inline
          return { success: true, email: verifiedEmail };
        }

        // If no user data returned, try to auto-login if we have credentials
        if (email && password) {
          const loginResult = await login(email, password);
          
          // Clear stored credentials
          sessionStorage.removeItem(PENDING_VERIFICATION_KEY);
          localStorage.removeItem(PENDING_VERIFICATION_KEY);
          localStorage.setItem(
            LAST_VERIFICATION_KEY,
            JSON.stringify({
              email: verifiedEmail,
              timestamp: new Date().toISOString(),
            })
          );
          
          if (loginResult.success) {
            return { success: true, email: verifiedEmail };
          }

          return { success: true, email: verifiedEmail, needsPassword: true };
        } else {
          // No credentials available, return email for manual login
          sessionStorage.removeItem(PENDING_VERIFICATION_KEY);
          localStorage.removeItem(PENDING_VERIFICATION_KEY);
          localStorage.setItem(
            LAST_VERIFICATION_KEY,
            JSON.stringify({
              email: verifiedEmail,
              timestamp: new Date().toISOString(),
            })
          );
          return { success: true, email: verifiedEmail, needsPassword: true };
        }
      } else {
        const errorMsg = response.error || 'Invalid or expired verification token';
        toast({
          title: 'Verification failed',
          description: errorMsg,
          variant: 'destructive',
        });
        return { success: false, needsPassword: false, error: errorMsg };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'An error occurred during verification';
      toast({
        title: 'Verification failed',
        description: errorMsg,
        variant: 'destructive',
      });
      return { success: false, needsPassword: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfileSummary = async (): Promise<CompanyProfileSummary | null> => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data.user);
        setProfileSummary(response.data.profile);
        return response.data.profile;
      }
    } catch (error) {
      setUser(null);
      setProfileSummary(null);
    }
    return null;
  };

  const snoozeOnboardingReminder = (hours: number = ONBOARDING_SNOOZE_HOURS) => {
    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
    localStorage.setItem(ONBOARDING_SKIP_KEY, expiresAt);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        profileSummary,
        login,
        logout,
        registerCompany,
        verifyCompany,
        refreshProfileSummary,
        snoozeOnboardingReminder,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

