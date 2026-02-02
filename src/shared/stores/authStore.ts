import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, UnifiedUser, UserType } from '../services/authService';

interface AuthState {
    user: UnifiedUser | null;
    userType: UserType | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

interface AuthActions {
    login: (email: string, password: string, type: UserType) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    refreshUser: () => Promise<void>;
    setUser: (user: UnifiedUser | null, type: UserType | null) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
    persist(
        (set, get) => ({
            // State
            user: null,
            userType: null,
            isAuthenticated: false,
            isLoading: true,
            error: null,

            // Actions
            setUser: (user, type) => set({
                user,
                userType: type,
                isAuthenticated: !!user
            }),

            setLoading: (isLoading) => set({ isLoading }),

            setError: (error) => set({ error }),

            login: async (email, password, type) => {
                set({ isLoading: true, error: null });
                try {
                    const result = await authService.login(email, password, type);
                    if (result.success && result.user) {
                        set({
                            user: result.user,
                            userType: type,
                            isAuthenticated: true,
                            isLoading: false
                        });
                        return { success: true };
                    }
                    const error = result.error || 'Login failed';
                    set({ isLoading: false, error });
                    return { success: false, error };
                } catch (error: any) {
                    const message = error.message || 'Login failed';
                    set({ isLoading: false, error: message });
                    return { success: false, error: message };
                }
            },

            logout: async () => {
                const { userType } = get();
                if (userType) {
                    try {
                        await authService.logout(userType);
                    } catch (e) {
                        console.error('Logout error', e);
                    }
                }
                set({
                    user: null,
                    userType: null,
                    isAuthenticated: false,
                    error: null
                });
            },

            checkAuth: async () => {
                const { userType } = get();
                if (!userType) {
                    set({ isLoading: false });
                    return;
                }
                set({ isLoading: true });
                try {
                    const user = await authService.getCurrentUser(userType);
                    if (user) {
                        set({ user, isAuthenticated: true });
                    } else {
                        set({ user: null, userType: null, isAuthenticated: false });
                    }
                } catch (e) {
                    set({ user: null, userType: null, isAuthenticated: false });
                } finally {
                    set({ isLoading: false });
                }
            },

            refreshUser: async () => {
                const { userType } = get();
                if (userType) {
                    const user = await authService.getCurrentUser(userType);
                    set({ user });
                }
            }
        }),
        {
            name: 'hrm8-auth-storage',
            partialize: (state) => ({
                userType: state.userType
                // We keep userType to know which API to check on reload, 
                // but usually user data should be refetched
            }),
        }
    )
);
