import { Outlet } from 'react-router-dom';
import { LayoutDashboard, HandCoins, Settings, Users } from 'lucide-react';
import { NestedSidebarLayout, type NestedSidebarItem } from '@/shared/components/layouts/NestedSidebarLayout';

const staffNavItems: NestedSidebarItem[] = [
  {
    id: 'staff-overview',
    label: 'Overview',
    path: '/hrm8/staff/overview',
    icon: LayoutDashboard,
  },
  {
    id: 'staff-members',
    label: 'Members',
    path: '/hrm8/staff/members',
    icon: Users,
  },
  {
    id: 'staff-settlements',
    label: 'Settlements',
    path: '/hrm8/staff/settlements',
    icon: HandCoins,
  },
  {
    id: 'staff-settings',
    label: 'Settings',
    path: '/hrm8/staff/settings',
    icon: Settings,
  },
];

export default function StaffWorkspacePage() {
  return (
    <NestedSidebarLayout
      title="Staff"
      subtitle="Manage team operations and payout workflows"
      backPath="/hrm8/dashboard"
      backLabel="Back to Dashboard"
      items={staffNavItems}
    >
      <div className="p-2 lg:p-3">
        <Outlet />
      </div>
    </NestedSidebarLayout>
  );
}
