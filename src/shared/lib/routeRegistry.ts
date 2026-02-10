/**
 * Route Registry - Dynamically extracts searchable routes from dashboard configs
 * This eliminates the need for manual route registration - any changes to
 * dashboardConfigs.ts automatically reflect in the command palette search.
 */

import { dashboardConfigs } from '@/shared/config/dashboardConfigs';
import { getNestedRoutes, type NestedRoute } from '@/shared/config/nestedRoutes';
import type { MenuItem } from '@/shared/types/dashboard';
import type { LucideIcon } from 'lucide-react';

export interface SearchableRoute {
    id: string;
    title: string;
    description?: string;
    path: string;
    icon: LucideIcon;
    category: 'navigation' | 'settings';
    keywords: string[];
}

/**
 * Get all searchable routes for a specific user
 */
export function getRoutesForUser(
    userType: 'ADMIN' | 'CONSULTANT' | 'SALES_AGENT' | 'CONSULTANT360' | 'CANDIDATE',
    user?: unknown
): SearchableRoute[] {
    // Map user type to config key
    const configKey = userType === 'ADMIN'
        ? 'hrm8'
        : userType === 'SALES_AGENT'
            ? 'sales-agent'
            : userType === 'CONSULTANT360'
                ? 'consultant360'
                : userType.toLowerCase() as keyof typeof dashboardConfigs;

    const config = dashboardConfigs[configKey];
    if (!config) return [];

    const { menuItems, footerActions, filterMenuItems } = config.sidebar;

    // Filter menu items based on user role (e.g., Global Admin vs Regional Licensee)
    const filteredMenuItems = filterMenuItems
        ? filterMenuItems(menuItems ?? [], user)
        : (menuItems ?? []);

    // Convert menu items to searchable routes
    const navigationRoutes = convertMenuItemsToRoutes(filteredMenuItems, 'navigation');
    const settingsRoutes = convertMenuItemsToRoutes(footerActions ?? [], 'settings');

    // Get nested workspace routes (Jobs, Staff sub-pages)
    const nestedRoutes = getNestedRoutes(userType);
    const nestedSearchableRoutes = convertNestedRoutesToSearchable(nestedRoutes);

    return [...navigationRoutes, ...settingsRoutes, ...nestedSearchableRoutes];
}

/**
 * Convert MenuItem array to SearchableRoute array
 */
function convertMenuItemsToRoutes(
    items: MenuItem[],
    category: 'navigation' | 'settings'
): SearchableRoute[] {
    return items.map((item) => ({
        id: item.id,
        title: item.label,
        description: generateDescription(item.label, category),
        path: item.path,
        icon: item.icon,
        category,
        keywords: generateKeywords(item.label, item.path),
    }));
}

/**
 * Convert NestedRoute array to SearchableRoute array
 */
function convertNestedRoutesToSearchable(
    items: NestedRoute[]
): SearchableRoute[] {
    return items.map((item) => ({
        id: item.id,
        title: item.label,
        description: generateDescription(item.label, 'navigation'),
        path: item.path,
        icon: item.icon,
        category: 'navigation' as const,
        keywords: generateKeywords(item.label, item.path),
    }));
}

/**
 * Generate a helpful description for a route
 */
function generateDescription(label: string, category: string): string {
    if (category === 'settings') return 'Settings & configuration';

    const descriptions: Record<string, string> = {
        'Overview': 'Dashboard overview and analytics',
        'Analytics': 'View reports and insights',
        'Dashboard': 'Main dashboard',
        'My Jobs': 'View and manage your jobs',
        'Jobs': 'View and manage job postings',
        'Jobs Overview': 'Overview of all jobs and demand',
        'Job Companies': 'Browse companies and job listings',
        'Job Allocation': 'Manage job allocation to consultants',
        'Staff Overview': 'Team performance overview',
        'Staff Members': 'View and manage staff members',
        'Staff Settlements': 'Handle staff settlements and payouts',
        'Staff Settings': 'Configure staff workspace settings',
        'Licensees Overview': 'Performance and revenue-share snapshot',
        'Licensee List': 'View and manage regional licensees',
        'Messages': 'View your messages',
        'Commissions': 'Track your commissions',
        'Staff': 'Manage staff members',
        'Regions': 'Manage geographical regions',
        'Licensees': 'Manage licensees',
        'Leads': 'Manage sales leads',
        'Pipeline': 'View sales pipeline',
        'Withdrawals': 'Manage withdrawal requests',
        'Refund Requests': 'Handle refund requests',
        'Conversion Requests': 'Review conversion requests',
        'Settlements': 'View and manage settlements',
        'Revenue': 'Track revenue metrics',
        'Revenue Analytics': 'Detailed revenue analysis',
        'Attribution': 'View attribution data',
        'Pricing': 'Manage pricing plans',
        'Billing': 'Billing and invoices',
        'Reports': 'Generate and view reports',
        'Integrations': 'Connect third-party services',
        'Careers Requests': 'Review careers page applications',
        'System Settings': 'Configure system settings',
        'Settings Overview': 'System health and settings summary',
        'General Settings': 'Platform configuration and defaults',
        'Email Templates': 'Manage communication templates',
        'Audit Logs': 'Review system audit activity',
        'Earnings': 'View your earnings',
    };

    return descriptions[label] || `Navigate to ${label}`;
}

/**
 * Generate search keywords from label and path
 */
function generateKeywords(label: string, path: string): string[] {
    const keywords = new Set<string>();

    // Add label words
    label.toLowerCase().split(/\s+/).forEach(word => keywords.add(word));

    // Add path segments
    path.split('/').filter(Boolean).forEach(segment => {
        // Convert kebab-case to individual words
        segment.split('-').forEach(word => keywords.add(word));
    });

    // Add acronyms (e.g., "Revenue Analytics" -> "ra")
    const words = label.toLowerCase().split(/\s+/);
    if (words.length > 1) {
        keywords.add(words.map(w => w[0]).join(''));
    }

    return Array.from(keywords);
}
