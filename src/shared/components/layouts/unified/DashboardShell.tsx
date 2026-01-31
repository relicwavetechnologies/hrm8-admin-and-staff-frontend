/**
 * Dashboard Shell Component
 * Unified layout wrapper that conditionally includes providers and features
 * based on the dashboard configuration.
 *
 * Replaces: CandidateLayout, ConsultantLayout, Hrm8Layout, DashboardLayout
 */

import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/shared/components/ui/sidebar";
import { CommandPalette } from "@/shared/components/common/CommandPalette";
import { KeyboardShortcutsDialog } from "@/shared/components/dialogs/KeyboardShortcutsDialog";
import { useNavigationShortcuts } from "@/shared/hooks/useKeyboardShortcuts";
import { useSidebarState } from "@/shared/hooks/useSidebarState";
import { WebSocketProvider } from "@/contexts/WebSocketContext";
import { UnifiedSidebar } from "./UnifiedSidebar";
import { UnifiedHeader } from "./UnifiedHeader";
import type { DashboardConfig, AuthAdapter } from "@/shared/types/dashboard";

interface DashboardShellProps {
  config: DashboardConfig;
  auth: AuthAdapter;
  children?: ReactNode;
}

export function DashboardShell({ config, auth, children }: DashboardShellProps) {
  const { open, setOpen } = useSidebarState(config.sidebarStateKey);
  useNavigationShortcuts();

  const ProfileDialog = config.features.profileCompletionDialog;

  // Build the main content
  const mainContent = (
    <div className="min-h-screen flex w-full">
      <UnifiedSidebar config={config.sidebar} auth={auth} />
      <SidebarInset className="flex-1">
        <UnifiedHeader />
        <div className="min-w-0">
          <Outlet />
          {children}
        </div>
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
