/**
 * Consultant Layout
 * Uses the unified DashboardShell with consultant-specific configuration
 */

import { DashboardShell } from "./unified/DashboardShell";
import { consultantDashboardConfig } from "@/shared/config/dashboardConfigs";
import { useAuthAdapter } from "@/shared/hooks/useAuthAdapter";

export function ConsultantLayout() {
  const auth = useAuthAdapter("consultant");
  return <DashboardShell config={consultantDashboardConfig} auth={auth} />;
}





