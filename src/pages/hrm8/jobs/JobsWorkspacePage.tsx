import { Outlet } from 'react-router-dom';
import { Briefcase, Building2, LayoutDashboard, UserCheck } from 'lucide-react';
import { NestedSidebarLayout, type NestedSidebarItem } from '@/shared/components/layouts/NestedSidebarLayout';

const jobsNavItems: NestedSidebarItem[] = [
  {
    id: 'jobs-overview',
    label: 'Overview',
    path: '/hrm8/jobs/overview',
    icon: LayoutDashboard,
  },
  {
    id: 'jobs-companies',
    label: 'Companies',
    path: '/hrm8/jobs/companies',
    icon: Building2,
  },
  {
    id: 'jobs-allocation',
    label: 'Job Allocation',
    path: '/hrm8/jobs/allocation',
    icon: Briefcase,
  },
  {
    id: 'jobs-consultant-requests',
    label: 'Consultant Assignment Requests',
    path: '/hrm8/jobs/consultant-assignment-requests',
    icon: UserCheck,
  },
];

export default function JobsWorkspacePage() {
  return (
    <NestedSidebarLayout
      title="Jobs"
      subtitle="Track demand, company activity, and allocation health"
      backPath="/hrm8/dashboard"
      backLabel="Back to Dashboard"
      items={jobsNavItems}
    >
      <div className="p-2 lg:p-3">
        <Outlet />
      </div>
    </NestedSidebarLayout>
  );
}
