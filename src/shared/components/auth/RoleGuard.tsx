import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/authStore';
import { UserType } from '@/shared/services/authService';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';

interface RoleGuardProps {
    allowedTypes: UserType[];
    children?: ReactNode;
}

/**
 * RoleGuard protects routes based on user type.
 * It also handles automatic redirection for logged-in users 
 * who try to access a dashboard they don't belong to.
 */
export function RoleGuard({ allowedTypes, children }: RoleGuardProps) {
    const { isAuthenticated, isLoading, user, userType } = useAuthStore();
    const location = useLocation();
    const { toast } = useToast();

    useEffect(() => {
        if (!isLoading && isAuthenticated && userType && !allowedTypes.includes(userType)) {
            toast({
                title: "Access Denied",
                description: `Your account doesn't have access to this section. Redirecting to your dashboard...`,
                variant: 'destructive'
            });
        }
    }, [isAuthenticated, isLoading, userType, allowedTypes, toast]);

    if (isLoading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // Role check
    if (!allowedTypes.includes(userType as UserType)) {
        // Redirect to their default dashboard
        switch (userType) {
            case 'ADMIN':
                return <Navigate to="/hrm8/dashboard" replace />;
            case 'CONSULTANT':
                return <Navigate to="/consultant/dashboard" replace />;
            case 'SALES_AGENT':
                return <Navigate to="/sales-agent/dashboard" replace />;
            case 'CONSULTANT360':
                return <Navigate to="/consultant360/dashboard" replace />;
            default:
                return <Navigate to="/login" replace />;
        }
    }

    return children ? <>{children}</> : null;
}
