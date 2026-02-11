import { Outlet } from 'react-router-dom';
import { LayoutDashboard, MapPin } from 'lucide-react';
import { NestedSidebarLayout, type NestedSidebarItem } from '@/shared/components/layouts/NestedSidebarLayout';

const regionsNavItems: NestedSidebarItem[] = [
  {
    id: 'regions-overview',
    label: 'Overview',
    path: '/hrm8/regions/overview',
    icon: LayoutDashboard,
  },
  {
    id: 'regions-list',
    label: 'All Regions',
    path: '/hrm8/regions/list',
    icon: MapPin,
  },
];

export default function RegionsWorkspacePage() {
  return (
    <NestedSidebarLayout
      title="Regions"
      subtitle="Track regional ownership, capacity, and revenue performance"
      backPath="/hrm8/dashboard"
      backLabel="Back to Dashboard"
      items={regionsNavItems}
    >
      <div className="p-2 lg:p-3">
        <Outlet />
      </div>
    </NestedSidebarLayout>
  );
}
