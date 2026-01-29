import type { DashboardLayout } from './types';
import type { DashboardType } from './dashboardTypes';

export const DEFAULT_OVERVIEW_LAYOUT: DashboardLayout = {
  id: 'overview',
  name: 'Overview Dashboard',
  dashboardType: 'overview',
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
        variant: "primary"
      },
      isVisible: true
    },
    {
      id: 'stat-2',
      type: 'stat',
      component: 'EnhancedStatCard',
      title: 'Total Employees',
      gridArea: { x: 3, y: 0, w: 3, h: 1 },
      props: {
        title: "Total Employees",
        value: "342",
        change: "+6%",
        trend: "up",
        variant: "success"
      },
      isVisible: true
    },
    {
      id: 'stat-3',
      type: 'stat',
      component: 'EnhancedStatCard',
      title: 'Total Revenue',
      gridArea: { x: 6, y: 0, w: 3, h: 1 },
      props: {
        title: "Total Revenue",
        isCurrency: true,
        rawValue: 2400000,
        change: "+18%",
        trend: "up",
        variant: "warning"
      },
      isVisible: true
    },
    {
      id: 'stat-4',
      type: 'stat',
      component: 'EnhancedStatCard',
      title: 'Active Projects',
      gridArea: { x: 9, y: 0, w: 3, h: 1 },
      props: {
        title: "Active Projects",
        value: "32",
        change: "+15%",
        trend: "up",
        variant: "neutral"
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
      component: 'RevenueExpenseChart',
      title: 'Revenue vs Expenses',
      gridArea: { x: 6, y: 1, w: 6, h: 2 },
      props: {},
      isVisible: true
    },
    {
      id: 'chart-3',
      type: 'chart',
      component: 'EmployeeDistributionChart',
      title: 'Employee Distribution',
      gridArea: { x: 0, y: 3, w: 6, h: 2 },
      props: {},
      isVisible: true
    },
    {
      id: 'chart-4',
      type: 'chart',
      component: 'ProjectPipelineChart',
      title: 'Project Pipeline',
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

export const DEFAULT_JOBS_LAYOUT: DashboardLayout = {
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
        variant: "neutral"
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
        variant: "success"
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
        variant: "primary"
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
        variant: "warning"
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

export const DEFAULT_HRMS_LAYOUT: DashboardLayout = {
  id: 'hrms',
  name: 'HRMS Dashboard',
  dashboardType: 'hrms',
  widgets: [
    {
      id: 'stat-1',
      type: 'stat',
      component: 'EnhancedStatCard',
      title: 'Total Employees',
      gridArea: { x: 0, y: 0, w: 3, h: 1 },
      props: {
        title: "Total Employees",
        value: "342",
        change: "+6%",
        trend: "up",
        variant: "success"
      },
      isVisible: true
    },
    {
      id: 'stat-2',
      type: 'stat',
      component: 'EnhancedStatCard',
      title: 'Attendance Rate',
      gridArea: { x: 3, y: 0, w: 3, h: 1 },
      props: {
        title: "Attendance Rate",
        value: "94.2%",
        change: "+2.1%",
        trend: "up",
        variant: "success"
      },
      isVisible: true
    },
    {
      id: 'stat-3',
      type: 'stat',
      component: 'EnhancedStatCard',
      title: 'Leave Requests',
      gridArea: { x: 6, y: 0, w: 3, h: 1 },
      props: {
        title: "Leave Requests",
        value: "23",
        change: "-12%",
        trend: "down",
        variant: "primary"
      },
      isVisible: true
    },
    {
      id: 'stat-4',
      type: 'stat',
      component: 'EnhancedStatCard',
      title: 'Departments',
      gridArea: { x: 9, y: 0, w: 3, h: 1 },
      props: {
        title: "Departments",
        value: "12",
        change: "0%",
        trend: "neutral",
        variant: "neutral"
      },
      isVisible: true
    },
    {
      id: 'chart-1',
      type: 'chart',
      component: 'AttendanceTrendsChart',
      title: 'Attendance Trends',
      gridArea: { x: 0, y: 1, w: 6, h: 2 },
      props: {},
      isVisible: true
    },
    {
      id: 'chart-2',
      type: 'chart',
      component: 'EmployeeDistributionChart',
      title: 'Employee Distribution',
      gridArea: { x: 6, y: 1, w: 6, h: 2 },
      props: {},
      isVisible: true
    },
    {
      id: 'chart-3',
      type: 'chart',
      component: 'LeaveAnalysisChart',
      title: 'Leave Analysis',
      gridArea: { x: 0, y: 3, w: 6, h: 2 },
      props: {},
      isVisible: true
    },
    {
      id: 'chart-4',
      type: 'chart',
      component: 'PerformanceOverviewChart',
      title: 'Performance Overview',
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

export const DEFAULT_FINANCIAL_LAYOUT: DashboardLayout = {
  id: 'financial',
  name: 'Financial Dashboard',
  dashboardType: 'financial',
  widgets: [
    {
      id: 'stat-1',
      type: 'stat',
      component: 'EnhancedStatCard',
      title: 'Total Revenue',
      gridArea: { x: 0, y: 0, w: 3, h: 1 },
      props: {
        title: "Total Revenue",
        isCurrency: true,
        rawValue: 2400000,
        change: "+18%",
        trend: "up",
        variant: "warning"
      },
      isVisible: true
    },
    {
      id: 'stat-2',
      type: 'stat',
      component: 'EnhancedStatCard',
      title: 'Total Expenses',
      gridArea: { x: 3, y: 0, w: 3, h: 1 },
      props: {
        title: "Total Expenses",
        isCurrency: true,
        rawValue: 1800000,
        change: "+5%",
        trend: "up",
        variant: "warning"
      },
      isVisible: true
    },
    {
      id: 'stat-3',
      type: 'stat',
      component: 'EnhancedStatCard',
      title: 'Profit Margin',
      gridArea: { x: 6, y: 0, w: 3, h: 1 },
      props: {
        title: "Profit Margin",
        value: "25%",
        change: "+3%",
        trend: "up",
        variant: "success"
      },
      isVisible: true
    },
    {
      id: 'stat-4',
      type: 'stat',
      component: 'EnhancedStatCard',
      title: 'Payroll Cost',
      gridArea: { x: 9, y: 0, w: 3, h: 1 },
      props: {
        title: "Payroll Cost",
        isCurrency: true,
        rawValue: 890000,
        change: "+2%",
        trend: "up",
        variant: "primary"
      },
      isVisible: true
    },
    {
      id: 'chart-1',
      type: 'chart',
      component: 'RevenueExpenseChart',
      title: 'Revenue vs Expenses',
      gridArea: { x: 0, y: 1, w: 6, h: 2 },
      props: {},
      isVisible: true
    },
    {
      id: 'chart-2',
      type: 'chart',
      component: 'BudgetAnalysisChart',
      title: 'Budget Analysis',
      gridArea: { x: 6, y: 1, w: 6, h: 2 },
      props: {},
      isVisible: true
    },
    {
      id: 'chart-3',
      type: 'chart',
      component: 'CostBreakdownChart',
      title: 'Cost Breakdown',
      gridArea: { x: 0, y: 3, w: 6, h: 2 },
      props: {},
      isVisible: true
    },
    {
      id: 'chart-4',
      type: 'chart',
      component: 'PayrollTrendsChart',
      title: 'Payroll Trends',
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

export const DEFAULT_CONSULTING_LAYOUT: DashboardLayout = {
  id: 'consulting',
  name: 'Consulting Dashboard',
  dashboardType: 'consulting',
  widgets: [
    {
      id: 'stat-1',
      type: 'stat',
      component: 'EnhancedStatCard',
      title: 'Active Projects',
      gridArea: { x: 0, y: 0, w: 3, h: 1 },
      props: {
        title: "Active Projects",
        value: "32",
        change: "+15%",
        trend: "up",
        variant: "neutral"
      },
      isVisible: true
    },
    {
      id: 'stat-2',
      type: 'stat',
      component: 'EnhancedStatCard',
      title: 'Total Clients',
      gridArea: { x: 3, y: 0, w: 3, h: 1 },
      props: {
        title: "Total Clients",
        value: "18",
        change: "+3",
        trend: "up",
        variant: "success"
      },
      isVisible: true
    },
    {
      id: 'stat-3',
      type: 'stat',
      component: 'EnhancedStatCard',
      title: 'Utilization Rate',
      gridArea: { x: 6, y: 0, w: 3, h: 1 },
      props: {
        title: "Utilization Rate",
        value: "78%",
        change: "+5%",
        trend: "up",
        variant: "success"
      },
      isVisible: true
    },
    {
      id: 'stat-4',
      type: 'stat',
      component: 'EnhancedStatCard',
      title: 'Billable Hours',
      gridArea: { x: 9, y: 0, w: 3, h: 1 },
      props: {
        title: "Billable Hours",
        value: "2,840",
        change: "+12%",
        trend: "up",
        variant: "primary"
      },
      isVisible: true
    },
    {
      id: 'chart-1',
      type: 'chart',
      component: 'ProjectPipelineChart',
      title: 'Project Pipeline',
      gridArea: { x: 0, y: 1, w: 6, h: 2 },
      props: {},
      isVisible: true
    },
    {
      id: 'chart-2',
      type: 'chart',
      component: 'ClientDistributionChart',
      title: 'Client Distribution',
      gridArea: { x: 6, y: 1, w: 6, h: 2 },
      props: {},
      isVisible: true
    },
    {
      id: 'chart-3',
      type: 'chart',
      component: 'ResourceAllocationChart',
      title: 'Resource Allocation',
      gridArea: { x: 0, y: 3, w: 6, h: 2 },
      props: {},
      isVisible: true
    },
    {
      id: 'chart-4',
      type: 'chart',
      component: 'RevenueForecastChart',
      title: 'Revenue Forecast',
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

export const DEFAULT_RECRUITMENT_SERVICES_LAYOUT: DashboardLayout = {
  id: 'recruitment-services',
  name: 'Recruitment Services Dashboard',
  dashboardType: 'recruitment-services',
  widgets: [
    {
      id: 'stat-1',
      type: 'stat',
      component: 'EnhancedStatCard',
      title: 'Active Projects',
      gridArea: { x: 0, y: 0, w: 3, h: 1 },
      props: {
        title: "Active Projects",
        value: "28",
        change: "+7",
        trend: "up",
        variant: "primary"
      },
      isVisible: true
    },
    {
      id: 'stat-2',
      type: 'stat',
      component: 'EnhancedStatCard',
      title: 'Shortlisting',
      gridArea: { x: 3, y: 0, w: 3, h: 1 },
      props: {
        title: "Shortlisting",
        value: "12",
        change: "+3",
        trend: "up",
        variant: "success"
      },
      isVisible: true
    },
    {
      id: 'stat-3',
      type: 'stat',
      component: 'EnhancedStatCard',
      title: 'Full-Service',
      gridArea: { x: 6, y: 0, w: 3, h: 1 },
      props: {
        title: "Full-Service",
        value: "8",
        change: "+2",
        trend: "up",
        variant: "primary"
      },
      isVisible: true
    },
    {
      id: 'stat-4',
      type: 'stat',
      component: 'EnhancedStatCard',
      title: 'Executive Search',
      gridArea: { x: 9, y: 0, w: 3, h: 1 },
      props: {
        title: "Executive Search",
        value: "5",
        change: "+1",
        trend: "up",
        variant: "warning"
      },
      isVisible: true
    },
    {
      id: 'chart-1',
      type: 'chart',
      component: 'ServicePipelineChart',
      title: 'Service Pipeline',
      gridArea: { x: 0, y: 1, w: 6, h: 2 },
      props: {},
      isVisible: true
    },
    {
      id: 'chart-2',
      type: 'chart',
      component: 'ServiceTypeDistributionChart',
      title: 'Service Type Distribution',
      gridArea: { x: 6, y: 1, w: 6, h: 2 },
      props: {},
      isVisible: true
    },
    {
      id: 'chart-3',
      type: 'chart',
      component: 'ConsultantPerformanceChart',
      title: 'Consultant Performance',
      gridArea: { x: 0, y: 3, w: 6, h: 2 },
      props: {},
      isVisible: true
    },
    {
      id: 'chart-4',
      type: 'chart',
      component: 'ServiceRevenueTrendsChart',
      title: 'Revenue Trends',
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


export const DEFAULT_EMPLOYERS_LAYOUT: DashboardLayout = {
  id: 'employers',
  name: 'Employers Dashboard',
  dashboardType: 'employers',
  widgets: [
    {
      id: 'stat-total-clients-1',
      type: 'stat',
      component: 'EnhancedStatCard',
      title: 'Total Employers',
      gridArea: { x: 0, y: 0, w: 3, h: 1 },
      props: {
        title: "Total Employers",
        value: "18",
        change: "+3",
        trend: "up",
        variant: "primary"
      },
      isVisible: true
    },
    {
      id: 'stat-active-projects-1',
      type: 'stat',
      component: 'EnhancedStatCard',
      title: 'Active Accounts',
      gridArea: { x: 3, y: 0, w: 3, h: 1 },
      props: {
        title: "Active Accounts",
        value: "15",
        change: "+2",
        trend: "up",
        variant: "success"
      },
      isVisible: true
    },
    {
      id: 'stat-total-revenue-1',
      type: 'stat',
      component: 'EnhancedStatCard',
      title: 'Monthly Revenue',
      gridArea: { x: 6, y: 0, w: 3, h: 1 },
      props: {
        title: "Monthly Revenue",
        isCurrency: true,
        rawValue: 145000,
        change: "+12%",
        trend: "up",
        variant: "success"
      },
      isVisible: true
    },
    {
      id: 'stat-profit-margin-1',
      type: 'stat',
      component: 'EnhancedStatCard',
      title: 'Profit Margin',
      gridArea: { x: 9, y: 0, w: 3, h: 1 },
      props: {
        title: "Profit Margin",
        value: "28%",
        change: "+3%",
        trend: "up",
        variant: "success"
      },
      isVisible: true
    },
    {
      id: 'chart-client-distribution-1',
      type: 'chart',
      component: 'ClientDistributionChart',
      title: 'Client Distribution',
      gridArea: { x: 0, y: 1, w: 6, h: 2 },
      props: {},
      isVisible: true
    },
    {
      id: 'chart-revenue-expense-1',
      type: 'chart',
      component: 'RevenueExpenseChart',
      title: 'Revenue Trends',
      gridArea: { x: 6, y: 1, w: 6, h: 2 },
      props: {},
      isVisible: true
    },
    {
      id: 'chart-budget-analysis-1',
      type: 'chart',
      component: 'BudgetAnalysisChart',
      title: 'Subscription Analysis',
      gridArea: { x: 0, y: 3, w: 6, h: 2 },
      props: {},
      isVisible: true
    },
    {
      id: 'chart-client-distribution-2',
      type: 'chart',
      component: 'ClientDistributionChart',
      title: 'Account Status',
      gridArea: { x: 6, y: 3, w: 6, h: 2 },
      props: {},
      isVisible: true
    },
    {
      id: 'activity-feed-1',
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

export const DEFAULT_CANDIDATES_LAYOUT: DashboardLayout = {
  id: 'candidates',
  name: 'Candidates Dashboard',
  dashboardType: 'candidates',
  widgets: [
    {
      id: 'stat-1',
      type: 'stat',
      component: 'EnhancedStatCard',
      title: 'Total Candidates',
      gridArea: { x: 0, y: 0, w: 3, h: 1 },
      props: {
        title: "Total Candidates",
        value: "150",
        change: "+12%",
        trend: "up",
        variant: "primary"
      },
      isVisible: true
    },
    {
      id: 'stat-2',
      type: 'stat',
      component: 'EnhancedStatCard',
      title: 'Active Candidates',
      gridArea: { x: 3, y: 0, w: 3, h: 1 },
      props: {
        title: "Active Candidates",
        value: "45",
        change: "+8%",
        trend: "up",
        variant: "success"
      },
      isVisible: true
    },
    {
      id: 'stat-3',
      type: 'stat',
      component: 'EnhancedStatCard',
      title: 'Placed Candidates',
      gridArea: { x: 6, y: 0, w: 3, h: 1 },
      props: {
        title: "Placed Candidates",
        value: "12",
        change: "+15%",
        trend: "up",
        variant: "warning"
      },
      isVisible: true
    },
    {
      id: 'stat-4',
      type: 'stat',
      component: 'EnhancedStatCard',
      title: 'Conversion Rate',
      gridArea: { x: 9, y: 0, w: 3, h: 1 },
      props: {
        title: "Conversion Rate",
        value: "18.5%",
        change: "+2.3%",
        trend: "up",
        variant: "neutral"
      },
      isVisible: true
    },
    {
      id: 'chart-1',
      type: 'chart',
      component: 'CandidatePipelineChart',
      title: 'Candidate Pipeline',
      gridArea: { x: 0, y: 1, w: 6, h: 2 },
      props: {},
      isVisible: true
    },
    {
      id: 'chart-2',
      type: 'chart',
      component: 'CandidateSourceDistributionChart',
      title: 'Candidate Sources',
      gridArea: { x: 6, y: 1, w: 6, h: 2 },
      props: {},
      isVisible: true
    },
    {
      id: 'chart-3',
      type: 'chart',
      component: 'CandidateExperienceBreakdownChart',
      title: 'Experience Breakdown',
      gridArea: { x: 0, y: 3, w: 6, h: 2 },
      props: {},
      isVisible: true
    },
    {
      id: 'chart-4',
      type: 'chart',
      component: 'CandidatePlacementTrendsChart',
      title: 'Placement Trends',
      gridArea: { x: 6, y: 3, w: 6, h: 2 },
      props: {},
      isVisible: true
    },
    {
      id: 'chart-5',
      type: 'chart',
      component: 'TopSkillsDemandChart',
      title: 'Top Skills in Demand',
      gridArea: { x: 0, y: 5, w: 6, h: 2 },
      props: {},
      isVisible: true
    },
    {
      id: 'chart-6',
      type: 'chart',
      component: 'SalaryExpectationsChart',
      title: 'Salary Expectations',
      gridArea: { x: 6, y: 5, w: 6, h: 2 },
      props: {},
      isVisible: true
    },
    {
      id: 'activity-feed-1',
      type: 'activity',
      component: 'RecentActivityCard',
      title: 'Recent Activity',
      gridArea: { x: 0, y: 7, w: 12, h: 2 },
      props: {},
      isVisible: true,
      isLocked: true
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
};

const DEFAULT_SALES_LAYOUT: DashboardLayout = {
  id: 'sales',
  name: 'Sales Dashboard',
  dashboardType: 'sales',
  widgets: [
    {
      id: 'sales-stat-1',
      type: 'stat',
      component: 'EnhancedStatCard',
      title: 'Total Revenue',
      gridArea: { x: 0, y: 0, w: 3, h: 1 },
      props: {
        title: "Total Revenue",
        value: "$2.4M",
        change: "+18%",
        trend: "up",
        variant: "primary"
      },
      isVisible: true
    },
    {
      id: 'sales-stat-2',
      type: 'stat',
      component: 'EnhancedStatCard',
      title: 'Active Projects',
      gridArea: { x: 3, y: 0, w: 3, h: 1 },
      props: {
        title: "Active Projects",
        value: "16",
        change: "+8%",
        trend: "up",
        variant: "success"
      },
      isVisible: true
    },
    {
      id: 'sales-activity',
      type: 'activity',
      component: 'ActivityFeed',
      title: 'Recent Activity',
      gridArea: { x: 0, y: 1, w: 12, h: 2 },
      props: {},
      isVisible: true,
      isLocked: true
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
};

const DEFAULT_RPO_LAYOUT: DashboardLayout = {
  id: 'rpo',
  name: 'RPO Dashboard',
  dashboardType: 'rpo',
  widgets: [
    {
      id: 'rpo-stat-1',
      type: 'stat',
      component: 'EnhancedStatCard',
      title: 'Active Projects',
      gridArea: { x: 0, y: 0, w: 3, h: 1 },
      props: {
        title: "Active Projects",
        value: "12",
        change: "+5%",
        trend: "up",
        variant: "primary"
      },
      isVisible: true
    },
    {
      id: 'rpo-stat-2',
      type: 'stat',
      component: 'EnhancedStatCard',
      title: 'Total Candidates',
      gridArea: { x: 3, y: 0, w: 3, h: 1 },
      props: {
        title: "Total Candidates",
        value: "486",
        change: "+12%",
        trend: "up",
        variant: "success"
      },
      isVisible: true
    },
    {
      id: 'rpo-activity',
      type: 'activity',
      component: 'ActivityFeed',
      title: 'Recent Activity',
      gridArea: { x: 0, y: 1, w: 12, h: 2 },
      props: {},
      isVisible: true,
      isLocked: true
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
};

const DEFAULT_ADDONS_LAYOUT: DashboardLayout = {
  id: 'addons-default',
  name: 'Add-ons Dashboard',
  dashboardType: 'addons',
  widgets: [],
  createdAt: new Date(),
  updatedAt: new Date()
};

export const DEFAULT_LAYOUTS: Record<DashboardType, DashboardLayout> = {
  overview: DEFAULT_OVERVIEW_LAYOUT,
  jobs: DEFAULT_JOBS_LAYOUT,
  hrms: DEFAULT_HRMS_LAYOUT,
  financial: DEFAULT_FINANCIAL_LAYOUT,
  consulting: DEFAULT_CONSULTING_LAYOUT,
  'recruitment-services': DEFAULT_RECRUITMENT_SERVICES_LAYOUT,
  employers: DEFAULT_EMPLOYERS_LAYOUT,
  candidates: DEFAULT_CANDIDATES_LAYOUT,
  sales: DEFAULT_SALES_LAYOUT,
  rpo: DEFAULT_RPO_LAYOUT,
  addons: DEFAULT_ADDONS_LAYOUT
};
