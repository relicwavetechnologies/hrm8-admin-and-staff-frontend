import { 
  Users, Briefcase, FileText, UserCheck, TrendingUp, BarChart3, PieChart, Target, Clock,
  UserCircle, Calendar, Percent, Building2, DollarSign, TrendingDown, Wallet, Receipt,
  FolderKanban, Building, Gauge, Timer, CheckCircle, Shield, AlertCircle, Activity, FileCheck, Video
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { DashboardType } from "./dashboardTypes";

export type WidgetType = 
  // Jobs widgets
  | 'stat-active-jobs'
  | 'stat-total-candidates'
  | 'stat-applications'
  | 'stat-hired'
  | 'chart-hiring-trends'
  | 'chart-application-funnel'
  | 'chart-job-distribution'
  | 'chart-source-of-hire'
  // HRMS widgets
  | 'stat-total-employees'
  | 'stat-attendance-rate'
  | 'stat-leave-requests'
  | 'stat-department-count'
  | 'chart-attendance-trends'
  | 'chart-employee-distribution'
  | 'chart-leave-analysis'
  | 'chart-performance-overview'
  // Financial widgets
  | 'stat-total-revenue'
  | 'stat-total-expenses'
  | 'stat-profit-margin'
  | 'stat-payroll-cost'
  | 'chart-revenue-expense'
  | 'chart-budget-analysis'
  | 'chart-cost-breakdown'
  | 'chart-payroll-trends'
  // Consulting widgets
  | 'stat-active-projects'
  | 'stat-total-clients'
  | 'stat-utilization-rate'
  | 'stat-billable-hours'
  | 'chart-project-pipeline'
  | 'chart-client-distribution'
  | 'chart-resource-allocation'
  | 'chart-revenue-forecast'
  // Recruitment Services widgets
  | 'stat-active-service-projects'
  | 'stat-shortlisting-projects'
  | 'stat-fullservice-projects'
  | 'stat-executive-search-projects'
  | 'stat-rpo-projects'
  | 'stat-service-revenue'
  | 'stat-avg-success-rate'
  | 'stat-projects-completed'
  | 'chart-service-pipeline'
  | 'chart-service-type-distribution'
  | 'chart-consultant-performance'
  | 'chart-service-revenue-trends'
  | 'chart-project-completion-rate'
  // Candidates widgets
  | 'stat-active-candidates'
  | 'stat-placed-candidates'
  | 'stat-candidate-conversion-rate'
  | 'chart-candidate-pipeline'
  | 'chart-candidate-source-distribution'
  | 'chart-candidate-experience-breakdown'
  | 'chart-candidate-placement-trends'
  | 'chart-top-skills-demand'
  | 'chart-salary-expectations'
  // Feedback widgets
  | 'feedback-dashboard'
  // AI Interview widgets
  | 'stat-ai-interview-total'
  | 'stat-ai-interview-completion'
  | 'stat-ai-interview-avg-score'
  | 'stat-ai-interview-avg-duration'
  | 'chart-ai-interview-performance'
  // Background Checks widgets
  | 'stat-total-checks'
  | 'stat-active-checks'
  | 'stat-completion-rate'
  | 'stat-avg-completion-time'
  | 'widget-pending-actions'
  | 'chart-check-type-distribution'
  | 'chart-status-distribution'
  | 'widget-recent-activity'
  // Shared
  | 'activity-feed';

export interface WidgetDefinition {
  id: WidgetType;
  name: string;
  description: string;
  category: 'stat' | 'chart' | 'activity';
  component: string;
  icon: LucideIcon;
  defaultSize: { w: number; h: number };
  minSize: { w: number; h: number };
  maxSize?: { w: number; h: number };
  defaultProps?: Record<string, any>;
  allowedDashboards: DashboardType[];
}

export const WIDGET_REGISTRY: Record<WidgetType, WidgetDefinition> = {
  // ===== JOBS WIDGETS =====
  'stat-active-jobs': {
    id: 'stat-active-jobs',
    name: 'Active Jobs',
    description: 'Total number of active job postings',
    category: 'stat',
    component: 'EnhancedStatCard',
    icon: Briefcase,
    defaultSize: { w: 3, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 6, h: 1 },
    defaultProps: {
      title: "Active Jobs",
      value: "24",
      change: "+12%",
      trend: "up",
      variant: "neutral"
    },
    allowedDashboards: ['jobs']
  },
  'stat-total-candidates': {
    id: 'stat-total-candidates',
    name: 'Total Candidates',
    description: 'Total candidates in the pipeline',
    category: 'stat',
    component: 'EnhancedStatCard',
    icon: Users,
    defaultSize: { w: 3, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 6, h: 1 },
    defaultProps: {
      title: "Total Candidates",
      value: "1,234",
      change: "+8%",
      trend: "up",
      variant: "success"
    },
    allowedDashboards: ['jobs']
  },
  'stat-applications': {
    id: 'stat-applications',
    name: 'Applications',
    description: 'Pending applications to review',
    category: 'stat',
    component: 'EnhancedStatCard',
    icon: FileText,
    defaultSize: { w: 3, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 6, h: 1 },
    defaultProps: {
      title: "Applications",
      value: "567",
      change: "+23%",
      trend: "up",
      variant: "primary"
    },
    allowedDashboards: ['jobs']
  },
  'stat-hired': {
    id: 'stat-hired',
    name: 'Hired This Month',
    description: 'Candidates hired in the current month',
    category: 'stat',
    component: 'EnhancedStatCard',
    icon: UserCheck,
    defaultSize: { w: 3, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 6, h: 1 },
    defaultProps: {
      title: "Hired This Month",
      value: "18",
      change: "+5%",
      trend: "up",
      variant: "warning"
    },
    allowedDashboards: ['jobs']
  },
  'chart-hiring-trends': {
    id: 'chart-hiring-trends',
    name: 'Hiring Trends',
    description: 'Application flow over time',
    category: 'chart',
    component: 'HiringTrendsChart',
    icon: TrendingUp,
    defaultSize: { w: 6, h: 2 },
    minSize: { w: 4, h: 2 },
    maxSize: { w: 12, h: 4 },
    allowedDashboards: ['jobs']
  },
  'chart-application-funnel': {
    id: 'chart-application-funnel',
    name: 'Application Funnel',
    description: 'Candidate progression through stages',
    category: 'chart',
    component: 'ApplicationFunnelChart',
    icon: BarChart3,
    defaultSize: { w: 6, h: 2 },
    minSize: { w: 4, h: 2 },
    maxSize: { w: 12, h: 4 },
    allowedDashboards: ['jobs']
  },
  'chart-job-distribution': {
    id: 'chart-job-distribution',
    name: 'Job Distribution',
    description: 'Jobs by department and type',
    category: 'chart',
    component: 'JobDistributionChart',
    icon: PieChart,
    defaultSize: { w: 6, h: 2 },
    minSize: { w: 4, h: 2 },
    maxSize: { w: 12, h: 4 },
    allowedDashboards: ['jobs']
  },
  'chart-source-of-hire': {
    id: 'chart-source-of-hire',
    name: 'Source of Hire',
    description: 'Where candidates are coming from',
    category: 'chart',
    component: 'SourceOfHireChart',
    icon: Target,
    defaultSize: { w: 6, h: 2 },
    minSize: { w: 4, h: 2 },
    maxSize: { w: 12, h: 4 },
    allowedDashboards: ['jobs']
  },

  // ===== HRMS WIDGETS =====
  'stat-total-employees': {
    id: 'stat-total-employees',
    name: 'Total Employees',
    description: 'Total active employees',
    category: 'stat',
    component: 'EnhancedStatCard',
    icon: UserCircle,
    defaultSize: { w: 3, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 6, h: 1 },
    defaultProps: {
      title: "Total Employees",
      value: "342",
      change: "+6%",
      trend: "up",
      variant: "success"
    },
    allowedDashboards: ['hrms']
  },
  'stat-attendance-rate': {
    id: 'stat-attendance-rate',
    name: 'Attendance Rate',
    description: 'Average employee attendance',
    category: 'stat',
    component: 'EnhancedStatCard',
    icon: Calendar,
    defaultSize: { w: 3, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 6, h: 1 },
    defaultProps: {
      title: "Attendance Rate",
      value: "94.2%",
      change: "+2.1%",
      trend: "up",
      variant: "success"
    },
    allowedDashboards: ['hrms']
  },
  'stat-leave-requests': {
    id: 'stat-leave-requests',
    name: 'Leave Requests',
    description: 'Pending leave requests',
    category: 'stat',
    component: 'EnhancedStatCard',
    icon: FileText,
    defaultSize: { w: 3, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 6, h: 1 },
    defaultProps: {
      title: "Leave Requests",
      value: "23",
      change: "-12%",
      trend: "down",
      variant: "primary"
    },
    allowedDashboards: ['hrms']
  },
  'stat-department-count': {
    id: 'stat-department-count',
    name: 'Departments',
    description: 'Active departments',
    category: 'stat',
    component: 'EnhancedStatCard',
    icon: Building2,
    defaultSize: { w: 3, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 6, h: 1 },
    defaultProps: {
      title: "Departments",
      value: "12",
      change: "0%",
      trend: "neutral",
      variant: "neutral"
    },
    allowedDashboards: ['hrms']
  },
  'chart-attendance-trends': {
    id: 'chart-attendance-trends',
    name: 'Attendance Trends',
    description: 'Daily attendance patterns',
    category: 'chart',
    component: 'AttendanceTrendsChart',
    icon: TrendingUp,
    defaultSize: { w: 6, h: 2 },
    minSize: { w: 4, h: 2 },
    maxSize: { w: 12, h: 4 },
    allowedDashboards: ['hrms']
  },
  'chart-employee-distribution': {
    id: 'chart-employee-distribution',
    name: 'Employee Distribution',
    description: 'Employees by department',
    category: 'chart',
    component: 'EmployeeDistributionChart',
    icon: PieChart,
    defaultSize: { w: 6, h: 2 },
    minSize: { w: 4, h: 2 },
    maxSize: { w: 12, h: 4 },
    allowedDashboards: ['hrms']
  },
  'chart-leave-analysis': {
    id: 'chart-leave-analysis',
    name: 'Leave Analysis',
    description: 'Leave trends and types',
    category: 'chart',
    component: 'LeaveAnalysisChart',
    icon: BarChart3,
    defaultSize: { w: 6, h: 2 },
    minSize: { w: 4, h: 2 },
    maxSize: { w: 12, h: 4 },
    allowedDashboards: ['hrms']
  },
  'chart-performance-overview': {
    id: 'chart-performance-overview',
    name: 'Performance Overview',
    description: 'Employee performance metrics',
    category: 'chart',
    component: 'PerformanceOverviewChart',
    icon: Target,
    defaultSize: { w: 6, h: 2 },
    minSize: { w: 4, h: 2 },
    maxSize: { w: 12, h: 4 },
    allowedDashboards: ['hrms']
  },

  // ===== FINANCIAL WIDGETS =====
  'stat-total-revenue': {
    id: 'stat-total-revenue',
    name: 'Total Revenue',
    description: 'Revenue this period',
    category: 'stat',
    component: 'EnhancedStatCard',
    icon: DollarSign,
    defaultSize: { w: 3, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 6, h: 1 },
    defaultProps: {
      title: "Total Revenue",
      isCurrency: true,
      rawValue: 2400000,
      change: "+18%",
      trend: "up",
      variant: "success"
    },
    allowedDashboards: ['financial']
  },
  'stat-total-expenses': {
    id: 'stat-total-expenses',
    name: 'Total Expenses',
    description: 'Expenses this period',
    category: 'stat',
    component: 'EnhancedStatCard',
    icon: TrendingDown,
    defaultSize: { w: 3, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 6, h: 1 },
    defaultProps: {
      title: "Total Expenses",
      isCurrency: true,
      rawValue: 1800000,
      change: "+5%",
      trend: "up",
      variant: "warning"
    },
    allowedDashboards: ['financial']
  },
  'stat-profit-margin': {
    id: 'stat-profit-margin',
    name: 'Profit Margin',
    description: 'Net profit margin',
    category: 'stat',
    component: 'EnhancedStatCard',
    icon: Percent,
    defaultSize: { w: 3, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 6, h: 1 },
    defaultProps: {
      title: "Profit Margin",
      value: "25%",
      change: "+3%",
      trend: "up",
      variant: "success"
    },
    allowedDashboards: ['financial']
  },
  'stat-payroll-cost': {
    id: 'stat-payroll-cost',
    name: 'Payroll Cost',
    description: 'Monthly payroll expenses',
    category: 'stat',
    component: 'EnhancedStatCard',
    icon: Wallet,
    defaultSize: { w: 3, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 6, h: 1 },
    defaultProps: {
      title: "Payroll Cost",
      isCurrency: true,
      rawValue: 890000,
      change: "+2%",
      trend: "up",
      variant: "primary"
    },
    allowedDashboards: ['financial']
  },
  'chart-revenue-expense': {
    id: 'chart-revenue-expense',
    name: 'Revenue vs Expenses',
    description: 'Revenue and expense trends',
    category: 'chart',
    component: 'RevenueExpenseChart',
    icon: TrendingUp,
    defaultSize: { w: 6, h: 2 },
    minSize: { w: 4, h: 2 },
    maxSize: { w: 12, h: 4 },
    allowedDashboards: ['financial']
  },
  'chart-budget-analysis': {
    id: 'chart-budget-analysis',
    name: 'Budget Analysis',
    description: 'Budget vs actual spending',
    category: 'chart',
    component: 'BudgetAnalysisChart',
    icon: BarChart3,
    defaultSize: { w: 6, h: 2 },
    minSize: { w: 4, h: 2 },
    maxSize: { w: 12, h: 4 },
    allowedDashboards: ['financial']
  },
  'chart-cost-breakdown': {
    id: 'chart-cost-breakdown',
    name: 'Cost Breakdown',
    description: 'Expenses by category',
    category: 'chart',
    component: 'CostBreakdownChart',
    icon: PieChart,
    defaultSize: { w: 6, h: 2 },
    minSize: { w: 4, h: 2 },
    maxSize: { w: 12, h: 4 },
    allowedDashboards: ['financial']
  },
  'chart-payroll-trends': {
    id: 'chart-payroll-trends',
    name: 'Payroll Trends',
    description: 'Payroll cost over time',
    category: 'chart',
    component: 'PayrollTrendsChart',
    icon: Receipt,
    defaultSize: { w: 6, h: 2 },
    minSize: { w: 4, h: 2 },
    maxSize: { w: 12, h: 4 },
    allowedDashboards: ['financial']
  },

  // ===== CONSULTING WIDGETS =====
  'stat-active-projects': {
    id: 'stat-active-projects',
    name: 'Active Projects',
    description: 'Currently active projects',
    category: 'stat',
    component: 'EnhancedStatCard',
    icon: FolderKanban,
    defaultSize: { w: 3, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 6, h: 1 },
    defaultProps: {
      title: "Active Projects",
      value: "32",
      change: "+15%",
      trend: "up",
      variant: "primary"
    },
    allowedDashboards: ['consulting']
  },
  'stat-total-clients': {
    id: 'stat-total-clients',
    name: 'Total Clients',
    description: 'Active client accounts',
    category: 'stat',
    component: 'EnhancedStatCard',
    icon: Building,
    defaultSize: { w: 3, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 6, h: 1 },
    defaultProps: {
      title: "Total Clients",
      value: "18",
      change: "+3",
      trend: "up",
      variant: "success"
    },
    allowedDashboards: ['consulting']
  },
  'stat-utilization-rate': {
    id: 'stat-utilization-rate',
    name: 'Utilization Rate',
    description: 'Team utilization percentage',
    category: 'stat',
    component: 'EnhancedStatCard',
    icon: Gauge,
    defaultSize: { w: 3, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 6, h: 1 },
    defaultProps: {
      title: "Utilization Rate",
      value: "78%",
      change: "+5%",
      trend: "up",
      variant: "success"
    },
    allowedDashboards: ['consulting']
  },
  'stat-billable-hours': {
    id: 'stat-billable-hours',
    name: 'Billable Hours',
    description: 'Total billable hours this month',
    category: 'stat',
    component: 'EnhancedStatCard',
    icon: Timer,
    defaultSize: { w: 3, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 6, h: 1 },
    defaultProps: {
      title: "Billable Hours",
      value: "2,840",
      change: "+12%",
      trend: "up",
      variant: "primary"
    },
    allowedDashboards: ['consulting']
  },
  'chart-project-pipeline': {
    id: 'chart-project-pipeline',
    name: 'Project Pipeline',
    description: 'Projects by status',
    category: 'chart',
    component: 'ProjectPipelineChart',
    icon: BarChart3,
    defaultSize: { w: 6, h: 2 },
    minSize: { w: 4, h: 2 },
    maxSize: { w: 12, h: 4 },
    allowedDashboards: ['consulting']
  },
  'chart-client-distribution': {
    id: 'chart-client-distribution',
    name: 'Client Distribution',
    description: 'Clients by industry',
    category: 'chart',
    component: 'ClientDistributionChart',
    icon: PieChart,
    defaultSize: { w: 6, h: 2 },
    minSize: { w: 4, h: 2 },
    maxSize: { w: 12, h: 4 },
    allowedDashboards: ['consulting']
  },
  'chart-resource-allocation': {
    id: 'chart-resource-allocation',
    name: 'Resource Allocation',
    description: 'Team allocation across projects',
    category: 'chart',
    component: 'ResourceAllocationChart',
    icon: Users,
    defaultSize: { w: 6, h: 2 },
    minSize: { w: 4, h: 2 },
    maxSize: { w: 12, h: 4 },
    allowedDashboards: ['consulting']
  },
  'chart-revenue-forecast': {
    id: 'chart-revenue-forecast',
    name: 'Revenue Forecast',
    description: 'Projected revenue by quarter',
    category: 'chart',
    component: 'RevenueForecastChart',
    icon: TrendingUp,
    defaultSize: { w: 6, h: 2 },
    minSize: { w: 4, h: 2 },
    maxSize: { w: 12, h: 4 },
    allowedDashboards: ['consulting']
  },

  // ===== RECRUITMENT SERVICES WIDGETS =====
  'stat-active-service-projects': {
    id: 'stat-active-service-projects',
    name: 'Active Service Projects',
    description: 'Currently active recruitment service projects',
    category: 'stat',
    component: 'EnhancedStatCard',
    icon: FolderKanban,
    defaultSize: { w: 3, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 6, h: 1 },
    defaultProps: {
      title: "Active Projects",
      value: "28",
      change: "+7",
      trend: "up",
      variant: "primary"
    },
    allowedDashboards: ['recruitment-services', 'overview']
  },
  'stat-shortlisting-projects': {
    id: 'stat-shortlisting-projects',
    name: 'Shortlisting Projects',
    description: 'Active shortlisting service projects',
    category: 'stat',
    component: 'EnhancedStatCard',
    icon: Users,
    defaultSize: { w: 3, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 6, h: 1 },
    defaultProps: {
      title: "Shortlisting",
      value: "12",
      change: "+3",
      trend: "up",
      variant: "success"
    },
    allowedDashboards: ['recruitment-services']
  },
  'stat-fullservice-projects': {
    id: 'stat-fullservice-projects',
    name: 'Full-Service Projects',
    description: 'Active full-service recruitment projects',
    category: 'stat',
    component: 'EnhancedStatCard',
    icon: Briefcase,
    defaultSize: { w: 3, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 6, h: 1 },
    defaultProps: {
      title: "Full-Service",
      value: "8",
      change: "+2",
      trend: "up",
      variant: "primary"
    },
    allowedDashboards: ['recruitment-services']
  },
  'stat-executive-search-projects': {
    id: 'stat-executive-search-projects',
    name: 'Executive Search Projects',
    description: 'Active executive search projects',
    category: 'stat',
    component: 'EnhancedStatCard',
    icon: Target,
    defaultSize: { w: 3, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 6, h: 1 },
    defaultProps: {
      title: "Executive Search",
      value: "5",
      change: "+1",
      trend: "up",
      variant: "warning"
    },
    allowedDashboards: ['recruitment-services']
  },
  'stat-rpo-projects': {
    id: 'stat-rpo-projects',
    name: 'RPO Projects',
    description: 'Active RPO projects',
    category: 'stat',
    component: 'EnhancedStatCard',
    icon: Building,
    defaultSize: { w: 3, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 6, h: 1 },
    defaultProps: {
      title: "RPO",
      value: "3",
      change: "+1",
      trend: "up",
      variant: "neutral"
    },
    allowedDashboards: ['recruitment-services']
  },
  'stat-service-revenue': {
    id: 'stat-service-revenue',
    name: 'Service Revenue',
    description: 'Total revenue from recruitment services',
    category: 'stat',
    component: 'EnhancedStatCard',
    icon: DollarSign,
    defaultSize: { w: 3, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 6, h: 1 },
    defaultProps: {
      title: "Service Revenue",
      isCurrency: true,
      rawValue: 1800000,
      change: "+22%",
      trend: "up",
      variant: "success"
    },
    allowedDashboards: ['recruitment-services', 'overview']
  },
  'stat-avg-success-rate': {
    id: 'stat-avg-success-rate',
    name: 'Average Success Rate',
    description: 'Average placement success rate',
    category: 'stat',
    component: 'EnhancedStatCard',
    icon: Percent,
    defaultSize: { w: 3, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 6, h: 1 },
    defaultProps: {
      title: "Success Rate",
      value: "87%",
      change: "+4%",
      trend: "up",
      variant: "success"
    },
    allowedDashboards: ['recruitment-services']
  },
  'stat-projects-completed': {
    id: 'stat-projects-completed',
    name: 'Projects Completed',
    description: 'Projects completed this month',
    category: 'stat',
    component: 'EnhancedStatCard',
    icon: CheckCircle,
    defaultSize: { w: 3, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 6, h: 1 },
    defaultProps: {
      title: "Completed",
      value: "15",
      change: "+5",
      trend: "up",
      variant: "success"
    },
    allowedDashboards: ['recruitment-services']
  },
  'chart-service-pipeline': {
    id: 'chart-service-pipeline',
    name: 'Service Pipeline',
    description: 'Service projects by stage',
    category: 'chart',
    component: 'ServicePipelineChart',
    icon: BarChart3,
    defaultSize: { w: 6, h: 2 },
    minSize: { w: 4, h: 2 },
    maxSize: { w: 12, h: 4 },
    allowedDashboards: ['recruitment-services']
  },
  'chart-service-type-distribution': {
    id: 'chart-service-type-distribution',
    name: 'Service Type Distribution',
    description: 'Distribution of service types',
    category: 'chart',
    component: 'ServiceTypeDistributionChart',
    icon: PieChart,
    defaultSize: { w: 6, h: 2 },
    minSize: { w: 4, h: 2 },
    maxSize: { w: 12, h: 4 },
    allowedDashboards: ['recruitment-services']
  },
  'chart-consultant-performance': {
    id: 'chart-consultant-performance',
    name: 'Consultant Performance',
    description: 'Performance metrics by consultant',
    category: 'chart',
    component: 'ConsultantPerformanceChart',
    icon: TrendingUp,
    defaultSize: { w: 6, h: 2 },
    minSize: { w: 4, h: 2 },
    maxSize: { w: 12, h: 4 },
    allowedDashboards: ['recruitment-services']
  },
  'chart-service-revenue-trends': {
    id: 'chart-service-revenue-trends',
    name: 'Service Revenue Trends',
    description: 'Revenue trends over time',
    category: 'chart',
    component: 'ServiceRevenueTrendsChart',
    icon: DollarSign,
    defaultSize: { w: 6, h: 2 },
    minSize: { w: 4, h: 2 },
    maxSize: { w: 12, h: 4 },
    allowedDashboards: ['recruitment-services']
  },
  'chart-project-completion-rate': {
    id: 'chart-project-completion-rate',
    name: 'Project Completion Rate',
    description: 'Project completion trends',
    category: 'chart',
    component: 'ProjectCompletionRateChart',
    icon: Target,
    defaultSize: { w: 6, h: 2 },
    minSize: { w: 4, h: 2 },
    maxSize: { w: 12, h: 4 },
    allowedDashboards: ['recruitment-services']
  },

  // ===== CANDIDATES WIDGETS =====
  'stat-active-candidates': {
    id: 'stat-active-candidates',
    name: 'Active Candidates',
    description: 'Candidates actively seeking opportunities',
    category: 'stat',
    component: 'EnhancedStatCard',
    icon: UserCheck,
    defaultSize: { w: 3, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 6, h: 1 },
    defaultProps: {
      title: "Active Candidates",
      value: "45",
      change: "+8%",
      trend: "up",
      variant: "success"
    },
    allowedDashboards: ['candidates']
  },
  'stat-placed-candidates': {
    id: 'stat-placed-candidates',
    name: 'Placed Candidates',
    description: 'Successfully placed candidates',
    category: 'stat',
    component: 'EnhancedStatCard',
    icon: CheckCircle,
    defaultSize: { w: 3, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 6, h: 1 },
    defaultProps: {
      title: "Placed Candidates",
      value: "12",
      change: "+15%",
      trend: "up",
      variant: "warning"
    },
    allowedDashboards: ['candidates']
  },
  'stat-candidate-conversion-rate': {
    id: 'stat-candidate-conversion-rate',
    name: 'Conversion Rate',
    description: 'Application to placement conversion rate',
    category: 'stat',
    component: 'EnhancedStatCard',
    icon: Percent,
    defaultSize: { w: 3, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 6, h: 1 },
    defaultProps: {
      title: "Conversion Rate",
      value: "18.5%",
      change: "+2.3%",
      trend: "up",
      variant: "neutral"
    },
    allowedDashboards: ['candidates']
  },
  'chart-candidate-pipeline': {
    id: 'chart-candidate-pipeline',
    name: 'Candidate Pipeline',
    description: 'Candidates by recruitment stage',
    category: 'chart',
    component: 'CandidatePipelineChart',
    icon: TrendingUp,
    defaultSize: { w: 6, h: 2 },
    minSize: { w: 4, h: 2 },
    maxSize: { w: 12, h: 4 },
    allowedDashboards: ['candidates']
  },
  'chart-candidate-source-distribution': {
    id: 'chart-candidate-source-distribution',
    name: 'Candidate Sources',
    description: 'Distribution of candidate sources',
    category: 'chart',
    component: 'CandidateSourceDistributionChart',
    icon: PieChart,
    defaultSize: { w: 6, h: 2 },
    minSize: { w: 4, h: 2 },
    maxSize: { w: 12, h: 4 },
    allowedDashboards: ['candidates']
  },
  'chart-candidate-experience-breakdown': {
    id: 'chart-candidate-experience-breakdown',
    name: 'Experience Breakdown',
    description: 'Candidates by experience level',
    category: 'chart',
    component: 'CandidateExperienceBreakdownChart',
    icon: BarChart3,
    defaultSize: { w: 6, h: 2 },
    minSize: { w: 4, h: 2 },
    maxSize: { w: 12, h: 4 },
    allowedDashboards: ['candidates']
  },
  'chart-candidate-placement-trends': {
    id: 'chart-candidate-placement-trends',
    name: 'Placement Trends',
    description: 'Candidate placements over time',
    category: 'chart',
    component: 'CandidatePlacementTrendsChart',
    icon: TrendingUp,
    defaultSize: { w: 6, h: 2 },
    minSize: { w: 4, h: 2 },
    maxSize: { w: 12, h: 4 },
    allowedDashboards: ['candidates']
  },
  'chart-top-skills-demand': {
    id: 'chart-top-skills-demand',
    name: 'Top Skills in Demand',
    description: 'Most common candidate skills',
    category: 'chart',
    component: 'TopSkillsDemandChart',
    icon: Target,
    defaultSize: { w: 6, h: 2 },
    minSize: { w: 4, h: 2 },
    maxSize: { w: 12, h: 4 },
    allowedDashboards: ['candidates']
  },
  'chart-salary-expectations': {
    id: 'chart-salary-expectations',
    name: 'Salary Expectations',
    description: 'Salary ranges by experience level',
    category: 'chart',
    component: 'SalaryExpectationsChart',
    icon: DollarSign,
    defaultSize: { w: 6, h: 2 },
    minSize: { w: 4, h: 2 },
    maxSize: { w: 12, h: 4 },
    allowedDashboards: ['candidates']
  },
  
  // ===== FEEDBACK WIDGETS =====
  'feedback-dashboard': {
    id: 'feedback-dashboard',
    name: 'Collaborative Feedback',
    description: 'Recent team feedback and activity overview',
    category: 'activity',
    component: 'FeedbackDashboardWidget',
    icon: Users,
    defaultSize: { w: 6, h: 3 },
    minSize: { w: 4, h: 2 },
    allowedDashboards: ['overview', 'jobs', 'candidates'],
  },

  // ===== AI INTERVIEW WIDGETS =====
  'stat-ai-interview-total': {
    id: 'stat-ai-interview-total',
    name: 'Total AI Interviews',
    description: 'Total number of AI interviews conducted',
    category: 'stat',
    component: 'AIInterviewStatsWidget',
    icon: Video,
    defaultSize: { w: 3, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 6, h: 1 },
    defaultProps: {
      metric: 'total'
    },
    allowedDashboards: ['overview', 'jobs', 'candidates']
  },
  'stat-ai-interview-completion': {
    id: 'stat-ai-interview-completion',
    name: 'AI Interview Completion Rate',
    description: 'Percentage of completed AI interviews',
    category: 'stat',
    component: 'AIInterviewStatsWidget',
    icon: CheckCircle,
    defaultSize: { w: 3, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 6, h: 1 },
    defaultProps: {
      metric: 'completion-rate'
    },
    allowedDashboards: ['overview', 'jobs', 'candidates']
  },
  'stat-ai-interview-avg-score': {
    id: 'stat-ai-interview-avg-score',
    name: 'Average AI Interview Score',
    description: 'Average score across all interviews',
    category: 'stat',
    component: 'AIInterviewStatsWidget',
    icon: TrendingUp,
    defaultSize: { w: 3, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 6, h: 1 },
    defaultProps: {
      metric: 'avg-score'
    },
    allowedDashboards: ['overview', 'jobs', 'candidates']
  },
  'stat-ai-interview-avg-duration': {
    id: 'stat-ai-interview-avg-duration',
    name: 'Average Interview Duration',
    description: 'Average duration of interviews',
    category: 'stat',
    component: 'AIInterviewStatsWidget',
    icon: Clock,
    defaultSize: { w: 3, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 6, h: 1 },
    defaultProps: {
      metric: 'avg-duration'
    },
    allowedDashboards: ['overview', 'jobs', 'candidates']
  },
  'chart-ai-interview-performance': {
    id: 'chart-ai-interview-performance',
    name: 'AI Interview Performance',
    description: 'Performance distribution chart',
    category: 'chart',
    component: 'AIInterviewPerformanceChart',
    icon: BarChart3,
    defaultSize: { w: 6, h: 2 },
    minSize: { w: 4, h: 2 },
    maxSize: { w: 12, h: 3 },
    allowedDashboards: ['overview', 'jobs', 'candidates']
  },

  // ===== BACKGROUND CHECKS WIDGETS =====
  'stat-total-checks': {
    id: 'stat-total-checks',
    name: 'Total Background Checks',
    description: 'Total number of background checks',
    category: 'stat',
    component: 'TotalChecksWidget',
    icon: Shield,
    defaultSize: { w: 3, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 6, h: 1 },
    defaultProps: {},
    allowedDashboards: ['overview', 'addons']
  },
  'stat-active-checks': {
    id: 'stat-active-checks',
    name: 'Active Checks',
    description: 'Currently active background checks',
    category: 'stat',
    component: 'ActiveChecksWidget',
    icon: Clock,
    defaultSize: { w: 3, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 6, h: 1 },
    defaultProps: {},
    allowedDashboards: ['overview', 'addons']
  },
  'stat-completion-rate': {
    id: 'stat-completion-rate',
    name: 'Completion Rate',
    description: 'Background check completion rate',
    category: 'stat',
    component: 'CompletionRateWidget',
    icon: CheckCircle,
    defaultSize: { w: 3, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 6, h: 1 },
    defaultProps: {},
    allowedDashboards: ['overview', 'addons']
  },
  'stat-avg-completion-time': {
    id: 'stat-avg-completion-time',
    name: 'Avg. Completion Time',
    description: 'Average time to complete checks',
    category: 'stat',
    component: 'AvgCompletionTimeWidget',
    icon: Timer,
    defaultSize: { w: 3, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 6, h: 1 },
    defaultProps: {},
    allowedDashboards: ['overview', 'addons']
  },
  'widget-pending-actions': {
    id: 'widget-pending-actions',
    name: 'Pending Actions',
    description: 'Items requiring immediate attention',
    category: 'stat',
    component: 'PendingActionsWidget',
    icon: AlertCircle,
    defaultSize: { w: 3, h: 2 },
    minSize: { w: 3, h: 2 },
    maxSize: { w: 6, h: 3 },
    defaultProps: {},
    allowedDashboards: ['overview', 'addons']
  },
  'chart-check-type-distribution': {
    id: 'chart-check-type-distribution',
    name: 'Check Type Distribution',
    description: 'Distribution of check types',
    category: 'chart',
    component: 'CheckTypeDistributionWidget',
    icon: FileCheck,
    defaultSize: { w: 6, h: 2 },
    minSize: { w: 4, h: 2 },
    maxSize: { w: 12, h: 3 },
    defaultProps: {},
    allowedDashboards: ['overview', 'addons']
  },
  'chart-status-distribution': {
    id: 'chart-status-distribution',
    name: 'Status Distribution',
    description: 'Check status breakdown',
    category: 'chart',
    component: 'StatusDistributionWidget',
    icon: Activity,
    defaultSize: { w: 6, h: 2 },
    minSize: { w: 4, h: 2 },
    maxSize: { w: 12, h: 3 },
    defaultProps: {},
    allowedDashboards: ['overview', 'addons']
  },
  'widget-recent-activity': {
    id: 'widget-recent-activity',
    name: 'Recent Activity',
    description: 'Latest background check activities',
    category: 'activity',
    component: 'RecentActivityWidget',
    icon: Clock,
    defaultSize: { w: 6, h: 2 },
    minSize: { w: 4, h: 2 },
    maxSize: { w: 12, h: 3 },
    defaultProps: {},
    allowedDashboards: ['overview', 'addons']
  },

  // ===== SHARED WIDGETS =====
  'activity-feed': {
    id: 'activity-feed',
    name: 'Recent Activity',
    description: 'Latest activities and updates',
    category: 'activity',
    component: 'RecentActivityCard',
    icon: Clock,
    defaultSize: { w: 12, h: 2 },
    minSize: { w: 6, h: 2 },
    maxSize: { w: 12, h: 4 },
    allowedDashboards: ['jobs', 'hrms', 'financial', 'consulting', 'recruitment-services']
  },
};
