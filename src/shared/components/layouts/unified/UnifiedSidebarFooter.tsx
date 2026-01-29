/**
 * Unified Sidebar Footer Component
 * Replaces CandidateSidebarFooter, ConsultantSidebarFooter, and Hrm8SidebarFooter
 */

import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { useSidebar } from "@/shared/components/ui/sidebar";
import { LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/shared/lib/utils";
import type { FooterAction } from "@/shared/types/dashboard";

interface UnifiedSidebarFooterProps {
  actions: FooterAction[];
  showLogout: boolean;
  onLogout: () => void | Promise<void>;
}

export function UnifiedSidebarFooter({
  actions,
  showLogout,
  onLogout,
}: UnifiedSidebarFooterProps) {
  const { open } = useSidebar();

  const handleLogout = async () => {
    await onLogout();
  };

  return (
    <div className={cn("flex gap-2", !open && "flex-col items-center")}>
      {actions.map((action) => (
        <Tooltip key={action.id}>
          <TooltipTrigger asChild>
            {action.onClick ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={action.onClick}
                className={cn(open && "flex-1")}
              >
                <div
                  className={cn(
                    "flex items-center",
                    open && "justify-start gap-2"
                  )}
                >
                  <action.icon className="h-4 w-4" />
                  {open && <span>{action.label}</span>}
                </div>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                asChild
                className={cn(open && "flex-1")}
              >
                <NavLink
                  to={action.path}
                  className={cn(
                    "flex items-center",
                    open && "justify-start gap-2"
                  )}
                >
                  <action.icon className="h-4 w-4" />
                  {open && <span>{action.label}</span>}
                </NavLink>
              </Button>
            )}
          </TooltipTrigger>
          {!open && <TooltipContent side="right">{action.tooltip}</TooltipContent>}
        </Tooltip>
      ))}

      {showLogout && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className={cn(open && "flex-1")}
            >
              <div
                className={cn(
                  "flex items-center",
                  open && "justify-start gap-2"
                )}
              >
                <LogOut className="h-4 w-4" />
                {open && <span>Logout</span>}
              </div>
            </Button>
          </TooltipTrigger>
          {!open && <TooltipContent side="right">Logout</TooltipContent>}
        </Tooltip>
      )}
    </div>
  );
}
