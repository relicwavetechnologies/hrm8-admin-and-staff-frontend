import { ReactNode, useCallback, useEffect, useState } from "react";
import { SidebarProvider, SidebarInset } from "@/shared/components/ui/sidebar";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/shared/components/ui/resizable";
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
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            // Cmd+K or Ctrl+K to toggle AI panel
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                setIsAiPanelOpen((prev) => !prev);
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [showAiPanel]);

    return (
        <SidebarProvider>
            <CommandPalette />
            <div className="flex h-svh w-full overflow-hidden">
                <UnifiedSidebar
                    config={config}
                    auth={authAdapter}
                    showAiToggle={showAiPanel}
                    isAiOpen={isAiPanelOpen}
                    onToggleAi={toggleAiPanel}
                />

                <SidebarInset className="flex flex-col flex-1 min-h-0 overflow-hidden">
                    {/* Header */}
                    <UnifiedHeader
                        showAiToggle={showAiPanel}
                        isAiOpen={isAiPanelOpen}
                        onToggleAi={toggleAiPanel}
                    />

                    {/* Main Content - Keep mounted to prevent re-fetching */}
                    {showAiPanel ? (
                        <ResizablePanelGroup
                            direction="horizontal"
                            className="flex-1 min-h-0"
                            key={isAiPanelOpen ? "ai-open" : "ai-closed"}
                        >
                            <ResizablePanel
                                defaultSize={isAiPanelOpen ? 76 : 100}
                                minSize={isAiPanelOpen ? 60 : 100}
                                maxSize={isAiPanelOpen ? 80 : 100}
                            >
                                <main className="h-full min-h-0 overflow-y-auto p-4 md:p-6 lg:p-8">
                                    <div className="mx-auto max-w-7xl w-full">
                                        {children}
                                    </div>
                                </main>
                            </ResizablePanel>

                            {isAiPanelOpen && (
                                <>
                                    <ResizableHandle className="hover:bg-primary/40" withHandle />
                                    <ResizablePanel defaultSize={24} minSize={20} maxSize={40}>
                                        <AiAssistantSidebar
                                            streamEndpoint={
                                                userType === "ADMIN"
                                                    ? "/api/assistant/chat/hrm8/stream"
                                                    : "/api/assistant/chat/stream"
                                            }
                                        />
                                    </ResizablePanel>
                                </>
                            )}
                        </ResizablePanelGroup>
                    ) : (
                        <main className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 lg:p-8">
                            <div className="mx-auto max-w-7xl w-full">
                                {children}
                            </div>
                        </main>
                    )}
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
