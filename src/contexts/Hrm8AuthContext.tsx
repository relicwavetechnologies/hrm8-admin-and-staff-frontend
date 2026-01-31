/**
 * HRM8 Authentication Context
 * Manages HRM8 Global Admin and Regional Licensee authentication state
 */

import { createContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { hrm8AuthService } from '@/shared/lib/hrm8AuthService';
import { useToast } from '@/shared/hooks/use-toast';
import { useAuth } from '@/shared/contexts/AuthContext';

export interface Hrm8User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'GLOBAL_ADMIN' | 'REGIONAL_LICENSEE';
  status: string;
  regionIds?: string[];
  licenseeId?: string;
}

interface Hrm8AuthContextType {
  hrm8User: Hrm8User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshHrm8User: () => Promise<void>;
}

const Hrm8AuthContext = createContext<Hrm8AuthContextType | undefined>(undefined);

export function Hrm8AuthProvider({ children }: { children: ReactNode }) {
  const [hrm8User, setHrm8User] = useState<Hrm8User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if HRM8 user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await hrm8AuthService.getCurrentHrm8User();
      if (response.success && response.data?.hrm8User) {
        setHrm8User(response.data.hrm8User);
      } else {
        setHrm8User(null);
      }
    } catch (error) {
      setHrm8User(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const response = await hrm8AuthService.login({ email, password });
      if (response.success && response.data?.hrm8User) {
        setHrm8User(response.data.hrm8User);
        toast({
          title: 'Welcome back!',
          description: `Logged in as ${response.data.hrm8User.firstName} ${response.data.hrm8User.lastName}`,
        });
        navigate('/hrm8/dashboard');
        return { success: true };
      }
      const errorMessage = response.error || 'Login failed';
      toast({
        title: 'Login failed',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, error: errorMessage };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please check your credentials.';
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
      await hrm8AuthService.logout();
    } catch (error) {
      // Ignore logout errors
    } finally {
      setHrm8User(null);
      navigate('/hrm8/login');
    }
  };

  const refreshHrm8User = async (): Promise<void> => {
    try {
      const response = await hrm8AuthService.getCurrentHrm8User();
      if (response.success && response.data?.hrm8User) {
        setHrm8User(response.data.hrm8User);
      } else {
        setHrm8User(null);
      }
    } catch (error) {
      setHrm8User(null);
    }
  };

  return (
    <Hrm8AuthContext.Provider
      value={{
        hrm8User,
        isLoading,
        isAuthenticated: !!hrm8User,
        login,
        logout,
        refreshHrm8User,
      }}
    >
      {children}
    </Hrm8AuthContext.Provider>
  );
}

export function useHrm8Auth() {
  const { user, userType, isLoading, isAuthenticated, login, logout, refreshUser } = useAuth();

  return {
    hrm8User: userType === 'ADMIN' ? (user?.rawUser as Hrm8User) : null,
    isLoading,
    isAuthenticated: isAuthenticated && userType === 'ADMIN',
    login: async (email: string, password: string) => {
      const res = await login(email, password, 'ADMIN');
      return { success: res.success, error: res.error };
    },
    logout,
    refreshHrm8User: refreshUser,
  };
}

