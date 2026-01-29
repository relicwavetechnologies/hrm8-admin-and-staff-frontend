import { Briefcase, Users, DollarSign, Handshake, LayoutGrid, UserCheck, Target, Building2, TrendingUp, UserRound, Package, type LucideIcon } from "lucide-react";
import type { WidgetType } from "./widgetRegistry";

export type DashboardType = 'overview' | 'jobs' | 'hrms' | 'financial' | 'consulting' | 'recruitment-services' | 'employers' | 'candidates' | 'sales' | 'rpo' | 'addons';

export interface DashboardMetadata {
  id: DashboardType;
  name: string;
  description: string;
  icon: LucideIcon;
  defaultRoute: string;
  availableWidgets: WidgetType[];
}

export const DASHBOARD_METADATA: Record<DashboardType, DashboardMetadata> = {
  overview: {
    id: 'overview',
    name: 'Overview',
    description: 'Executive summary across all business areas',
    icon: LayoutGrid,
    defaultRoute: '/dashboard/overview',
    availableWidgets: [
      'stat-active-jobs',
      'stat-total-employees',
      'stat-total-revenue',
      'stat-active-projects',
      'stat-ai-interview-total',
      'stat-ai-interview-completion',
      'stat-ai-interview-avg-score',
      'stat-ai-interview-avg-duration',
      'chart-ai-interview-performance',
      'stat-total-checks',
      'stat-active-checks',
      'stat-completion-rate',
      'chart-hiring-trends',
      'chart-revenue-expense',
      'chart-employee-distribution',
      'chart-project-pipeline',
      'chart-check-type-distribution',
      'widget-pending-actions',
      'activity-feed'
    ]
  },
  jobs: {
    id: 'jobs',
    name: 'Jobs',
    description: 'Track hiring pipeline and recruitment metrics',
    icon: Briefcase,
    defaultRoute: '/dashboard/jobs',
    availableWidgets: [
      'stat-active-jobs',
      'stat-total-candidates',
      'stat-applications',
      'stat-hired',
      'stat-ai-interview-total',
      'stat-ai-interview-completion',
      'stat-ai-interview-avg-score',
      'chart-ai-interview-performance',
      'chart-hiring-trends',
      'chart-application-funnel',
      'chart-job-distribution',
      'chart-source-of-hire',
      'activity-feed'
    ]
  },
  hrms: {
    id: 'hrms',
    name: 'HRMS',
    description: 'Employee management and workforce analytics',
    icon: UserCheck,
    defaultRoute: '/dashboard/hrms',
    availableWidgets: [
      'stat-total-employees',
      'stat-attendance-rate',
      'stat-leave-requests',
      'stat-department-count',
      'chart-attendance-trends',
      'chart-employee-distribution',
      'chart-leave-analysis',
      'chart-performance-overview',
      'activity-feed'
    ]
  },
  financial: {
    id: 'financial',
    name: 'Financial',
    description: 'Financial performance and HRMS cost analysis',
    icon: DollarSign,
    defaultRoute: '/dashboard/financial',
    availableWidgets: [
      'stat-total-revenue',
      'stat-total-expenses',
      'stat-profit-margin',
      'stat-payroll-cost',
      'chart-revenue-expense',
      'chart-budget-analysis',
      'chart-cost-breakdown',
      'chart-payroll-trends',
      'activity-feed'
    ]
  },
  consulting: {
    id: 'consulting',
    name: 'Consultants',
    description: 'Project pipeline and consulting operations',
    icon: Handshake,
    defaultRoute: '/dashboard/consulting',
    availableWidgets: [
      'stat-active-projects',
      'stat-total-clients',
      'stat-utilization-rate',
      'stat-billable-hours',
      'chart-project-pipeline',
      'chart-client-distribution',
      'chart-resource-allocation',
      'chart-revenue-forecast',
      'activity-feed'
    ]
  },
  'recruitment-services': {
    id: 'recruitment-services',
    name: 'Recruitment Services',
    description: 'Track all recruitment service projects and performance',
    icon: Target,
    defaultRoute: '/dashboard/recruitment-services',
    availableWidgets: [
      'stat-active-service-projects',
      'stat-shortlisting-projects',
      'stat-fullservice-projects',
      'stat-executive-search-projects',
      'stat-rpo-projects',
      'stat-service-revenue',
      'stat-avg-success-rate',
      'stat-projects-completed',
      'chart-service-pipeline',
      'chart-service-type-distribution',
      'chart-consultant-performance',
      'chart-service-revenue-trends',
      'chart-project-completion-rate',
      'activity-feed'
    ]
  },
  employers: {
    id: 'employers',
    name: 'Employers',
    description: 'Track employer relationships, contracts, and revenue',
    icon: Building2,
    defaultRoute: '/dashboard/employers',
    availableWidgets: [
      'stat-total-clients',
      'stat-active-projects',
      'stat-total-revenue',
      'stat-profit-margin',
      'chart-client-distribution',
      'chart-revenue-expense',
      'chart-budget-analysis',
      'activity-feed'
    ]
  },
  candidates: {
    id: 'candidates',
    name: 'Candidates',
    description: 'Track candidate pipeline and talent pool analytics',
    icon: Users,
    defaultRoute: '/dashboard/candidates',
    availableWidgets: [
      'stat-total-candidates',
      'stat-active-candidates',
      'stat-placed-candidates',
      'stat-candidate-conversion-rate',
      'stat-ai-interview-total',
      'stat-ai-interview-avg-score',
      'chart-ai-interview-performance',
      'chart-candidate-pipeline',
      'chart-candidate-source-distribution',
      'chart-candidate-experience-breakdown',
      'chart-candidate-placement-trends',
      'chart-top-skills-demand',
      'chart-salary-expectations',
      'activity-feed'
    ]
  },
  sales: {
    id: 'sales',
    name: 'Sales',
    description: 'Track sales opportunities, pipeline, and forecasts',
    icon: TrendingUp,
    defaultRoute: '/dashboard/sales',
    availableWidgets: [
      'stat-total-revenue',
      'stat-active-projects',
      'chart-revenue-expense',
      'activity-feed'
    ]
  },
  rpo: {
    id: 'rpo',
    name: 'RPO',
    description: 'Recruitment Process Outsourcing operations',
    icon: UserRound,
    defaultRoute: '/dashboard/rpo',
    availableWidgets: [
      'stat-active-projects',
      'stat-total-candidates',
      'chart-hiring-trends',
      'activity-feed'
    ]
  },
  'addons': {
    id: 'addons',
    name: 'Add-ons',
    description: 'AI Interviews, Assessments, and Background Checks revenue and performance',
    icon: Package,
    defaultRoute: '/dashboard/addons',
    availableWidgets: [
      'stat-ai-interview-total',
      'stat-ai-interview-completion',
      'stat-ai-interview-avg-score',
      'stat-ai-interview-avg-duration',
      'chart-ai-interview-performance',
      'stat-total-checks',
      'stat-active-checks',
      'stat-completion-rate',
      'stat-avg-completion-time',
      'widget-pending-actions',
      'chart-check-type-distribution',
      'chart-status-distribution',
      'widget-recent-activity',
      'activity-feed'
    ]
  }
};
