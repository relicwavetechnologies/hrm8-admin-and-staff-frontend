/**
 * Nested Routes Configuration
 * Centralized configuration for workspace nested navigation (Jobs, Staff, etc.)
 */

import { LayoutDashboard, Target, Users, Briefcase, DollarSign, TrendingUp, BarChart3, UserCheck, ArrowDownToLine, RotateCcw, HandCoins, BookOpen, Settings, Building2, FileText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NestedRoute {
    id: string;
    label: string;
    path: string;
    icon: LucideIcon;
    parentPath?: string;
    roles?: string[]; // Optional role filtering
}

/**
 * Jobs workspace nested routes
 */
export const jobsNestedRoutes: NestedRoute[] = [
    {
        id: 'jobs-overview',
        label: 'Jobs Overview',
        path: '/hrm8/jobs/overview',
        icon: LayoutDashboard,
        parentPath: '/hrm8/jobs',
    },
    {
        id: 'jobs-companies',
        label: 'Job Companies',
        path: '/hrm8/jobs/companies',
        icon: Building2,
        parentPath: '/hrm8/jobs',
    },
    {
        id: 'jobs-allocation',
        label: 'Job Allocation',
        path: '/hrm8/jobs/allocation',
        icon: Briefcase,
        parentPath: '/hrm8/jobs',
    },
];

/**
 * Staff workspace nested routes
 */
export const staffNestedRoutes: NestedRoute[] = [
    {
        id: 'staff-overview',
        label: 'Staff Overview',
        path: '/hrm8/staff/overview',
        icon: LayoutDashboard,
        parentPath: '/hrm8/staff',
    },
    {
        id: 'staff-members',
        label: 'Staff Members',
        path: '/hrm8/staff/members',
        icon: Users,
        parentPath: '/hrm8/staff',
    },
    {
        id: 'staff-settlements',
        label: 'Staff Settlements',
        path: '/hrm8/staff/settlements',
        icon: HandCoins,
        parentPath: '/hrm8/staff',
    },
    {
        id: 'staff-settings',
        label: 'Staff Settings',
        path: '/hrm8/staff/settings',
        icon: Settings,
        parentPath: '/hrm8/staff',
    },
];

/**
 * Leads workspace nested routes
 */
export const leadsNestedRoutes: NestedRoute[] = [
    {
        id: 'leads-overview',
        label: 'Overview',
        path: '/hrm8/leads/overview',
        icon: LayoutDashboard,
        parentPath: '/hrm8/leads',
    },
    {
        id: 'leads-list',
        label: 'All Leads',
        path: '/hrm8/leads/list',
        icon: Target,
        parentPath: '/hrm8/leads',
    },
    {
        id: 'leads-conversion',
        label: 'Conversion Requests',
        path: '/hrm8/leads/conversion',
        icon: UserCheck,
        parentPath: '/hrm8/leads',
    },
    {
        id: 'leads-attribution',
        label: 'Attribution',
        path: '/hrm8/leads/attribution',
        icon: UserCheck,
        parentPath: '/hrm8/leads',
    },
];

/**
 * Licensees workspace nested routes
 */
export const licenseesNestedRoutes: NestedRoute[] = [
    {
        id: 'licensees-overview',
        label: 'Licensees Overview',
        path: '/hrm8/licensees/overview',
        icon: LayoutDashboard,
        parentPath: '/hrm8/licensees',
    },
    {
        id: 'licensees-list',
        label: 'Licensee List',
        path: '/hrm8/licensees/list',
        icon: Users,
        parentPath: '/hrm8/licensees',
    },
];

/**
 * Finance workspace nested routes
 */
export const financeNestedRoutes: NestedRoute[] = [
    {
        id: 'finance-overview',
        label: 'Overview',
        path: '/hrm8/finance/overview',
        icon: LayoutDashboard,
        parentPath: '/hrm8/finance',
    },
    {
        id: 'finance-revenue',
        label: 'Revenue',
        path: '/hrm8/finance/revenue',
        icon: TrendingUp,
        parentPath: '/hrm8/finance',
    },
    {
        id: 'finance-revenue-analytics',
        label: 'Revenue Analytics',
        path: '/hrm8/finance/revenue-analytics',
        icon: BarChart3,
        parentPath: '/hrm8/finance',
    },
    {
        id: 'finance-commissions',
        label: 'Commissions',
        path: '/hrm8/finance/commissions',
        icon: DollarSign,
        parentPath: '/hrm8/finance',
    },
    {
        id: 'finance-withdrawals',
        label: 'Withdrawals',
        path: '/hrm8/finance/withdrawals',
        icon: ArrowDownToLine,
        parentPath: '/hrm8/finance',
    },
    {
        id: 'finance-refunds',
        label: 'Refund Requests',
        path: '/hrm8/finance/refunds',
        icon: RotateCcw,
        parentPath: '/hrm8/finance',
    },
    {
        id: 'finance-settlements',
        label: 'Settlements',
        path: '/hrm8/finance/settlements',
        icon: HandCoins,
        parentPath: '/hrm8/finance',
    },
    {
        id: 'finance-pricing',
        label: 'Pricing',
        path: '/hrm8/finance/pricing',
        icon: BookOpen,
        parentPath: '/hrm8/finance',
    },
];

/**
 * System Settings workspace nested routes
 */
export const settingsNestedRoutes: NestedRoute[] = [
    {
        id: 'settings-overview',
        label: 'Settings Overview',
        path: '/hrm8/settings/overview',
        icon: LayoutDashboard,
        parentPath: '/hrm8/settings',
    },
    {
        id: 'settings-general',
        label: 'General Settings',
        path: '/hrm8/settings/general',
        icon: Settings,
        parentPath: '/hrm8/settings',
    },
    {
        id: 'settings-integrations',
        label: 'Integrations',
        path: '/hrm8/settings/integrations',
        icon: Building2,
        parentPath: '/hrm8/settings',
    },
    {
        id: 'settings-email-templates',
        label: 'Email Templates',
        path: '/hrm8/settings/email-templates',
        icon: BookOpen,
        parentPath: '/hrm8/settings',
    },
    {
        id: 'settings-audit-logs',
        label: 'Audit Logs',
        path: '/hrm8/settings/audit-logs',
        icon: FileText,
        parentPath: '/hrm8/settings',
    },
];

/**
 * Get nested routes for the workspace type
 */
export function getNestedRoutes(userType: 'ADMIN' | 'CONSULTANT' | 'SALES_AGENT' | 'CONSULTANT360' | 'CANDIDATE'): NestedRoute[] {
    if (userType === 'ADMIN') {
        return [...jobsNestedRoutes, ...staffNestedRoutes, ...leadsNestedRoutes, ...licenseesNestedRoutes, ...financeNestedRoutes, ...settingsNestedRoutes];
    }
    return [];
}
