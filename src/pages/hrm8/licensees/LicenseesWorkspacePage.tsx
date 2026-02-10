import { Outlet } from 'react-router-dom';
import { LayoutDashboard, Users } from 'lucide-react';
import { NestedSidebarLayout, type NestedSidebarItem } from '@/shared/components/layouts/NestedSidebarLayout';

const licenseesNavItems: NestedSidebarItem[] = [
  {
    id: 'licensees-overview',
    label: 'Overview',
    path: '/hrm8/licensees/overview',
    icon: LayoutDashboard,
  },
  {
    id: 'licensees-list',
    label: 'Licensee List',
    path: '/hrm8/licensees/list',
    icon: Users,
  },
];

export default function LicenseesWorkspacePage() {
  return (
    <NestedSidebarLayout
      title="Licensees"
      subtitle="Track partner performance and regional ownership"
      backPath="/hrm8/dashboard"
      backLabel="Back to Dashboard"
      items={licenseesNavItems}
    >
      <div className="p-2 lg:p-3">
        <Outlet />
      </div>
    </NestedSidebarLayout>
  );
}
