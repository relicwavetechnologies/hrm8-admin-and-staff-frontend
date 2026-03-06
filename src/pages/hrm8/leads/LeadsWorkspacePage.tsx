import { Outlet } from 'react-router-dom';
import { LayoutDashboard, Target, UserCheck } from 'lucide-react';
import { NestedSidebarLayout, type NestedSidebarItem } from '@/shared/components/layouts/NestedSidebarLayout';

const leadsNavItems: NestedSidebarItem[] = [
    {
        id: 'leads-overview',
        label: 'Overview',
        path: '/hrm8/leads/overview',
        icon: LayoutDashboard,
    },
    {
        id: 'leads-list',
        label: 'All Leads',
        path: '/hrm8/leads/list',
        icon: Target,
    },
    {
        id: 'leads-conversion',
        label: 'Conversion Requests',
        path: '/hrm8/leads/conversion',
        icon: UserCheck,
    },
    {
        id: 'leads-attribution',
        label: 'Attribution',
        path: '/hrm8/leads/attribution',
        icon: UserCheck,
    },
];

export default function LeadsWorkspacePage() {
    return (
        <NestedSidebarLayout
            title="Leads"
            subtitle="Manage sales leads, pipeline, and conversion requests"
            backPath="/hrm8/dashboard"
            backLabel="Back to Dashboard"
            items={leadsNavItems}
        >
            <div className="p-2 lg:p-3">
                <Outlet />
            </div>
        </NestedSidebarLayout>
    );
}
