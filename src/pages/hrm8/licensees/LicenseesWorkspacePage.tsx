import { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { LayoutDashboard, Users } from 'lucide-react';
import { NestedSidebarLayout, type NestedSidebarItem } from '@/shared/components/layouts/NestedSidebarLayout';
import { useRegionStore } from '@/shared/stores/useRegionStore';
import { isAllRegionsSelected } from '@/shared/lib/regionScope';

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
  const { selectedRegionId } = useRegionStore();
  const items = useMemo(
    () =>
      licenseesNavItems.filter((item) =>
        item.id === 'licensees-overview' ? isAllRegionsSelected(selectedRegionId) : true,
      ),
    [selectedRegionId],
  );

  return (
    <NestedSidebarLayout
      title="Licensees"
      subtitle="Track partner performance and regional ownership"
      backPath="/hrm8/dashboard"
      backLabel="Back to Dashboard"
      items={items}
    >
      <div className="p-2 lg:p-3">
        <Outlet />
      </div>
    </NestedSidebarLayout>
  );
}
