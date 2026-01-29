import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/shared/components/ui/toaster'
import { Toaster as Sonner } from '@/shared/components/ui/sonner'
import LoginPage from './pages/auth/LoginPage'
import DynamicDashboard from '@/shared/components/auth/DynamicDashboard'

import Hrm8Overview from './pages/hrm8/Hrm8Overview'
import AnalyticsDashboard from './pages/hrm8/AnalyticsDashboard'
import { RevenueDashboardPage } from './pages/hrm8/RevenueDashboardPage'
import CommissionsPage from './pages/hrm8/CommissionsPage'
import LicenseesPage from './pages/hrm8/LicenseesPage'
import RegionalLeadsPage from './pages/hrm8/RegionalLeadsPage'
import ConsultantDashboard from './pages/consultant/ConsultantDashboard'
import RegionalCompaniesPage from './pages/hrm8/RegionalCompaniesPage'
import JobAllocationPage from './pages/hrm8/JobAllocationPage'

function App() {
    return (
        <>
            <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />} />

                {/* Protected Dashboard Routes */}
                <Route element={<DynamicDashboard />}>
                    <Route path="/hrm8/dashboard" element={<Hrm8Overview />} />
                    <Route path="/hrm8/analytics" element={<AnalyticsDashboard />} />
                    <Route path="/hrm8/revenue" element={<RevenueDashboardPage />} />
                    <Route path="/hrm8/commissions" element={<CommissionsPage />} />
                    <Route path="/hrm8/licensees" element={<LicenseesPage />} />
                    <Route path="/hrm8/staff" element={<RegionalLeadsPage />} />
                    <Route path="/consultant/dashboard" element={<ConsultantDashboard />} />
                    <Route path="/hrm8/companies" element={<RegionalCompaniesPage />} />
                    <Route path="/hrm8/allocations" element={<JobAllocationPage />} />
                    <Route path="/sales-agent/dashboard" element={<div>Sales Agent Dashboard</div>} />
                    <Route path="/consultant360/dashboard" element={<div>Consultant 360 Dashboard</div>} />
                </Route>

                {/* Redirects */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
            <Toaster />
            <Sonner position="top-right" expand={false} richColors />
        </>
    )
}

export default App
