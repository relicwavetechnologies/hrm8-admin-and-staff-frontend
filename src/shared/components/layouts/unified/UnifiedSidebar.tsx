/**
 * Unified Sidebar Component
 * Replaces CandidateSidebar, ConsultantSidebar, Hrm8Sidebar with a single configurable component
 *
 * Supports two rendering modes:
 * - Simple Mode: Flat list of menu items (Candidate, Consultant, HRM8)
 * - Sectioned Mode: Grouped collapsible sections (AppSidebar/Main dashboard) - TODO
 */

import { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo-light.png";
import iconMark from "@/assets/icon-mark.png";
import { ChevronRight } from "lucide-react";
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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/shared/components/ui/hover-card";
import { cn } from "@/shared/lib/utils";
import { UnifiedSidebarFooter } from "./UnifiedSidebarFooter";
import { RegionToggler } from "@/shared/components/hrm8/RegionToggler";
import type { SidebarConfig, AuthAdapter, MenuItem } from "@/shared/types/dashboard";
import { getNestedRoutes } from "@/shared/config/nestedRoutes";

interface UnifiedSidebarProps {
  config: SidebarConfig;
  auth: AuthAdapter;
  showAiToggle?: boolean;
  isAiOpen?: boolean;
  onToggleAi?: () => void;
}

export function UnifiedSidebar({ config, auth, showAiToggle, isAiOpen, onToggleAi }: UnifiedSidebarProps) {
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

  const nestedRouteMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getNestedRoutes>>();
    if (config.dashboardType !== "hrm8") {
      return map;
    }

    const nestedRoutes = getNestedRoutes("ADMIN");
    for (const route of nestedRoutes) {
      if (!route.parentPath) continue;
      const existing = map.get(route.parentPath) || [];
      map.set(route.parentPath, [...existing, route]);
    }
    return map;
  }, [config.dashboardType]);

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
      className="bg-sidebar"
      data-hover-expand={!open && isHovering}
      onMouseEnter={() => !open && setIsHovering(true)}
      onMouseLeave={() => !open && setIsHovering(false)}
    >
      {/* Header with Logo */}
      <SidebarHeader className="border-b border-sidebar-border p-0 bg-gradient-to-b from-sidebar-accent to-sidebar">
        <NavLink
          to={config.homePath}
          className={cn(
            "flex items-center transition-all duration-200 hover:opacity-80 p-4 pb-2",
            isExpanded ? "justify-start px-6" : "justify-center"
          )}
        >
          {isExpanded ? (
            <>
              <img
                src={logoDark}
                alt="HRM8"
                className="h-8 block dark:hidden"
              />
              <img
                src={logoLight}
                alt="HRM8"
                className="h-8 hidden dark:block opacity-100"
              />
            </>
          ) : (
            <img src={iconMark} alt="HRM8" className="h-8 w-8 opacity-100" />
          )}
        </NavLink>
        {isExpanded && !!auth.user && (
          <p className="text-xs text-muted-foreground mt-0 px-6 pb-4">
            {userSubtitle || userName}
          </p>
        )}
        {config.dashboardType === "hrm8" && (
          <div className="px-2">
            <RegionToggler isExpanded={isExpanded} />
          </div>
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
                const nestedRoutes = nestedRouteMap.get(item.path) || [];
                const hasNestedRoutes = nestedRoutes.length > 0;

                const menuButton = (
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
                );

                return (
                  <SidebarMenuItem key={item.id}>
                    {hasNestedRoutes ? (
                      <HoverCard openDelay={120} closeDelay={120}>
                        <HoverCardTrigger asChild>
                          <div>{menuButton}</div>
                        </HoverCardTrigger>
                        <HoverCardContent
                          side="right"
                          align="start"
                          className="w-64 rounded-xl border border-border bg-popover p-2 shadow-xl"
                          sideOffset={14}
                        >
                          <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {item.label}
                          </div>
                          <div className="space-y-1">
                            {nestedRoutes.map((route) => {
                              const NestedIcon = route.icon;
                              const nestedActive = isActive(route.path);
                              return (
                                <NavLink
                                  key={route.id}
                                  to={route.path}
                                  className={cn(
                                    "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                                    nestedActive
                                      ? "bg-primary/10 text-primary"
                                      : "text-foreground hover:bg-muted"
                                  )}
                                >
                                  <NestedIcon className="h-4 w-4 shrink-0" />
                                  <span className="flex-1 truncate">{route.label}</span>
                                  <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                                </NavLink>
                              );
                            })}
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    ) : (
                      menuButton
                    )}
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
          showAiToggle={showAiToggle}
          isAiOpen={isAiOpen}
          onToggleAi={onToggleAi}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
