/**
 * Consultant Authentication Context
 * Manages consultant authentication state
 */

import { createContext, ReactNode } from 'react';
import { useAuthStore } from '@/shared/stores/authStore';

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
  const store = useAuthStore();

  const login = async (email: string, password: string) => {
    return store.login(email, password, 'CONSULTANT');
  };

  const logout = async () => {
    await store.logout();
  };

  const refreshConsultant = async () => {
    await store.refreshUser();
  };

  return (
    <ConsultantAuthContext.Provider
      value={{
        consultant: (store.userType === 'CONSULTANT' || store.userType === 'SALES_AGENT' || store.userType === 'CONSULTANT360')
          ? (store.user?.rawUser as ConsultantUser)
          : null,
        isLoading: store.isLoading,
        isAuthenticated: store.isAuthenticated &&
          (store.userType === 'CONSULTANT' || store.userType === 'SALES_AGENT' || store.userType === 'CONSULTANT360'),
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
  const store = useAuthStore();

  return {
    consultant: (store.userType === 'CONSULTANT' || store.userType === 'SALES_AGENT' || store.userType === 'CONSULTANT360')
      ? (store.user?.rawUser as ConsultantUser)
      : null,
    isLoading: store.isLoading,
    isAuthenticated: store.isAuthenticated &&
      (store.userType === 'CONSULTANT' || store.userType === 'SALES_AGENT' || store.userType === 'CONSULTANT360'),
    login: async (email: string, password: string) => {
      const res = await store.login(email, password, 'CONSULTANT');
      return { success: res.success, error: res.error };
    },
    logout: store.logout,
    refreshConsultant: store.refreshUser,
  };
}


// End of file

// End of file
