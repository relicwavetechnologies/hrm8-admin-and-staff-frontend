/**
 * Dynamic Dashboard Component
 * Protected route that renders the appropriate dashboard based on user type
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import { UnifiedDashboardLayout } from '@/shared/layouts/UnifiedDashboardLayout';
import { Loader2 } from 'lucide-react';

export default function DynamicDashboard() {
    const { isAuthenticated, isLoading, user } = useAuth();


    if (isLoading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <UnifiedDashboardLayout>
            <Outlet />
        </UnifiedDashboardLayout>
    );
}
