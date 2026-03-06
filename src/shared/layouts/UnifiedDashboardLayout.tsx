import { ReactNode, useCallback, useEffect, useState } from "react";
import { SidebarProvider, SidebarInset } from "@/shared/components/ui/sidebar";
import { CustomResizablePanel } from "@/shared/components/ui/custom-resizable";
import { UnifiedSidebar } from "../components/layouts/unified/UnifiedSidebar";
import { UnifiedHeader } from "../components/layouts/unified/UnifiedHeader";
import { CommandPalette } from "../components/common/CommandPalette";
import { AiAssistantSidebar } from "../components/common/AiAssistantSidebar";
import { getSidebarConfig } from "../config/navigation";
import { useAuthStore } from "../stores/authStore";
import { useLocation } from "react-router-dom";

interface UnifiedDashboardLayoutProps {
    children: ReactNode;
}

export function UnifiedDashboardLayout({ children }: UnifiedDashboardLayoutProps) {
    const { user, userType, logout } = useAuthStore();
    const location = useLocation();
    const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);

    if (!user || !userType) return null;

    const config = getSidebarConfig(userType, user.rawUser);
    const authAdapter = {
        user: user.rawUser,
        isAuthenticated: true,
        isLoading: false,
        logout
    };

    // Enable AI for HRM8 users on /hrm8 routes and Consultants on /consultant routes
    const showAiPanel =
        (userType === "ADMIN" && location.pathname.startsWith("/hrm8")) ||
        (userType === "CONSULTANT" && location.pathname.startsWith("/consultant")) ||
        (userType === "CONSULTANT" && location.pathname.startsWith("/sales-agent")) ||
        (userType === "CONSULTANT" && location.pathname.startsWith("/consultant360"));

    const toggleAiPanel = useCallback(() => {
        setIsAiPanelOpen((prev) => !prev);
    }, []);

    useEffect(() => {
        if (!showAiPanel) {
            setIsAiPanelOpen(false);
            return undefined;
        }

        // toggle-ai-panel — used by header button
        const handleToggle = () => setIsAiPanelOpen((prev) => !prev);
        // open-ai-panel — used by publishAiReference; always opens, never closes
        const handleOpen = () => setIsAiPanelOpen(true);

        window.addEventListener("toggle-ai-panel", handleToggle);
        window.addEventListener("open-ai-panel", handleOpen);
        return () => {
            window.removeEventListener("toggle-ai-panel", handleToggle);
            window.removeEventListener("open-ai-panel", handleOpen);
        };
    }, [showAiPanel]);

    return (
        <SidebarProvider>
            <CommandPalette />
            <div className="flex h-svh w-full overflow-hidden">
                <UnifiedSidebar
                    config={config}
                    auth={authAdapter}
                />

                <SidebarInset className="flex flex-col flex-1 min-h-0 overflow-hidden">
                    {/* Header */}
                    <UnifiedHeader
                        showAiToggle={showAiPanel}
                        isAiOpen={isAiPanelOpen}
                        onToggleAi={toggleAiPanel}
                    />

                    {/* Main Content - Keep mounted to prevent re-fetching */}
                    <div className="flex flex-1 min-h-0 overflow-hidden">
                        <main className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 lg:p-8">
                            <div className="mx-auto max-w-7xl w-full">
                                {children}
                            </div>
                        </main>

                        {showAiPanel && (
                            <CustomResizablePanel
                                isOpen={isAiPanelOpen}
                                defaultWidth={500}
                                minWidth={320}
                                maxWidthPercent={40}
                            >
                                <AiAssistantSidebar
                                    streamEndpoint={
                                        userType === "ADMIN"
                                            ? "/api/assistant/chat/hrm8/stream"
                                            : "/api/assistant/chat/stream"
                                    }
                                />
                            </CustomResizablePanel>
                        )}
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
