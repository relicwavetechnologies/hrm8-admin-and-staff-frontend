import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/shared/components/ui/toaster'
import { Toaster as Sonner } from '@/shared/components/ui/sonner'
import { CurrencyFormatProvider } from '@/contexts/CurrencyFormatContext'
import LoginPage from './pages/auth/LoginPage'
import DynamicDashboard from '@/shared/components/auth/DynamicDashboard'

import Hrm8Overview from './pages/hrm8/Hrm8Overview'
import AnalyticsDashboard from './pages/hrm8/AnalyticsDashboard'
import RevenueDashboardPage from './pages/hrm8/RevenueDashboardPage'
import CommissionsPage from './pages/hrm8/CommissionsPage'
import LicenseesPage from './pages/hrm8/LicenseesPage'
import ConsultantDashboard from './pages/consultant/ConsultantDashboard'
import RegionalCompaniesPage from './pages/hrm8/RegionalCompaniesPage'
import JobAllocationPage from './pages/hrm8/JobAllocationPage'
import SalesDashboardPage from './pages/sales/SalesDashboardPage'
import Consultant360Dashboard from './pages/consultant360/Consultant360Dashboard'
import Consultant360EarningsPage from './pages/consultant360/Consultant360EarningsPage'
import ConsultantJobsPage from './pages/consultant/ConsultantJobsPage'
import OpportunitiesPage from './pages/sales/OpportunitiesPage'
import SalesPipelinePage from './pages/sales/SalesPipelinePage'
import ConsultantProfilePage from './pages/consultant/ConsultantProfilePage'
import ConsultantJobDetailPage from './pages/consultant/ConsultantJobDetailPage'
import ConsultantCommissionsPage from './pages/consultant/ConsultantCommissionsPage'
import ConsultantSettingsPage from './pages/consultant360/ConsultantSettingsPage'
import ConsultantHelpPage from './pages/consultant360/ConsultantHelpPage'
import ConsultantMessagesPage from './pages/consultant/ConsultantMessagesPage'
import ClientCompaniesPage from './pages/sales/ClientCompaniesPage'
import SalesCommissionsPage from './pages/sales/CommissionsPage'
import WithdrawalsPage from './pages/admin/WithdrawalsPage'
import RefundRequestsPage from './pages/hrm8/RefundRequestsPage'
import ConversionRequestsPage from './pages/hrm8/ConversionRequestsPage'
import SettlementsPage from './pages/hrm8/SettlementsPage'
import CareersRequestsPage from './pages/hrm8/CareersRequestsPage'
import AdminEmailTemplatesPage from './pages/admin/AdminEmailTemplatesPage'
import StaffPage from './pages/hrm8/StaffPage'
import Hrm8ConsultantDetailPage from './pages/hrm8/Hrm8ConsultantDetailPage'
import UnassignedJobsPage from './pages/hrm8/UnassignedJobsPage'
import Hrm8JobBoardPage from './pages/hrm8/Hrm8JobBoardPage'
import Hrm8CompanyJobsPage from './pages/hrm8/Hrm8CompanyJobsPage'
import Hrm8JobDetailPage from './pages/hrm8/Hrm8JobDetailPage'
import AuditLogsPage from './pages/hrm8/AuditLogsPage'
import RegionsPage from './pages/hrm8/RegionsPage'
import RegionalLeadsPage from './pages/hrm8/RegionalLeadsPage'
import ReportsPage from './pages/hrm8/ReportsPage'
import Hrm8SettingsPage from './pages/hrm8/Hrm8SettingsPage'
import UtilsNotificationsPage from './pages/hrm8/NotificationsPage'
import AttributionPage from './pages/hrm8/AttributionPage'
import PricingPage from './pages/hrm8/PricingPage'
import RegionalSalesDashboard from './pages/hrm8/RegionalSalesDashboard'
import RevenuePage from './pages/hrm8/RevenuePage'
import ConsultantOverview from './pages/consultant/ConsultantOverview'
import ConsultantWalletPage from './pages/consultant/ConsultantWalletPage'
import SalesOpportunityDetailPage from './pages/sales/SalesOpportunityDetailPage'
import SalesOpportunityNewPage from './pages/sales/SalesOpportunityNewPage'
import StripeMockOnboarding from './pages/dev/StripeMockOnboarding'

