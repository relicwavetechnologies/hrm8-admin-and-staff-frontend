/**
 * Unified Authentication Context
 * Manages authentication state for all user types
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, UnifiedUser, UserType } from '../services/authService';
import { useToast } from '@/shared/hooks/use-toast';

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
    const [user, setUser] = useState<UnifiedUser | null>(null);
    const [userType, setUserType] = useState<UserType | null>(() => {
        return localStorage.getItem('hrm8_user_type') as UserType | null;
    });
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { toast } = useToast();

    // Check if user is authenticated on mount
    useEffect(() => {
        if (userType) {
            checkAuth(userType);
        } else {
            setIsLoading(false);
        }
    }, []);

    const checkAuth = async (type: UserType) => {
        try {
            const currentUser = await authService.getCurrentUser(type);
            if (currentUser) {
                setUser(currentUser);
                setUserType(type);
            } else {
                setUser(null);
                setUserType(null);
                localStorage.removeItem('hrm8_user_type');
            }
        } catch (error) {
            setUser(null);
            setUserType(null);
            localStorage.removeItem('hrm8_user_type');
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (
        email: string,
        password: string,
        type: UserType
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            setIsLoading(true);
            const result = await authService.login(email, password, type);

            if (result.success && result.user) {
                setUser(result.user);
                setUserType(type);
                localStorage.setItem('hrm8_user_type', type);

                toast({
                    title: 'Welcome back!',
                    description: `Logged in as ${result.user.firstName} ${result.user.lastName}`,
                });

                // Redirect based on user type
                switch (type) {
                    case 'ADMIN':
                        navigate('/hrm8/dashboard');
                        break;
                    case 'CONSULTANT':
                        navigate('/consultant/dashboard');
                        break;
                    case 'SALES_AGENT':
                        navigate('/sales-agent/dashboard');
                        break;
                    case 'CONSULTANT360':
                        navigate('/consultant360/dashboard');
                        break;
                }

                return { success: true };
            }

            const errorMessage = result.error || 'Login failed';
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
            if (userType) {
                await authService.logout(userType);
            }
        } catch (error) {
            // Ignore logout errors
        } finally {
            setUser(null);
            setUserType(null);
            localStorage.removeItem('hrm8_user_type');
            navigate('/login');
        }
    };

    const refreshUser = async (): Promise<void> => {
        if (userType) {
            const currentUser = await authService.getCurrentUser(userType);
            setUser(currentUser);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                userType,
                isLoading,
                isAuthenticated: !!user,
                login,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
