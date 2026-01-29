import { ReactNode } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/shared/components/ui/sidebar";
import { UnifiedSidebar } from "../components/layouts/unified/UnifiedSidebar";
import { getSidebarConfig } from "../config/navigation";
import { useAuth } from "../contexts/AuthContext";
import { UserNav } from "../components/layouts/UserNav";
import { Separator } from "@/shared/components/ui/separator";

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
                    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 sticky top-0 bg-background/95 backdrop-blur z-10">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger className="-ml-1" />
                            <Separator orientation="vertical" className="mr-2 h-4" />
                            <h2 className="text-sm font-semibold truncate max-w-[200px] md:max-w-md">
                                {config.userDisplay.getSubtitle?.(user.rawUser)}
                            </h2>
                        </div>

                        <div className="flex items-center gap-4">
                            <UserNav user={user} logout={logout} />
                        </div>
                    </header>

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
