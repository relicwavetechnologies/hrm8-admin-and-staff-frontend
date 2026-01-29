/**
 * Unified Sidebar Component
 * Replaces CandidateSidebar, ConsultantSidebar, Hrm8Sidebar with a single configurable component
 *
 * Supports two rendering modes:
 * - Simple Mode: Flat list of menu items (Candidate, Consultant, HRM8)
 * - Sectioned Mode: Grouped collapsible sections (AppSidebar/Main dashboard) - TODO
 */

import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo-light.png";
import iconMark from "@/assets/icon-mark.png";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/shared/components/ui/sidebar";
import { cn } from "@/shared/lib/utils";
import { UnifiedSidebarFooter } from "./UnifiedSidebarFooter";
import type { SidebarConfig, AuthAdapter, MenuItem } from "@/shared/types/dashboard";

interface UnifiedSidebarProps {
  config: SidebarConfig;
  auth: AuthAdapter;
}

export function UnifiedSidebar({ config, auth }: UnifiedSidebarProps) {
  const location = useLocation();
  const { open } = useSidebar();
  const [isHovering, setIsHovering] = useState(false);

  const isExpanded = open || (!open && isHovering);

  // Get filtered menu items (apply role-based filtering if provided)
  const menuItems: MenuItem[] = config.menuItems
    ? config.filterMenuItems
      ? config.filterMenuItems(config.menuItems, auth.user)
      : config.menuItems
    : [];

  // Check if a path is active
  const isActive = (path: string) => {
    if (location.pathname === path) return true;
    return location.pathname.startsWith(path + "/");
  };

  // Get user display info from config
  const userName = config.userDisplay.getName(auth.user);
  const userSubtitle = config.userDisplay.getSubtitle?.(auth.user);

  return (
    <Sidebar
      collapsible="icon"
      data-hover-expand={!open && isHovering}
      onMouseEnter={() => !open && setIsHovering(true)}
      onMouseLeave={() => !open && setIsHovering(false)}
    >
      {/* Header with Logo */}
      <SidebarHeader className="border-b border-sidebar-border p-4 bg-gradient-to-b from-sidebar-accent/30 to-transparent">
        <NavLink
          to={config.homePath}
          className={cn(
            "flex items-center transition-all duration-200 hover:opacity-80",
            isExpanded ? "justify-start px-2" : "justify-center"
          )}
        >
          {isExpanded ? (
            <>
              <img
                src={logoLight}
                alt="HRM8"
                className="h-8 block dark:hidden"
                style={{
                  filter:
                    "brightness(0) saturate(100%) invert(27%) sepia(95%) saturate(2878%) hue-rotate(224deg) brightness(96%) contrast(95%)",
                }}
              />
              <img
                src={logoDark}
                alt="HRM8"
                className="h-8 hidden dark:block opacity-100"
                style={{ filter: "brightness(0) saturate(100%) invert(1)" }}
              />
            </>
          ) : (
            <img src={iconMark} alt="HRM8" className="h-8 w-8 opacity-100" />
          )}
        </NavLink>
        {isExpanded && auth.user && (
          <p className="text-xs text-muted-foreground mt-2 px-2">
            {userSubtitle || userName}
          </p>
        )}
      </SidebarHeader>

      {/* Content - Simple Menu Items */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className={cn(
                        "relative transition-all duration-200",
                        "hover:bg-sidebar-accent/50",
                        active && [
                          "bg-primary/10",
                          "text-primary",
                          "font-medium",
                          isExpanded && "border-l-4 border-primary",
                        ]
                      )}
                    >
                      <NavLink
                        to={item.path}
                        className="flex items-center gap-3 w-full"
                      >
                        <Icon
                          className={cn(
                            "h-5 w-5 transition-all",
                            !isExpanded && "mx-auto"
                          )}
                        />
                        {isExpanded && (
                          <span className="transition-opacity duration-200">
                            {item.label}
                          </span>
                        )}
                        {isExpanded && item.badge && (
                          <div className="ml-auto">
                            <item.badge />
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-sidebar-border p-3 bg-gradient-to-t from-sidebar-accent/30 to-transparent">
        <UnifiedSidebarFooter
          actions={config.footerActions}
          showLogout={config.showLogoutButton}
          onLogout={auth.logout}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