function App() {
    return (
        <CurrencyFormatProvider>
            <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />} />

                {/* Protected Dashboard Routes */}
                <Route element={<DynamicDashboard />}>
                    {/* HRM8 Admin Portal */}
                    <Route path="/hrm8/dashboard" element={<Hrm8Overview />} />
                    <Route path="/hrm8/analytics" element={<AnalyticsDashboard />} />

                    <Route path="/hrm8/commissions" element={<CommissionsPage />} />
                    <Route path="/hrm8/licensees" element={<LicenseesPage />} />
                    <Route path="/hrm8/staff" element={<StaffPage />} />
                    <Route path="/hrm8/consultants/:id" element={<Hrm8ConsultantDetailPage />} />
                    <Route path="/hrm8/companies" element={<RegionalCompaniesPage />} />
                    <Route path="/hrm8/allocations" element={<JobAllocationPage />} />
                    <Route path="/hrm8/jobs/unassigned" element={<UnassignedJobsPage />} />
                    <Route path="/hrm8/job-board" element={<Hrm8JobBoardPage />} />
                    <Route path="/hrm8/job-board/:companyId" element={<Hrm8CompanyJobsPage />} />
                    <Route path="/hrm8/job-board/job/:jobId" element={<Hrm8JobDetailPage />} />
                    <Route path="/hrm8/withdrawals" element={<WithdrawalsPage />} />
                    <Route path="/hrm8/billing/refund-requests" element={<RefundRequestsPage />} />
                    <Route path="/hrm8/notifications" element={<UtilsNotificationsPage />} />
                    <Route path="/hrm8/email-templates" element={<AdminEmailTemplatesPage />} />
                    <Route path="/hrm8/regions" element={<RegionsPage />} />
                    <Route path="/hrm8/audit-logs" element={<AuditLogsPage />} />
                    <Route path="/hrm8/leads" element={<RegionalLeadsPage />} />
                    <Route path="/hrm8/reports" element={<ReportsPage />} />
                    <Route path="/hrm8/system-settings" element={<Hrm8SettingsPage />} />
                    <Route path="/hrm8/sales-pipeline" element={<SalesPipelinePage />} />
                    <Route path="/hrm8/settings" element={<Hrm8SettingsPage />} />
                    <Route path="/hrm8/attribution" element={<AttributionPage />} />
                    <Route path="/hrm8/pricing" element={<PricingPage />} />
                    <Route path="/hrm8/regional-sales" element={<RegionalSalesDashboard />} />
                    <Route path="/hrm8/revenue" element={<RevenuePage />} />
                    <Route path="/hrm8/revenue-analytics" element={<RevenueDashboardPage />} />

                    {/* Consultant Portal */}
                    <Route path="/consultant/dashboard" element={<ConsultantDashboard />} />
                    <Route path="/consultant/jobs" element={<ConsultantJobsPage />} />
                    <Route path="/consultant/jobs/:jobId" element={<ConsultantJobDetailPage />} />
                    <Route path="/consultant/messages" element={<ConsultantMessagesPage />} />
                    <Route path="/consultant/commissions" element={<ConsultantCommissionsPage />} />
                    <Route path="/consultant/wallet" element={<Consultant360EarningsPage />} />
                    <Route path="/consultant/profile" element={<ConsultantProfilePage />} />
                    <Route path="/consultant/overview" element={<ConsultantOverview />} />
                    <Route path="/consultant/wallet-details" element={<ConsultantWalletPage />} />
                    <Route path="/consultant/settings" element={<ConsultantSettingsPage />} />

                    {/* Sales Agent Portal */}
                    <Route path="/sales-agent/dashboard" element={<SalesDashboardPage />} />
                    <Route path="/sales-agent/pipeline" element={<SalesPipelinePage />} />
                    <Route path="/sales-agent/leads" element={<OpportunitiesPage />} />
                    
                    {/* Opportunities Routes - Order matters! */}
                    <Route path="/sales/opportunities/new" element={<SalesOpportunityNewPage />} />
                    <Route path="/sales/opportunities/:id" element={<SalesOpportunityDetailPage />} />
                    
                    <Route path="/sales-agent/companies" element={<ClientCompaniesPage />} />
                    <Route path="/sales-agent/commissions" element={<SalesCommissionsPage />} />
                    <Route path="/sales-agent/settings" element={<ConsultantSettingsPage />} />

                    {/* Consultant 360 Portal */}
                    <Route path="/consultant360/dashboard" element={<Consultant360Dashboard />} />
                    <Route path="/consultant360/earnings" element={<Consultant360EarningsPage />} />
                    <Route path="/consultant360/jobs" element={<ConsultantJobsPage />} />
                    <Route path="/consultant360/jobs/:jobId" element={<ConsultantJobDetailPage />} />
                    <Route path="/consultant360/leads" element={<OpportunitiesPage />} />
                    <Route path="/consultant360/pipeline" element={<SalesPipelinePage />} />
                    <Route path="/hrm8/conversion-requests" element={<ConversionRequestsPage />} />
                    <Route path="/hrm8/settlements" element={<SettlementsPage />} />
                    <Route path="/hrm8/careers-requests" element={<CareersRequestsPage />} />
                    <Route path="/consultant360/messages" element={<ConsultantMessagesPage />} />
                    <Route path="/consultant360/profile" element={<ConsultantProfilePage />} />
                    <Route path="/consultant360/settings" element={<ConsultantSettingsPage />} />
                    <Route path="/consultant360/help" element={<ConsultantHelpPage />} />
                </Route>

                {/* Dev Routes */}
                <Route path="/dev/stripe-mock-onboarding" element={<StripeMockOnboarding />} />

                {/* Redirects */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
            <Toaster />
            <Sonner position="top-right" expand={false} richColors />
        </CurrencyFormatProvider>
    )
}

export default App
