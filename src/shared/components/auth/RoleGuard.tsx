import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/authStore';
import { UserType } from '@/shared/services/authService';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';

type Hrm8Role = 'GLOBAL_ADMIN' | 'REGIONAL_LICENSEE';

interface RoleGuardProps {
    allowedTypes: UserType[];
    allowedRoles?: Hrm8Role[]; // Optional: for fine-grained HRM8 role control
    children?: ReactNode;
}

/**
 * Unified RoleGuard - Single source of truth for authorization
 *
 * Protects routes based on:
 * - userType: ADMIN, CONSULTANT, SALES_AGENT, CONSULTANT360
 * - allowedRoles (optional): For ADMIN users, can restrict to GLOBAL_ADMIN or REGIONAL_LICENSEE
 *
 * Waits for full auth hydration to prevent race conditions.
 */
export function RoleGuard({ allowedTypes, allowedRoles, children }: RoleGuardProps) {
    const { isAuthenticated, isLoading, user, userType } = useAuthStore();
    const location = useLocation();
    const { toast } = useToast();

    // Extract HRM8 role if user is ADMIN
    const hrm8Role = userType === 'ADMIN' && user?.rawUser
        ? (user.rawUser as any).role as Hrm8Role
        : null;

    // Check if user passes ALL authorization checks
    const userTypeAllowed = allowedTypes.includes(userType as UserType);
    const hrm8RoleAllowed = !allowedRoles || !hrm8Role || allowedRoles.includes(hrm8Role);
    const hasAccess = userTypeAllowed && hrm8RoleAllowed;

    useEffect(() => {
        if (!isLoading && isAuthenticated && user && !hasAccess) {
            const roleInfo = allowedRoles && hrm8Role
                ? ` (requires ${allowedRoles.join(' or ')})`
                : '';
            toast({
                title: "Access Denied",
                description: `Your account doesn't have access to this section${roleInfo}. Redirecting to your dashboard...`,
                variant: 'destructive'
            });
        }
    }, [isAuthenticated, isLoading, user, hasAccess, allowedRoles, hrm8Role, toast]);

    // CRITICAL: Wait for BOTH isLoading === false AND user to be present
    // This prevents race conditions where guards fire before auth hydration completes
    if (isLoading || (isAuthenticated && !user)) {
        return (
            <div className="h-screen w-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // Authorization check - redirect if access denied
    if (!hasAccess) {
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
