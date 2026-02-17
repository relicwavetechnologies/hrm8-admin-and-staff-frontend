/**
 * Dashboard Shell Component
 * Unified layout wrapper that conditionally includes providers and features
 * based on the dashboard configuration.
 *
 * Replaces: CandidateLayout, ConsultantLayout, Hrm8Layout, DashboardLayout
 */

import { ReactNode, useState, useCallback, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/shared/components/ui/sidebar";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/shared/components/ui/resizable";
import { CommandPalette } from "@/shared/components/common/CommandPalette";
import { KeyboardShortcutsDialog } from "@/shared/components/dialogs/KeyboardShortcutsDialog";
import { useNavigationShortcuts } from "@/shared/hooks/useKeyboardShortcuts";
import { useSidebarState } from "@/shared/hooks/useSidebarState";
import { WebSocketProvider } from "@/contexts/WebSocketContext";
import { UnifiedSidebar } from "./UnifiedSidebar";
import { UnifiedHeader } from "./UnifiedHeader";
import { AiAssistantSidebar } from "@/shared/components/common/AiAssistantSidebar";
import type { DashboardConfig, AuthAdapter } from "@/shared/types/dashboard";

interface DashboardShellProps {
  config: DashboardConfig;
  auth: AuthAdapter;
  children?: ReactNode;
}

export function DashboardShell({ config, auth, children }: DashboardShellProps) {
  const { open, setOpen } = useSidebarState(config.sidebarStateKey);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);

  // Dynamic AI panel sizing
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1920);
  // Constants from sidebar.tsx (approximate in pixels for calculation)
  const SIDEBAR_WIDTH_EXPANDED = 256; // 16rem
  const SIDEBAR_WIDTH_COLLAPSED = 64; // 4rem

  const currentSidebarWidth = open ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED;
  const remainingWidth = windowWidth - currentSidebarWidth;

  // Calculate percentages relative to the ResizablePanelGroup (remaining width)
  // We want 20% to 40% of TOTAL screen width
  const minPanelPercent = (windowWidth * 0.20 / remainingWidth) * 100;
  const maxPanelPercent = (windowWidth * 0.40 / remainingWidth) * 100;
  const defaultPanelPercent = (windowWidth * 0.25 / remainingWidth) * 100; // Aim for 25% default

  // Safety clamps (0-100)
  const safeMin = Math.min(Math.max(minPanelPercent, 10), 90);
  const safeMax = Math.min(Math.max(maxPanelPercent, 20), 90);
  const safeDefault = Math.min(Math.max(defaultPanelPercent, safeMin), safeMax);

  useNavigationShortcuts();

  const ProfileDialog = config.features.profileCompletionDialog;
  const aiEnabled = config.features.aiAssistant?.enabled ?? false;
  const aiStreamEndpoint = config.features.aiAssistant?.streamEndpoint;

  // Cmd+L keyboard shortcut to toggle AI panel
  const toggleAiPanel = useCallback(() => {
    setIsAiPanelOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!aiEnabled) {
      setIsAiPanelOpen(false);
      return;
    }

    const onResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [aiEnabled]);

  // Build the main content
  const mainContent = (
    <div className="min-h-screen flex w-full">
      <UnifiedSidebar
        config={config.sidebar}
        auth={auth}
      />
      <SidebarInset className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <UnifiedHeader
          showAiToggle={aiEnabled}
          isAiOpen={isAiPanelOpen}
          onToggleAi={toggleAiPanel}
        />

        {/* Main Content with optional AI panel */}
        {aiEnabled ? (
          <ResizablePanelGroup
            direction="horizontal"
            className="flex-1 min-h-0"
            key={isAiPanelOpen ? "ai-open" : "ai-closed"}
          >
            <ResizablePanel
              defaultSize={isAiPanelOpen ? (100 - safeDefault) : 100}
              minSize={isAiPanelOpen ? (100 - safeMax) : 100}
              maxSize={isAiPanelOpen ? (100 - safeMin) : 100}
            >
              <div className="h-full min-h-0 overflow-y-auto">
                <Outlet />
                {children}
              </div>
            </ResizablePanel>

            {isAiPanelOpen && (
              <>
                <ResizableHandle className="hover:bg-primary/40" withHandle />
                <ResizablePanel defaultSize={safeDefault} minSize={safeMin} maxSize={safeMax}>
                  <AiAssistantSidebar streamEndpoint={aiStreamEndpoint} />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <Outlet />
            {children}
          </div>
        )}
      </SidebarInset>
    </div>
  );

  // Build the full content tree with optional features
  let content = mainContent;

  // Add profile completion dialog if configured
  if (ProfileDialog) {
    content = (
      <>
        {content}
        <ProfileDialog />
      </>
    );
  }

  // Add keyboard shortcuts dialog if enabled
  if (config.features.keyboardShortcuts) {
    content = (
      <>
        {content}
        <KeyboardShortcutsDialog />
      </>
    );
  }

  // Add command palette if enabled
  if (config.features.commandPalette) {
    content = (
      <>
        {content}
        <CommandPalette />
      </>
    );
  }

  // Wrap with SidebarProvider
  content = (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      {content}
    </SidebarProvider>
  );

  // Wrap with WebSocketProvider if enabled
  if (config.features.webSocket) {
    content = (
      <WebSocketProvider
        isAuthenticated={auth.isAuthenticated}
        userEmail={auth.getEmail?.()}
      >
        {content}
      </WebSocketProvider>
    );
  }

  return content;
}
