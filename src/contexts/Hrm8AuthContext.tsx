/**
 * HRM8 Authentication Context
 * Manages HRM8 Global Admin and Regional Licensee authentication state
 */

import { createContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/authStore';

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
  const store = useAuthStore();
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    const res = await store.login(email, password, 'ADMIN');
    if (res.success) {
      navigate('/hrm8/dashboard');
    }
    return res;
  };

  const logout = async () => {
    await store.logout();
    navigate('/hrm8/login');
  };

  const refreshHrm8User = async () => {
    await store.refreshUser();
  };

  return (
    <Hrm8AuthContext.Provider
      value={{
        hrm8User: store.userType === 'ADMIN' ? (store.user?.rawUser as Hrm8User) : null,
        isLoading: store.isLoading,
        isAuthenticated: store.isAuthenticated && store.userType === 'ADMIN',
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
  const store = useAuthStore();

  return {
    hrm8User: store.userType === 'ADMIN' ? (store.user?.rawUser as Hrm8User) : null,
    isLoading: store.isLoading,
    isAuthenticated: store.isAuthenticated && store.userType === 'ADMIN',
    login: async (email: string, password: string) => {
      const res = await store.login(email, password, 'ADMIN');
      return { success: res.success, error: res.error };
    },
    logout: store.logout,
    refreshHrm8User: store.refreshUser,
  };
}

