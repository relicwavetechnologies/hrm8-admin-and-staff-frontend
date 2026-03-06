import type { DashboardLayout } from './types';

// This is kept for backward compatibility - now it's just an alias
export const DEFAULT_DASHBOARD_LAYOUT: DashboardLayout = {
  id: 'jobs',
  name: 'Jobs Dashboard',
  dashboardType: 'jobs',
  widgets: [
    {
      id: 'stat-1',
      type: 'stat',
      component: 'EnhancedStatCard',
      title: 'Active Jobs',
      gridArea: { x: 0, y: 0, w: 3, h: 1 },
      props: {
        title: "Active Jobs",
        value: "24",
        change: "+12%",
        trend: "up",
        variant: "neutral",
        showMenu: true
      },
      isVisible: true
    },
    {
      id: 'stat-2',
      type: 'stat',
      component: 'EnhancedStatCard',
      title: 'Total Candidates',
      gridArea: { x: 3, y: 0, w: 3, h: 1 },
      props: {
        title: "Total Candidates",
        value: "1,234",
        change: "+8%",
        trend: "up",
        variant: "success",
        showMenu: true
      },
      isVisible: true
    },
    {
      id: 'stat-3',
      type: 'stat',
      component: 'EnhancedStatCard',
      title: 'Applications',
      gridArea: { x: 6, y: 0, w: 3, h: 1 },
      props: {
        title: "Applications",
        value: "567",
        change: "+23%",
        trend: "up",
        variant: "primary",
        showMenu: true
      },
      isVisible: true
    },
    {
      id: 'stat-4',
      type: 'stat',
      component: 'EnhancedStatCard',
      title: 'Hired This Month',
      gridArea: { x: 9, y: 0, w: 3, h: 1 },
      props: {
        title: "Hired This Month",
        value: "18",
        change: "+5%",
        trend: "up",
        variant: "warning",
        showMenu: true
      },
      isVisible: true
    },
    {
      id: 'chart-1',
      type: 'chart',
      component: 'HiringTrendsChart',
      title: 'Hiring Trends',
      gridArea: { x: 0, y: 1, w: 6, h: 2 },
      props: {},
      isVisible: true
    },
    {
      id: 'chart-2',
      type: 'chart',
      component: 'ApplicationFunnelChart',
      title: 'Application Funnel',
      gridArea: { x: 6, y: 1, w: 6, h: 2 },
      props: {},
      isVisible: true
    },
    {
      id: 'chart-3',
      type: 'chart',
      component: 'JobDistributionChart',
      title: 'Job Distribution',
      gridArea: { x: 0, y: 3, w: 6, h: 2 },
      props: {},
      isVisible: true
    },
    {
      id: 'chart-4',
      type: 'chart',
      component: 'SourceOfHireChart',
      title: 'Source of Hire',
      gridArea: { x: 6, y: 3, w: 6, h: 2 },
      props: {},
      isVisible: true
    },
    {
      id: 'activity-1',
      type: 'activity',
      component: 'RecentActivityCard',
      title: 'Recent Activity',
      gridArea: { x: 0, y: 5, w: 12, h: 2 },
      props: {},
      isVisible: true,
      isLocked: true
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
};
