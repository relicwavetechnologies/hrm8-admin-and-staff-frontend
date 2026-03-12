import { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { LayoutDashboard, MapPin } from 'lucide-react';
import { NestedSidebarLayout, type NestedSidebarItem } from '@/shared/components/layouts/NestedSidebarLayout';
import { useRegionStore } from '@/shared/stores/useRegionStore';
import { isAllRegionsSelected } from '@/shared/lib/regionScope';

const regionsNavItems: NestedSidebarItem[] = [
  {
    id: 'regions-overview',
    label: 'Overview',
    path: '/hrm8/regions/overview',
    icon: LayoutDashboard,
  },
  {
    id: 'regions-list',
    label: 'Region List',
    path: '/hrm8/regions/list',
    icon: MapPin,
  },
];

export default function RegionsWorkspacePage() {
  const { selectedRegionId } = useRegionStore();
  const items = useMemo(
    () =>
      regionsNavItems.filter((item) =>
        item.id === 'regions-overview' ? isAllRegionsSelected(selectedRegionId) : true,
      ),
    [selectedRegionId],
  );

  return (
    <NestedSidebarLayout
      title="Regions"
      subtitle="Track regional ownership, capacity, and revenue performance"
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
