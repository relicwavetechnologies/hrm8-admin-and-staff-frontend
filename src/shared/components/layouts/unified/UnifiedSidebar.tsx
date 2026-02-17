/**
 * Unified Sidebar Component
 * Replaces CandidateSidebar, ConsultantSidebar, Hrm8Sidebar with a single configurable component
 * Uses shadcn/ui Sidebar components with direct parent-to-first-child routing.
 */

import { useMemo, useState } from "react";
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
import { RegionToggler } from "@/shared/components/hrm8/RegionToggler";
import type { SidebarConfig, AuthAdapter, MenuItem } from "@/shared/types/dashboard";
import { getNestedRoutes } from "@/shared/config/nestedRoutes";

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

  // Check if any nested route is active
  const hasActiveNested = (parentPath: string) => {
    const nested = nestedRouteMap.get(parentPath) || [];
    return nested.some(route => isActive(route.path));
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
      <SidebarHeader className="border-b border-sidebar-border p-0 bg-sidebar">
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

      {/* Content - Menu Items with Collapsible Nested Routes */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const nestedRoutes = nestedRouteMap.get(item.path) || [];
                const hasNestedRoutes = nestedRoutes.length > 0;
                const parentTargetPath = nestedRoutes[0]?.path || item.path;
                const active = isActive(item.path) || hasActiveNested(item.path) || isActive(parentTargetPath);
                const hasActiveChild = hasActiveNested(item.path);
                const showChildren = isExpanded && hasNestedRoutes;

                return (
                  <div key={item.id}>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={active || hasActiveChild}
                        className={cn(
                          "relative transition-all duration-200",
                          "hover:bg-sidebar-accent",
                          (active || hasActiveChild) && [
                            "bg-sidebar-accent",
                            "text-sidebar-accent-foreground",
                            "font-medium",
                          ]
                        )}
                        tooltip={!isExpanded ? item.label : undefined}
                      >
                        <NavLink
                          to={parentTargetPath}
                          className="flex items-center gap-3 w-full"
                        >
                          <Icon
                            className={cn(
                              "h-5 w-5 transition-all",
                              !isExpanded && "mx-auto",
                              (active || hasActiveChild) && "text-sidebar-accent-foreground"
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

                    {showChildren && (
                      <div className="ml-8 mt-1 space-y-0.5">
                        {nestedRoutes.map((route) => {
                          const NestedIcon = route.icon;
                          const nestedActive = isActive(route.path);

                          return (
                            <NavLink
                              key={route.id}
                              to={route.path}
                              className={cn(
                                "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                                nestedActive
                                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                              )}
                            >
                              <NestedIcon className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{route.label}</span>
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-sidebar-border bg-sidebar p-3">
        <UnifiedSidebarFooter
          actions={config.footerActions}
          showLogout={config.showLogoutButton}
          onLogout={auth.logout}
          showAiToggle={false}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
