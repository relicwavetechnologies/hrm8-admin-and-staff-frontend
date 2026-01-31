import {
  Eye, Plus, Filter, Download, Settings,
  Users, Briefcase, FileText, UserCheck, Building2,
  DollarSign, Calendar, FolderKanban, UserCircle,
  TrendingUp, BarChart3, Mail, Target
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface CardAction {
  label: string;
  icon: LucideIcon;
  path?: string;
  action?: () => void;
}

export interface CardActionMap {
  [cardTitle: string]: {
    icon: LucideIcon;
    actions?: CardAction[];
  };
}

// Dashboard-specific action mappings
export const OVERVIEW_DASHBOARD_ACTIONS: CardActionMap = {
  'Active Jobs': {
    icon: Briefcase,
    actions: [
      { label: 'View all jobs', icon: Eye, path: '/ats/jobs' },
      { label: 'Create new job', icon: Plus, path: '/ats/jobs?action=create' },
      { label: 'View analytics', icon: BarChart3, path: '/dashboard/ats/jobs' },
      { label: 'Export data', icon: Download },
    ],
  },
  'Total Employees': {
    icon: UserCircle,
    actions: [
      { label: 'View all employees', icon: Users, path: '/candidates' },
      { label: 'Add employee', icon: Plus, path: '/candidates?action=create' },
      { label: 'View org chart', icon: Building2, path: '/analytics' },
      { label: 'Export data', icon: Download },
    ],
  },
  'Total Revenue': {
    icon: DollarSign,
    actions: [
      { label: 'View financial report', icon: BarChart3, path: '/dashboard/financial' },
      { label: 'View trends', icon: TrendingUp, path: '/dashboard/financial' },
      { label: 'Export data', icon: Download },
    ],
  },
  'Active Projects': {
    icon: FolderKanban,
    actions: [
      { label: 'View all projects', icon: Eye, path: '/ats/jobs' },
      { label: 'Create project', icon: Plus, path: '/ats/jobs?action=create' },
      { label: 'View pipeline', icon: Filter, path: '/ats/jobs?view=pipeline' },
      { label: 'Export data', icon: Download },
    ],
  },
};

export const JOBS_DASHBOARD_ACTIONS: CardActionMap = {
  'Active Jobs': {
    icon: Briefcase,
    actions: [
      { label: 'View all jobs', icon: Eye, path: '/ats/jobs' },
      { label: 'Create new job', icon: Plus, path: '/ats/jobs?action=create' },
      { label: 'View pipeline', icon: Filter, path: '/ats/jobs?view=pipeline' },
      { label: 'Export data', icon: Download },
    ],
  },
  'Total Candidates': {
    icon: Users,
    actions: [
      { label: 'Browse candidates', icon: Users, path: '/candidates' },
      { label: 'Add candidate', icon: Plus, path: '/candidates?action=create' },
      { label: 'View analytics', icon: BarChart3, path: '/dashboard/candidates' },
      { label: 'Export data', icon: Download },
    ],
  },
  'Applications': {
    icon: FileText,
    actions: [
      { label: 'Review pending', icon: FileText, path: '/applications' },
      { label: 'View all', icon: Eye, path: '/applications' },
      { label: 'Export data', icon: Download },
    ],
  },
  'Hired This Month': {
    icon: UserCheck,
    actions: [
      { label: 'View hires', icon: UserCheck, path: '/candidates?status=placed' },
      { label: 'View analytics', icon: BarChart3, path: '/dashboard/ats/jobs' },
    ],
  },
};

export const HRMS_DASHBOARD_ACTIONS: CardActionMap = {
  'Total Employees': {
    icon: UserCircle,
    actions: [
      { label: 'View all employees', icon: Users, path: '/candidates' },
      { label: 'Add employee', icon: Plus, path: '/candidates?action=create' },
      { label: 'View org chart', icon: Building2, path: '/analytics' },
      { label: 'Export data', icon: Download },
    ],
  },
  'Attendance Rate': {
    icon: Calendar,
    actions: [
      { label: 'View details', icon: Eye, path: '/analytics' },
      { label: 'View reports', icon: BarChart3, path: '/analytics' },
      { label: 'Export data', icon: Download },
    ],
  },
  'Leave Requests': {
    icon: FileText,
    actions: [
      { label: 'Review pending', icon: Eye, path: '/applications' },
      { label: 'View all', icon: Filter, path: '/applications' },
      { label: 'Export data', icon: Download },
    ],
  },
  'Departments': {
    icon: Building2,
    actions: [
      { label: 'View all', icon: Eye, path: '/analytics' },
      { label: 'Manage structure', icon: Settings, path: '/analytics' },
    ],
  },
};

export const FINANCIAL_DASHBOARD_ACTIONS: CardActionMap = {
  'Total Revenue': {
    icon: DollarSign,
    actions: [
      { label: 'View financial report', icon: BarChart3, path: '/dashboard/financial' },
      { label: 'View trends', icon: TrendingUp, path: '/dashboard/financial' },
      { label: 'Export data', icon: Download },
    ],
  },
  'Total Expenses': {
    icon: DollarSign,
    actions: [
      { label: 'View breakdown', icon: Eye, path: '/dashboard/financial' },
      { label: 'View analytics', icon: BarChart3, path: '/dashboard/financial' },
      { label: 'Export data', icon: Download },
    ],
  },
  'Profit Margin': {
    icon: DollarSign,
    actions: [
      { label: 'View details', icon: Eye, path: '/dashboard/financial' },
      { label: 'View trends', icon: TrendingUp, path: '/dashboard/financial' },
    ],
  },
  'Payroll Cost': {
    icon: DollarSign,
    actions: [
      { label: 'View breakdown', icon: Eye, path: '/dashboard/financial' },
      { label: 'View reports', icon: BarChart3, path: '/dashboard/financial' },
      { label: 'Export data', icon: Download },
    ],
  },
};

export const CONSULTING_DASHBOARD_ACTIONS: CardActionMap = {
  'Active Projects': {
    icon: FolderKanban,
    actions: [
      { label: 'View all projects', icon: Eye, path: '/ats/jobs' },
      { label: 'Create project', icon: Plus, path: '/ats/jobs?action=create' },
      { label: 'View pipeline', icon: Filter, path: '/ats/jobs?view=pipeline' },
    ],
  },
  'Total Clients': {
    icon: Building2,
    actions: [
      { label: 'View all clients', icon: Eye, path: '/employers' },
      { label: 'Add client', icon: Plus, path: '/employers?action=create' },
      { label: 'Export data', icon: Download },
    ],
  },
  'Utilization Rate': {
    icon: Users,
    actions: [
      { label: 'View details', icon: Eye, path: '/analytics' },
      { label: 'View reports', icon: BarChart3, path: '/analytics' },
    ],
  },
  'Billable Hours': {
    icon: Calendar,
    actions: [
      { label: 'View timesheet', icon: Eye, path: '/analytics' },
      { label: 'Export data', icon: Download },
    ],
  },
};

export const RPO_DASHBOARD_ACTIONS: CardActionMap = {
  'Active Assignments': {
    icon: FolderKanban,
    actions: [
      { label: 'View all', icon: Eye, path: '/ats/jobs' },
      { label: 'Create assignment', icon: Plus, path: '/ats/jobs?action=create' },
      { label: 'View pipeline', icon: Filter, path: '/ats/jobs?view=pipeline' },
    ],
  },
  'Active Projects': {
    icon: FolderKanban,
    actions: [
      { label: 'View all', icon: Eye, path: '/ats/jobs' },
      { label: 'Create assignment', icon: Plus, path: '/ats/jobs?action=create' },
      { label: 'View pipeline', icon: Filter, path: '/ats/jobs?view=pipeline' },
    ],
  },
  'Candidate Pipeline': {
    icon: Users,
    actions: [
      { label: 'View pipeline', icon: Eye, path: '/candidates' },
      { label: 'Add candidate', icon: Plus, path: '/candidates?action=create' },
      { label: 'View analytics', icon: BarChart3, path: '/dashboard/candidates' },
    ],
  },
  'Total Candidates': {
    icon: Users,
    actions: [
      { label: 'View pipeline', icon: Eye, path: '/candidates' },
      { label: 'Add candidate', icon: Plus, path: '/candidates?action=create' },
      { label: 'View analytics', icon: BarChart3, path: '/dashboard/candidates' },
    ],
  },
  'Time to Fill': {
    icon: Calendar,
    actions: [
      { label: 'View metrics', icon: Eye, path: '/analytics' },
      { label: 'View trends', icon: TrendingUp, path: '/analytics' },
    ],
  },
  'Client Satisfaction': {
    icon: Building2,
    actions: [
      { label: 'View feedback', icon: Eye, path: '/employers' },
      { label: 'View reports', icon: BarChart3, path: '/analytics' },
    ],
  },
};

export const CANDIDATES_DASHBOARD_ACTIONS: CardActionMap = {
  'Total Candidates': {
    icon: Users,
    actions: [
      { label: 'View all candidates', icon: Eye, path: '/candidates' },
      { label: 'Add candidate', icon: Plus, path: '/candidates?action=create' },
      { label: 'Import candidates', icon: Download, path: '/candidates' },
      { label: 'Export data', icon: Download },
    ],
  },
  'Active': {
    icon: UserCheck,
    actions: [
      { label: 'View active', icon: Eye, path: '/candidates?status=active' },
      { label: 'View analytics', icon: BarChart3, path: '/dashboard/candidates' },
    ],
  },
  'Active Candidates': {
    icon: UserCheck,
    actions: [
      { label: 'View active', icon: Eye, path: '/candidates?status=active' },
      { label: 'View analytics', icon: BarChart3, path: '/dashboard/candidates' },
    ],
  },
  'Placed': {
    icon: Briefcase,
    actions: [
      { label: 'View placed', icon: Eye, path: '/candidates?status=placed' },
      { label: 'View success metrics', icon: TrendingUp, path: '/dashboard/candidates' },
    ],
  },
  'Placed Candidates': {
    icon: Briefcase,
    actions: [
      { label: 'View placed', icon: Eye, path: '/candidates?status=placed' },
      { label: 'View success metrics', icon: TrendingUp, path: '/dashboard/candidates' },
    ],
  },
  'Inactive': {
    icon: UserCircle,
    actions: [
      { label: 'View inactive', icon: Eye, path: '/candidates?status=inactive' },
      { label: 'Re-engage campaign', icon: Mail },
    ],
  },
  'Conversion Rate': {
    icon: TrendingUp,
    actions: [
      { label: 'View metrics', icon: Eye, path: '/dashboard/candidates' },
      { label: 'View trends', icon: BarChart3, path: '/analytics' },
    ],
  },
};

export const EMPLOYERS_DASHBOARD_ACTIONS: CardActionMap = {
  'Total Employers': {
    icon: Building2,
    actions: [
      { label: 'View all', icon: Eye, path: '/employers' },
      { label: 'Add employer', icon: Plus, path: '/employers?action=create' },
      { label: 'Export data', icon: Download },
    ],
  },
  'Active Clients': {
    icon: Building2,
    actions: [
      { label: 'View active', icon: Eye, path: '/employers?status=active' },
      { label: 'View analytics', icon: BarChart3, path: '/dashboard/employers' },
    ],
  },
  'Active Accounts': {
    icon: Building2,
    actions: [
      { label: 'View active', icon: Eye, path: '/employers?status=active' },
      { label: 'View analytics', icon: BarChart3, path: '/dashboard/employers' },
    ],
  },
  'Active Jobs': {
    icon: Briefcase,
    actions: [
      { label: 'View jobs', icon: Eye, path: '/ats/jobs?status=open' },
      { label: 'Post job', icon: Plus, path: '/ats/jobs?action=create' },
    ],
  },
  'Total Revenue': {
    icon: DollarSign,
    actions: [
      { label: 'View breakdown', icon: Eye, path: '/dashboard/financial' },
      { label: 'View trends', icon: TrendingUp, path: '/dashboard/financial' },
    ],
  },
  'Monthly Revenue': {
    icon: DollarSign,
    actions: [
      { label: 'View breakdown', icon: Eye, path: '/dashboard/financial' },
      { label: 'View trends', icon: TrendingUp, path: '/dashboard/financial' },
    ],
  },
  'Profit Margin': {
    icon: TrendingUp,
    actions: [
      { label: 'View details', icon: Eye, path: '/dashboard/financial' },
      { label: 'View trends', icon: TrendingUp, path: '/dashboard/financial' },
    ],
  },
};

export const SALES_DASHBOARD_ACTIONS: CardActionMap = {
  'Active Opportunities': {
    icon: FolderKanban,
    actions: [
      { label: 'View pipeline', icon: Eye, path: '/employers' },
      { label: 'Create opportunity', icon: Plus, path: '/employers?action=create' },
      { label: 'View analytics', icon: BarChart3, path: '/dashboard/sales' },
    ],
  },
  'Active Projects': {
    icon: FolderKanban,
    actions: [
      { label: 'View pipeline', icon: Eye, path: '/employers' },
      { label: 'Create opportunity', icon: Plus, path: '/employers?action=create' },
      { label: 'View analytics', icon: BarChart3, path: '/dashboard/sales' },
    ],
  },
  'Revenue Forecast': {
    icon: DollarSign,
    actions: [
      { label: 'View forecast', icon: TrendingUp, path: '/dashboard/sales' },
      { label: 'View breakdown', icon: Eye, path: '/dashboard/financial' },
    ],
  },
  'Total Revenue': {
    icon: DollarSign,
    actions: [
      { label: 'View breakdown', icon: Eye, path: '/dashboard/financial' },
      { label: 'View trends', icon: TrendingUp, path: '/dashboard/financial' },
    ],
  },
  'Win Rate': {
    icon: TrendingUp,
    actions: [
      { label: 'View metrics', icon: Eye, path: '/dashboard/sales' },
      { label: 'View trends', icon: BarChart3, path: '/analytics' },
    ],
  },
  'Active Leads': {
    icon: Users,
    actions: [
      { label: 'View all leads', icon: Eye, path: '/employers' },
      { label: 'Add lead', icon: Plus, path: '/employers?action=create' },
      { label: 'Contact leads', icon: Mail },
    ],
  },
};

export const RECRUITMENT_SERVICES_DASHBOARD_ACTIONS: CardActionMap = {
  'Active Projects': {
    icon: FolderKanban,
    actions: [
      { label: 'View all projects', icon: Eye, path: '/recruitment-services' },
      { label: 'Create project', icon: Plus, path: '/recruitment-services?action=create' },
      { label: 'View pipeline', icon: Filter, path: '/recruitment-services' },
    ],
  },
  'Shortlisting': {
    icon: Users,
    actions: [
      { label: 'View shortlisting projects', icon: Eye, path: '/recruitment-services?type=shortlisting' },
      { label: 'Create project', icon: Plus, path: '/recruitment-services?action=create&type=shortlisting' },
      { label: 'View candidates', icon: Users, path: '/candidates' },
    ],
  },
  'Full-Service': {
    icon: Briefcase,
    actions: [
      { label: 'View full-service projects', icon: Eye, path: '/recruitment-services?type=full-service' },
      { label: 'Create project', icon: Plus, path: '/recruitment-services?action=create&type=full-service' },
      { label: 'View pipeline', icon: Filter, path: '/recruitment-services' },
    ],
  },
  'Executive Search': {
    icon: Target,
    actions: [
      { label: 'View executive projects', icon: Eye, path: '/recruitment-services?type=executive-search' },
      { label: 'Create project', icon: Plus, path: '/recruitment-services?action=create&type=executive-search' },
      { label: 'View candidates', icon: Users, path: '/candidates' },
    ],
  },
};

// Helper function to get actions for a card based on dashboard type
export function getCardActions(
  cardTitle: string,
  dashboardType: string
): { icon: LucideIcon; actions?: CardAction[] } | null {
  const actionMaps: Record<string, CardActionMap> = {
    overview: OVERVIEW_DASHBOARD_ACTIONS,
    jobs: JOBS_DASHBOARD_ACTIONS,
    hrms: HRMS_DASHBOARD_ACTIONS,
    financial: FINANCIAL_DASHBOARD_ACTIONS,
    consulting: CONSULTING_DASHBOARD_ACTIONS,
    rpo: RPO_DASHBOARD_ACTIONS,
    candidates: CANDIDATES_DASHBOARD_ACTIONS,
    employers: EMPLOYERS_DASHBOARD_ACTIONS,
    sales: SALES_DASHBOARD_ACTIONS,
    'recruitment-services': RECRUITMENT_SERVICES_DASHBOARD_ACTIONS,
  };

  const actionMap = actionMaps[dashboardType];
  return actionMap?.[cardTitle] || null;
}
