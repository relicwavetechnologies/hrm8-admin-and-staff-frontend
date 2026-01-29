import { useLocation } from 'react-router-dom';
import type { DashboardType } from '@/shared/lib/dashboard/dashboardTypes';

export function useCurrentDashboard(): DashboardType | null {
  const location = useLocation();
  const path = location.pathname;

  // Map route patterns to dashboard types
  if (path.startsWith('/dashboard/overview')) return 'overview';
  if (path.startsWith('/dashboard/jobs')) return 'jobs';
  if (path.startsWith('/dashboard/hrms')) return 'hrms';
  if (path.startsWith('/dashboard/financial')) return 'financial';
  if (path.startsWith('/dashboard/consulting')) return 'consulting';
  if (path.startsWith('/dashboard/recruitment-services')) return 'recruitment-services';
  if (path.startsWith('/dashboard/employers')) return 'employers';
  if (path.startsWith('/dashboard/candidates')) return 'candidates';
  if (path.startsWith('/dashboard/sales')) return 'sales';
  if (path.startsWith('/dashboard/rpo')) return 'rpo';
  if (path.startsWith('/dashboard/addons')) return 'addons';

  return null;
}
