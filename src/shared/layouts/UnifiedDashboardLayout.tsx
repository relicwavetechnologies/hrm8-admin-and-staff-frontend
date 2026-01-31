import { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/shared/components/ui/sidebar";
import { UnifiedSidebar } from "../components/layouts/unified/UnifiedSidebar";
import { UnifiedHeader } from "../components/layouts/unified/UnifiedHeader";
import { getSidebarConfig } from "../config/navigation";
import { useAuth } from "../contexts/AuthContext";

interface UnifiedDashboardLayoutProps {
    children: ReactNode;
}

export function UnifiedDashboardLayout({ children }: UnifiedDashboardLayoutProps) {
    const { user, userType, logout } = useAuth();

    if (!user || !userType) return null;

    const config = getSidebarConfig(userType, user.rawUser);
    const authAdapter = {
        user: user.rawUser,
        isAuthenticated: true,
        isLoading: false,
        logout
    };

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <UnifiedSidebar config={config} auth={authAdapter} />

                <SidebarInset className="flex flex-col flex-1">
                    {/* Header */}
                    <UnifiedHeader />

                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                        <div className="mx-auto max-w-7xl w-full">
                            {children}
                        </div>
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
