import { DASHBOARD_METADATA } from "@/shared/lib/dashboard/dashboardTypes";
import type { DashboardType } from "@/shared/lib/dashboard/dashboardTypes";
import { Button } from "@/shared/components/ui/button";
import { useNavigate } from "react-router-dom";

interface DashboardSelectorProps {
  currentDashboard: DashboardType;
}

export function DashboardSelector({ currentDashboard }: DashboardSelectorProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
      {Object.values(DASHBOARD_METADATA).map((dashboard) => {
        const Icon = dashboard.icon;
        const isActive = currentDashboard === dashboard.id;

        return (
          <Button
            key={dashboard.id}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => navigate(dashboard.defaultRoute)}
            className="flex-shrink-0"
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">{dashboard.name}</span>
          </Button>
        );
      })}
    </div>
  );
}
