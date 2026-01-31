import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo-light.png";
import iconMark from "@/assets/icon-mark.png";
import {
  LayoutDashboard,
  Briefcase,
  DollarSign,
  User,
  MessageSquare,
  // import { ArrowRightLeft } from "lucide-react";
  Wallet,
  Settings,
} from "lucide-react";
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
import { ConsultantSidebarFooter } from "./ConsultantSidebarFooter";
import { useAuth } from "@/shared/contexts/AuthContext";

const menuItems = [
  { path: "/consultant/dashboard", label: "Overview", icon: LayoutDashboard },
  { path: "/consultant/jobs", label: "My Jobs", icon: Briefcase },
  { path: "/consultant/messages", label: "Messages", icon: MessageSquare },
  { path: "/consultant/commissions", label: "Commissions", icon: DollarSign },
  { path: "/consultant/wallet", label: "Wallet", icon: Wallet },
  { path: "/consultant/profile", label: "Profile", icon: User },
  { path: "/consultant/settings", label: "Settings", icon: Settings },
];

export function ConsultantSidebar() {
  const location = useLocation();
  const { open } = useSidebar();
  const { user } = useAuth();
  const [isHovering, setIsHovering] = useState(false);

  const isExpanded = open || (!open && isHovering);

  const isActive = (path: string) => {
    if (location.pathname === path) return true;
    return location.pathname.startsWith(path + "/");
  };

  return (
    <Sidebar
      collapsible="icon"
      data-hover-expand={!open && isHovering}
      onMouseEnter={() => !open && setIsHovering(true)}
      onMouseLeave={() => !open && setIsHovering(false)}
    >
      <SidebarHeader className="border-b border-sidebar-border p-4 bg-gradient-to-b from-sidebar-accent/30 to-transparent">
        <NavLink
          to="/consultant/dashboard"
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
            <img
              src={iconMark}
              alt="HRM8"
              className="h-8 w-8 opacity-100"
            />
          )}
        </NavLink>
        {isExpanded && user && (
          <p className="text-xs text-muted-foreground mt-2 px-2">
            {user.firstName} {user.lastName}
          </p>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <SidebarMenuItem key={item.path}>
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
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3 bg-gradient-to-t from-sidebar-accent/30 to-transparent">
        {/* Portal Switcher for 360 Consultants */}
        {user?.role === 'CONSULTANT_360' && (
          <SidebarGroup className="p-0 mb-2">
            <SidebarMenuButton
              asChild
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white justify-center shadow-md transition-all duration-200"
            >
              <NavLink to="/sales-agent/dashboard" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                {isExpanded && <span>Switch to Sales</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarGroup>
        )}
        <ConsultantSidebarFooter />
      </SidebarFooter>
    </Sidebar>
  );
}

































