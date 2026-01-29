import { Button } from "@/shared/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { useSidebar } from "@/shared/components/ui/sidebar";
import { HelpCircle, LogOut } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/shared/lib/utils";
import { useAuth } from "@/shared/contexts/AuthContext";

export function ConsultantSidebarFooter() {
  const { open } = useSidebar();
  const { logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  // Determine help path based on current portal
  const helpPath = location.pathname.startsWith('/sales-agent')
    ? '/sales-agent/help'
    : '/consultant/help';

  return (
    <div className={cn("flex gap-2", !open && "flex-col items-center")}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            asChild
            className={cn(open && "flex-1")}
          >
            <NavLink
              to={helpPath}
              className={cn("flex items-center", open && "justify-start gap-2")}
            >
              <HelpCircle className="h-4 w-4" />
              {open && <span>Help</span>}
            </NavLink>
          </Button>
        </TooltipTrigger>
        {!open && <TooltipContent side="right">Help</TooltipContent>}
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className={cn(open && "flex-1")}
          >
            <LogOut className="h-4 w-4" />
            {open && <span>Logout</span>}
          </Button>
        </TooltipTrigger>
        {!open && <TooltipContent side="right">Logout</TooltipContent>}
      </Tooltip>
    </div>
  );
}


































