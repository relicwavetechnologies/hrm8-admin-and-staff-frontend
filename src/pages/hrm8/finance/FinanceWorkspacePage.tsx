import { Outlet } from 'react-router-dom';
import { NestedSidebarLayout } from '../../../shared/components/layouts/NestedSidebarLayout';
import { financeNestedRoutes } from '../../../shared/config/nestedRoutes';

const financeNavItems = financeNestedRoutes.map(route => ({
    id: route.id,
    label: route.label,
    path: route.path,
    icon: route.icon,
}));

export default function FinanceWorkspacePage() {
    return (
        <NestedSidebarLayout
            title="Revenue & Finance"
            subtitle="Manage all financial operations and revenue streams"
            backPath="/hrm8/dashboard"
            backLabel="Back to Dashboard"
            items={financeNavItems}
        >
            <div className="p-2 lg:p-3">
                <Outlet />
            </div>
        </NestedSidebarLayout>
    );
}
