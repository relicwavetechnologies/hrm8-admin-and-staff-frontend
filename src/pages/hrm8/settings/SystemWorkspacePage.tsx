
import { Outlet } from 'react-router-dom';
import { Settings, BarChart3, Mail, ShieldAlert, Cpu, Package } from 'lucide-react';
import { NestedSidebarLayout, type NestedSidebarItem } from '@/shared/components/layouts/NestedSidebarLayout';

const settingsNavItems: NestedSidebarItem[] = [
    {
        id: 'settings-overview',
        label: 'Overview',
        path: '/hrm8/settings/overview',
        icon: BarChart3,
    },
    {
        id: 'settings-general',
        label: 'General',
        path: '/hrm8/settings/general',
        icon: Settings,
    },
    {
        id: 'settings-integrations',
        label: 'Integrations',
        path: '/hrm8/settings/integrations',
        icon: Cpu,
    },
    {
        id: 'settings-email-templates',
        label: 'Email Templates',
        path: '/hrm8/settings/email-templates',
        icon: Mail,
    },
    {
        id: 'settings-audit-logs',
        label: 'Audit Logs',
        path: '/hrm8/settings/audit-logs',
        icon: ShieldAlert,
    },
    {
        id: 'settings-xobin',
        label: 'Xobin Packages',
        path: '/hrm8/settings/xobin',
        icon: Package,
    },
];

export default function SystemWorkspacePage() {
    return (
        <NestedSidebarLayout
            title="System Settings"
            subtitle="Manage platform configuration and controls"
            backPath="/hrm8/dashboard"
            backLabel="Back to Dashboard"
            items={settingsNavItems}
        >
            <div className="p-2 lg:p-3">
                <Outlet />
            </div>
        </NestedSidebarLayout>
    );
}
