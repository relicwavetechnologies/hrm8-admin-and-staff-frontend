/**
 * Unified Authentication Context (Bridge)
 * Bridges legacy useAuth calls to the new Zustand authStore
 */

import { createContext, useContext, ReactNode } from 'react';
import { useAuthStore } from '../stores/authStore';
import { UnifiedUser, UserType } from '../services/authService';

interface AuthContextType {
    user: UnifiedUser | null;
    userType: UserType | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string, type: UserType) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const store = useAuthStore();

    return (
        <AuthContext.Provider
            value={{
                user: store.user,
                userType: store.userType,
                isLoading: store.isLoading,
                isAuthenticated: store.isAuthenticated,
                login: store.login,
                logout: store.logout,
                refreshUser: store.refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        // Fallback to direct store access if provider is missing
        const store = useAuthStore();
        return {
            user: store.user,
            userType: store.userType,
            isLoading: store.isLoading,
            isAuthenticated: store.isAuthenticated,
            login: store.login,
            logout: store.logout,
            refreshUser: store.refreshUser,
        };
    }
    return context;
}
