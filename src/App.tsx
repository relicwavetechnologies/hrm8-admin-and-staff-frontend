import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/shared/components/ui/toaster'
import { Toaster as Sonner } from '@/shared/components/ui/sonner'
import { RoleGuard } from '@/shared/components/auth/RoleGuard'
import { Outlet } from 'react-router-dom'
import { UnifiedDashboardLayout } from '@/shared/layouts/UnifiedDashboardLayout'
import { useAuthStore } from '@/shared/stores/authStore'
import { useRegionStore } from '@/shared/stores/useRegionStore'
import { isAllRegionsSelected } from '@/shared/lib/regionScope'
import { lazy, Suspense, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

/**
 * Dashboard Wrapper to provide the unified layout to role-protected routes
 */
function DashboardWrapper() {
    return (
        <UnifiedDashboardLayout>
            <Outlet />
        </UnifiedDashboardLayout>
    );
}

function AllRegionsWorkspaceRedirect({ overviewPath, listPath }: { overviewPath: string; listPath: string }) {
    const { selectedRegionId } = useRegionStore();

    return <Navigate to={isAllRegionsSelected(selectedRegionId) ? overviewPath : listPath} replace />;
}

const PageLoader = () => (
    <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
);

const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const ConsultantSetupAccountPage = lazy(() => import('./pages/consultant/ConsultantSetupAccountPage'));
const CurrencySetupPage = lazy(() => import('./pages/auth/CurrencySetupPage'));
const Hrm8Overview = lazy(() => import('./pages/hrm8/Hrm8Overview'));
const AnalyticsDashboard = lazy(() => import('./pages/hrm8/AnalyticsDashboard'));
const RevenueDashboardPage = lazy(() => import('./pages/hrm8/RevenueDashboardPage'));
const CommissionsPage = lazy(() => import('./pages/hrm8/CommissionsPage'));
const LicenseesPage = lazy(() => import('./pages/hrm8/LicenseesPage'));
const LicenseesWorkspacePage = lazy(() => import('./pages/hrm8/licensees/LicenseesWorkspacePage'));
const LicenseesOverviewPage = lazy(() => import('./pages/hrm8/licensees/LicenseesOverviewPage'));
const ConsultantDashboard = lazy(() => import('./pages/consultant/ConsultantDashboard'));
const RegionalCompaniesPage = lazy(() => import('./pages/hrm8/RegionalCompaniesPage'));
const Hrm8CompanyDetailPage = lazy(() => import('./pages/hrm8/Hrm8CompanyDetailPage'));
const JobAllocationPage = lazy(() => import('./pages/hrm8/JobAllocationPage'));
const ConsultantAssignmentRequestsPage = lazy(() => import('./pages/hrm8/ConsultantAssignmentRequestsPage'));
const SalesDashboardPage = lazy(() => import('./pages/sales/SalesDashboardPage'));
const Consultant360Dashboard = lazy(() => import('./pages/consultant360/Consultant360Dashboard'));
const Consultant360EarningsPage = lazy(() => import('./pages/consultant360/Consultant360EarningsPage'));
const ConsultantJobsPage = lazy(() => import('./pages/consultant/ConsultantJobsPage'));
const OpportunitiesPage = lazy(() => import('./pages/sales/OpportunitiesPage'));
const SalesPipelinePage = lazy(() => import('./pages/sales/SalesPipelinePage'));
const ConsultantProfilePage = lazy(() => import('./pages/consultant/ConsultantProfilePage'));
const ConsultantJobDetailPage = lazy(() => import('./pages/consultant/ConsultantJobDetailPage'));
const ConsultantJobSimpleSetupPage = lazy(() => import('./pages/consultant/ConsultantJobSimpleSetupPage'));
const ExecutiveSearchWorkspacePage = lazy(() => import('./pages/consultant/ExecutiveSearchWorkspacePage'));
const ConsultantCommissionsPage = lazy(() => import('./pages/consultant/ConsultantCommissionsPage'));
const ConsultantSettingsPage = lazy(() => import('./pages/consultant360/ConsultantSettingsPage'));
const ConsultantHelpPage = lazy(() => import('./pages/consultant360/ConsultantHelpPage'));
const ConsultantMessagesPage = lazy(() => import('./pages/consultant/ConsultantMessagesPage'));
const ConsultantNotificationsPage = lazy(() => import('./pages/consultant/NotificationsPage'));
const SalesAgentNotificationsPage = lazy(() => import('./pages/sales/NotificationsPage'));
const Consultant360NotificationsPage = lazy(() => import('./pages/consultant360/NotificationsPage'));
const ClientCompaniesPage = lazy(() => import('./pages/sales/ClientCompaniesPage'));
const SalesCommissionsPage = lazy(() => import('./pages/sales/CommissionsPage'));
const WithdrawalsPage = lazy(() => import('./pages/admin/WithdrawalsPage'));
const RefundRequestsPage = lazy(() => import('./pages/hrm8/RefundRequestsPage'));
const ConversionRequestsPage = lazy(() => import('./pages/hrm8/ConversionRequestsPage'));
const SettlementsPage = lazy(() => import('./pages/hrm8/SettlementsPage'));
const CareersRequestsPage = lazy(() => import('./pages/hrm8/CareersRequestsPage'));
const AdminEmailTemplatesPage = lazy(() => import('./pages/admin/AdminEmailTemplatesPage'));
const StaffPage = lazy(() => import('./pages/hrm8/StaffPage'));
const StaffOverviewPage = lazy(() => import('./pages/hrm8/staff/StaffOverviewPage'));
const StaffWorkspacePage = lazy(() => import('./pages/hrm8/staff/StaffWorkspacePage'));
const StaffSettlementsPage = lazy(() => import('./pages/hrm8/staff/StaffSettlementsPage'));
const StaffSettingsPage = lazy(() => import('./pages/hrm8/staff/StaffSettingsPage'));
const JobsWorkspacePage = lazy(() => import('./pages/hrm8/jobs/JobsWorkspacePage'));
const JobsOverviewPage = lazy(() => import('./pages/hrm8/jobs/JobsOverviewPage'));
const Hrm8ConsultantDetailPage = lazy(() => import('./pages/hrm8/Hrm8ConsultantDetailPage'));
const UnassignedJobsPage = lazy(() => import('./pages/hrm8/UnassignedJobsPage'));
const Hrm8JobBoardPage = lazy(() => import('./pages/hrm8/Hrm8JobBoardPage'));
const Hrm8CompanyJobsPage = lazy(() => import('./pages/hrm8/Hrm8CompanyJobsPage'));
const Hrm8JobDetailPage = lazy(() => import('./pages/hrm8/Hrm8JobDetailPage'));
const AuditLogsPage = lazy(() => import('./pages/hrm8/AuditLogsPage'));
const RegionsPage = lazy(() => import('./pages/hrm8/RegionsPage'));
const RegionsWorkspacePage = lazy(() => import('./pages/hrm8/regions/RegionsWorkspacePage'));
const RegionsOverviewPage = lazy(() => import('./pages/hrm8/regions/RegionsOverviewPage'));
const RegionalLeadsPage = lazy(() => import('./pages/hrm8/RegionalLeadsPage'));
const ReportsPage = lazy(() => import('./pages/hrm8/ReportsPage'));
const Hrm8SettingsPage = lazy(() => import('./pages/hrm8/Hrm8SettingsPage'));
const Hrm8IntegrationsPage = lazy(() => import('./pages/hrm8/Hrm8IntegrationsPage'));
const SystemWorkspacePage = lazy(() => import('./pages/hrm8/settings/SystemWorkspacePage'));
const SystemOverviewPage = lazy(() => import('./pages/hrm8/settings/SystemOverviewPage'));
const Hrm8ProfilePage = lazy(() => import('./pages/hrm8/Hrm8ProfilePage'));
const UtilsNotificationsPage = lazy(() => import('./pages/hrm8/NotificationsPage'));
const StaffProfilePage = lazy(() => import('./pages/hrm8/StaffProfilePage'));
const AttributionPage = lazy(() => import('./pages/hrm8/AttributionPage'));
const PricingPage = lazy(() => import('./pages/hrm8/PricingPage'));
const BillingPage = lazy(() => import('./pages/hrm8/BillingPage'));
const RegionalSalesDashboard = lazy(() => import('./pages/hrm8/RegionalSalesDashboard'));
const RevenuePage = lazy(() => import('./pages/hrm8/RevenuePage'));
const ConsultantOverview = lazy(() => import('./pages/consultant/ConsultantOverview'));
const ConsultantWalletPage = lazy(() => import('./pages/consultant/ConsultantWalletPage'));
const SalesOpportunityDetailPage = lazy(() => import('./pages/sales/SalesOpportunityDetailPage'));
const SalesOpportunityNewPage = lazy(() => import('./pages/sales/SalesOpportunityNewPage'));
const LeadsWorkspacePage = lazy(() => import('./pages/hrm8/leads/LeadsWorkspacePage'));
const LeadsOverviewPage = lazy(() => import('./pages/hrm8/leads/LeadsOverviewPage'));
const FinanceWorkspacePage = lazy(() => import('./pages/hrm8/finance/FinanceWorkspacePage'));
const FinanceOverviewPage = lazy(() => import('./pages/hrm8/finance/FinanceOverviewPage'));
const FinanceReconciliationPage = lazy(() => import('./pages/hrm8/finance/FinanceReconciliationPage'));
const Hrm8ChatPage = lazy(() => import('./pages/hrm8/Hrm8ChatPage'));
const XobinAdminPage = lazy(() => import('./pages/hrm8/XobinAdminPage'));

function App() {
    const { checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return (
        <>
            <Suspense fallback={<PageLoader />}>
            <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/consultant/setup-account" element={<ConsultantSetupAccountPage />} />
                <Route path="/currency-setup" element={<RoleGuard allowedTypes={['CONSULTANT', 'SALES_AGENT', 'CONSULTANT360']}><CurrencySetupPage /></RoleGuard>} />

                {/* Protected Dashboard Routes */}
                <Route element={<RoleGuard allowedTypes={['ADMIN']}><DashboardWrapper /></RoleGuard>}>
                    {/* HRM8 Admin Portal */}
                    <Route path="/hrm8/dashboard" element={<Hrm8Overview />} />
                    <Route path="/hrm8/analytics" element={<AnalyticsDashboard />} />

                    <Route path="/hrm8/commissions" element={<CommissionsPage />} />
                    <Route path="/hrm8/staff" element={<StaffWorkspacePage />}>
                        <Route index element={<Navigate to="overview" replace />} />
                        <Route path="overview" element={<StaffOverviewPage />} />
                        <Route path="members" element={<StaffPage />} />
                        <Route path="settlements" element={<StaffSettlementsPage />} />
                        <Route path="settings" element={<StaffSettingsPage />} />
                    </Route>
                    <Route path="/hrm8/jobs" element={<JobsWorkspacePage />}>
                        <Route index element={<Navigate to="overview" replace />} />
                        <Route path="overview" element={<JobsOverviewPage />} />
                        <Route path="companies" element={<Hrm8JobBoardPage />} />
                        <Route path="allocation" element={<JobAllocationPage />} />
                        <Route path="consultant-assignment-requests" element={<ConsultantAssignmentRequestsPage />} />
                    </Route>
                    <Route path="/hrm8/consultant-assignment-requests" element={<Navigate to="/hrm8/jobs/consultant-assignment-requests" replace />} />
                    <Route path="/hrm8/staff/:id" element={<StaffProfilePage />} />
                    <Route path="/hrm8/consultants/:id" element={<Hrm8ConsultantDetailPage />} />
                    <Route path="/hrm8/companies" element={<RegionalCompaniesPage />} />
                    <Route path="/hrm8/companies/:companyId" element={<Hrm8CompanyDetailPage />} />
                    <Route path="/hrm8/allocations" element={<Navigate to="/hrm8/jobs/allocation" replace />} />
                    <Route path="/hrm8/jobs/unassigned" element={<UnassignedJobsPage />} />
                    <Route path="/hrm8/job-board" element={<Navigate to="/hrm8/jobs/companies" replace />} />
                    <Route path="/hrm8/job-board/:companyId" element={<Hrm8CompanyJobsPage />} />
                    <Route path="/hrm8/job-board/job/:jobId" element={<Hrm8JobDetailPage />} />
                    <Route path="/hrm8/notifications" element={<UtilsNotificationsPage />} />
                    <Route path="/hrm8/email-templates" element={<AdminEmailTemplatesPage />} />
                    <Route path="/hrm8/leads" element={<LeadsWorkspacePage />}>
                        <Route index element={<Navigate to="overview" replace />} />
                        <Route path="overview" element={<LeadsOverviewPage />} />
                        <Route path="list" element={<RegionalLeadsPage />} />
                        <Route path="conversion" element={<ConversionRequestsPage />} />
                        <Route path="attribution" element={<AttributionPage />} />
                    </Route>
                    <Route path="/hrm8/licensees" element={<LicenseesWorkspacePage />}>
                        <Route index element={<AllRegionsWorkspaceRedirect overviewPath="overview" listPath="list" />} />
                        <Route path="overview" element={<LicenseesOverviewPage />} />
                        <Route path="list" element={<LicenseesPage />} />
                    </Route>
                    <Route path="/hrm8/finance" element={<FinanceWorkspacePage />}>
                        <Route index element={<Navigate to="overview" replace />} />
                        <Route path="overview" element={<FinanceOverviewPage />} />
                        <Route path="revenue" element={<RevenuePage />} />
                        <Route path="revenue-analytics" element={<RevenueDashboardPage />} />
                        <Route path="commissions" element={<CommissionsPage />} />
                        <Route path="withdrawals" element={<WithdrawalsPage />} />
                        <Route path="refunds" element={<RefundRequestsPage />} />
                        <Route path="reconciliation" element={<FinanceReconciliationPage />} />
                        <Route path="settlements" element={<SettlementsPage />} />
                        <Route path="pricing" element={<PricingPage />} />
                    </Route>
                    <Route path="/hrm8/sales-pipeline" element={<SalesPipelinePage />} />
                    <Route path="/hrm8/reports" element={<ReportsPage />} />
                    <Route path="/hrm8/chat" element={<Hrm8ChatPage />} />
                    <Route path="/hrm8/profile" element={<Hrm8ProfilePage />} />
                    <Route path="/hrm8/attribution" element={<Navigate to="/hrm8/leads/attribution" replace />} />
                    <Route path="/hrm8/billing" element={<BillingPage />} />
                    <Route path="/hrm8/regional-sales" element={<RegionalSalesDashboard />} />
                    <Route path="/hrm8/careers-requests" element={<CareersRequestsPage />} />

                </Route>

                {/* HRM8 Admin Routes (All Admins) */}
                <Route element={<RoleGuard allowedTypes={['ADMIN']}><DashboardWrapper /></RoleGuard>}>

                    {/* System Settings Workspace */}
                    <Route path="/hrm8/settings" element={<SystemWorkspacePage />}>
                        <Route index element={<Navigate to="overview" replace />} />
                        <Route path="overview" element={<SystemOverviewPage />} />
                        <Route path="general" element={<Hrm8SettingsPage />} />
                        <Route path="integrations" element={<Hrm8IntegrationsPage />} />
                        <Route path="email-templates" element={<AdminEmailTemplatesPage />} />
                        <Route path="audit-logs" element={<AuditLogsPage />} />
                        <Route path="xobin" element={<XobinAdminPage />} />
                    </Route>

                    {/* Redirects for old routes */}
                    <Route path="/hrm8/system-settings" element={<Navigate to="/hrm8/settings/general" replace />} />
                    <Route path="/hrm8/integrations" element={<Navigate to="/hrm8/settings/integrations" replace />} />
                    <Route path="/hrm8/email-templates" element={<Navigate to="/hrm8/settings/email-templates" replace />} />
                    <Route path="/hrm8/audit-logs" element={<Navigate to="/hrm8/settings/audit-logs" replace />} />

                    <Route path="/hrm8/settlements" element={<SettlementsPage />} />
                    <Route path="/hrm8/regions" element={<RegionsWorkspacePage />}>
                        <Route index element={<AllRegionsWorkspaceRedirect overviewPath="overview" listPath="list" />} />
                        <Route path="overview" element={<RegionsOverviewPage />} />
                        <Route path="list" element={<RegionsPage />} />
                    </Route>
                    <Route path="/hrm8/licensees-list" element={<Navigate to="/hrm8/licensees/list" replace />} />
                </Route>

                <Route element={<RoleGuard allowedTypes={['CONSULTANT']}><DashboardWrapper /></RoleGuard>}>
                    {/* Consultant Portal */}
                    <Route path="/consultant/dashboard" element={<ConsultantDashboard />} />
                    <Route path="/consultant/jobs" element={<ConsultantJobsPage />} />
                    <Route path="/consultant/jobs/:jobId/executive-search" element={<ExecutiveSearchWorkspacePage />} />
                    <Route path="/consultant/jobs/:jobId/setup-simple" element={<ConsultantJobSimpleSetupPage />} />
                    <Route path="/consultant/jobs/:jobId" element={<ConsultantJobDetailPage />} />
                    <Route path="/consultant/messages" element={<ConsultantMessagesPage />} />
                    <Route path="/consultant/notifications" element={<ConsultantNotificationsPage />} />
                    <Route path="/consultant/commissions" element={<ConsultantCommissionsPage />} />
                    <Route path="/consultant/wallet" element={<Consultant360EarningsPage />} />
                    <Route path="/consultant/profile" element={<ConsultantProfilePage />} />
                    <Route path="/consultant/overview" element={<ConsultantOverview />} />
                    <Route path="/consultant/wallet-details" element={<ConsultantWalletPage />} />
                    <Route path="/consultant/settings" element={<ConsultantSettingsPage />} />
                </Route>

                <Route element={<RoleGuard allowedTypes={['SALES_AGENT']}><DashboardWrapper /></RoleGuard>}>
                    {/* Sales Agent Portal */}
                    <Route path="/sales-agent/dashboard" element={<SalesDashboardPage />} />
                    <Route path="/sales-agent/pipeline" element={<SalesPipelinePage />} />
                    <Route path="/sales-agent/leads" element={<OpportunitiesPage />} />

                    {/* Opportunities Routes - Order matters! */}
                    <Route path="/sales/opportunities/new" element={<SalesOpportunityNewPage />} />
                    <Route path="/sales/opportunities/:id" element={<SalesOpportunityDetailPage />} />

                    <Route path="/sales-agent/companies" element={<ClientCompaniesPage />} />
                    <Route path="/sales-agent/notifications" element={<SalesAgentNotificationsPage />} />
                    <Route path="/sales-agent/commissions" element={<SalesCommissionsPage />} />
                    <Route path="/sales-agent/settings" element={<ConsultantSettingsPage />} />
                </Route>

                <Route element={<RoleGuard allowedTypes={['CONSULTANT360']}><DashboardWrapper /></RoleGuard>}>
                    {/* Consultant 360 Portal */}
                    <Route path="/consultant360/dashboard" element={<Consultant360Dashboard />} />
                    <Route path="/consultant360/earnings" element={<Consultant360EarningsPage />} />
                    <Route path="/consultant360/jobs" element={<ConsultantJobsPage />} />
                    <Route path="/consultant360/jobs/:jobId/executive-search" element={<ExecutiveSearchWorkspacePage />} />
                    <Route path="/consultant360/jobs/:jobId/setup-simple" element={<ConsultantJobSimpleSetupPage />} />
                    <Route path="/consultant360/jobs/:jobId" element={<ConsultantJobDetailPage />} />
                    <Route path="/consultant360/leads" element={<OpportunitiesPage />} />
                    <Route path="/consultant360/pipeline" element={<SalesPipelinePage />} />
                    <Route path="/consultant360/messages" element={<ConsultantMessagesPage />} />
                    <Route path="/consultant360/notifications" element={<Consultant360NotificationsPage />} />
                    <Route path="/consultant360/profile" element={<ConsultantProfilePage />} />
                    <Route path="/consultant360/settings" element={<ConsultantSettingsPage />} />
                    <Route path="/consultant360/help" element={<ConsultantHelpPage />} />
                </Route>

                {/* Dev Routes */}

                {/* Redirects */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
            </Suspense>
            <Toaster />
            <Sonner position="top-right" expand={false} richColors />
        </>
    )
}

export default App
