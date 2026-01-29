export const SALES_PERMISSIONS = {
  // View permissions
  VIEW_SALES_DASHBOARD: 'sales.dashboard.view',
  VIEW_SALES_TEAM: 'sales.team.view',
  VIEW_OWN_OPPORTUNITIES: 'sales.opportunities.view.own',
  VIEW_ALL_OPPORTUNITIES: 'sales.opportunities.view.all',
  VIEW_SALES_ACTIVITIES: 'sales.activities.view',
  VIEW_SALES_TERRITORIES: 'sales.territories.view',
  VIEW_SALES_COMMISSIONS: 'sales.commissions.view',
  VIEW_SALES_PERFORMANCE: 'sales.performance.view',
  VIEW_SALES_FORECAST: 'sales.forecast.view',
  
  // Manage permissions
  MANAGE_SALES_TEAM: 'sales.team.manage',
  MANAGE_OPPORTUNITIES: 'sales.opportunities.manage',
  MANAGE_SALES_ACTIVITIES: 'sales.activities.manage',
  MANAGE_TERRITORIES: 'sales.territories.manage',
  MANAGE_COMMISSIONS: 'sales.commissions.manage',
  
  // Admin permissions
  MANAGE_SALES_CONFIG: 'sales.config.manage',
  APPROVE_COMMISSIONS: 'sales.commissions.approve',
  MANAGE_SALES_REPORTS: 'sales.reports.manage',
} as const;

export type SalesPermission = typeof SALES_PERMISSIONS[keyof typeof SALES_PERMISSIONS];

export function canViewSalesDashboard(permissions: string[]): boolean {
  return permissions.includes(SALES_PERMISSIONS.VIEW_SALES_DASHBOARD);
}

export function canManageSalesTeam(permissions: string[]): boolean {
  return permissions.includes(SALES_PERMISSIONS.MANAGE_SALES_TEAM);
}

export function canManageOpportunities(permissions: string[]): boolean {
  return permissions.includes(SALES_PERMISSIONS.MANAGE_OPPORTUNITIES);
}

export function canApprovCommissions(permissions: string[]): boolean {
  return permissions.includes(SALES_PERMISSIONS.APPROVE_COMMISSIONS);
}

export function canManageTerritories(permissions: string[]): boolean {
  return permissions.includes(SALES_PERMISSIONS.MANAGE_TERRITORIES);
}
