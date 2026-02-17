/**
 * Unified Sidebar Component
 * Replaces CandidateSidebar, ConsultantSidebar, Hrm8Sidebar with a single configurable component
 *
 * Uses shadcn/ui Sidebar components with Collapsible for nested menus
 */

import { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo-light.png";
import iconMark from "@/assets/icon-mark.png";
import { ChevronDown } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/shared/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
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

      {/* Content - Menu Items with Collapsible Nested Routes */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                const nestedRoutes = nestedRouteMap.get(item.path) || [];
                const hasNestedRoutes = nestedRoutes.length > 0;
                const hasActiveChild = hasActiveNested(item.path);

                // Menu item without nested routes
                if (!hasNestedRoutes) {
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        className={cn(
                          "relative transition-all duration-200",
                          "hover:bg-sidebar-accent",
                          active && [
                            "bg-primary/15",
                            "text-primary",
                            "font-semibold",
                            "shadow-sm",
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
                              !isExpanded && "mx-auto",
                              active && "drop-shadow-sm"
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
                }

                // Menu item with nested routes
                // When expanded: use Collapsible for inline nested items
                // When collapsed: use HoverCard to show nested items on hover
                if (!isExpanded) {
                  // Collapsed state - show HoverCard on hover
                  return (
                    <SidebarMenuItem key={item.id}>
                      <HoverCard openDelay={100} closeDelay={100}>
                        <HoverCardTrigger asChild>
                          <SidebarMenuButton
                            asChild
                            isActive={active || hasActiveChild}
                            className={cn(
                              "relative transition-all duration-200",
                              "hover:bg-sidebar-accent",
                              (active || hasActiveChild) && [
                                "bg-primary/15",
                                "text-primary",
                                "font-semibold",
                                "shadow-sm",
                              ]
                            )}
                            tooltip={item.label}
                          >
                            <NavLink to={item.path}>
                              <Icon
                                className={cn(
                                  "h-5 w-5 transition-all mx-auto",
                                  (active || hasActiveChild) && "drop-shadow-sm"
                                )}
                              />
                            </NavLink>
                          </SidebarMenuButton>
                        </HoverCardTrigger>
                        <HoverCardContent
                          side="right"
                          align="start"
                          className="w-56 rounded-lg border border-border bg-popover p-2 shadow-lg"
                          sideOffset={8}
                        >
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mb-1">
                            {item.label}
                          </div>
                          <div className="space-y-0.5">
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
                                      ? "bg-primary/20 text-primary font-semibold"
                                      : "text-foreground hover:bg-muted"
                                  )}
                                >
                                  <NestedIcon className={cn(
                                    "h-4 w-4 shrink-0",
                                    nestedActive && "drop-shadow-sm"
                                  )} />
                                  <span className="flex-1 truncate">{route.label}</span>
                                </NavLink>
                              );
                            })}
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </SidebarMenuItem>
                  );
                }

                // Expanded state - use Collapsible for inline nested items
                return (
                  <Collapsible
                    key={item.id}
                    defaultOpen={hasActiveChild}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          isActive={active || hasActiveChild}
                          className={cn(
                            "relative transition-all duration-200",
                            "hover:bg-sidebar-accent",
                            (active || hasActiveChild) && [
                              "bg-primary/15",
                              "text-primary",
                              "font-semibold",
                              "shadow-sm",
                            ]
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-5 w-5 transition-all",
                              (active || hasActiveChild) && "drop-shadow-sm"
                            )}
                          />
                          <span className="transition-opacity duration-200">
                            {item.label}
                          </span>
                          <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {nestedRoutes.map((route) => {
                            const NestedIcon = route.icon;
                            const nestedActive = isActive(route.path);
                            return (
                              <SidebarMenuSubItem key={route.id}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={nestedActive}
                                  className={cn(
                                    nestedActive && [
                                      "bg-primary/20",
                                      "text-primary",
                                      "font-semibold",
                                    ]
                                  )}
                                >
                                  <NavLink to={route.path}>
                                    <NestedIcon className={cn(
                                      "h-4 w-4 shrink-0",
                                      nestedActive && "drop-shadow-sm"
                                    )} />
                                    <span className="flex-1 truncate">{route.label}</span>
                                  </NavLink>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
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
