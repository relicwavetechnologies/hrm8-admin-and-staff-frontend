import { EnhancedStatCard } from './EnhancedStatCard';
import { HiringTrendsChart } from './charts/HiringTrendsChart';
import { ApplicationFunnelChart } from './charts/ApplicationFunnelChart';
import { JobDistributionChart } from './charts/JobDistributionChart';
import { SourceOfHireChart } from './charts/SourceOfHireChart';
import { ServicePipelineChart } from './charts/ServicePipelineChart';
import { ServiceTypeDistributionChart } from './charts/ServiceTypeDistributionChart';
import { ConsultantPerformanceChart } from './charts/ConsultantPerformanceChart';
import { ServiceRevenueTrendsChart } from './charts/ServiceRevenueTrendsChart';
import { ProjectCompletionRateChart } from './charts/ProjectCompletionRateChart';
import { AttendanceTrendsChart } from './charts/AttendanceTrendsChart';
import { EmployeeDistributionChart } from './charts/EmployeeDistributionChart';
import { LeaveAnalysisChart } from './charts/LeaveAnalysisChart';
import { PerformanceOverviewChart } from './charts/PerformanceOverviewChart';
import { RevenueExpenseChart } from './charts/RevenueExpenseChart';
import { BudgetAnalysisChart } from './charts/BudgetAnalysisChart';
import { CostBreakdownChart } from './charts/CostBreakdownChart';
import { PayrollTrendsChart } from './charts/PayrollTrendsChart';
import { ProjectPipelineChart } from './charts/ProjectPipelineChart';
import { ClientDistributionChart } from './charts/ClientDistributionChart';
import { ResourceAllocationChart } from './charts/ResourceAllocationChart';
import { RevenueForecastChart } from './charts/RevenueForecastChart';
import { CandidatePipelineChart } from './charts/CandidatePipelineChart';
import { CandidateSourceDistributionChart } from './charts/CandidateSourceDistributionChart';
import { CandidateExperienceBreakdownChart } from './charts/CandidateExperienceBreakdownChart';
import { CandidatePlacementTrendsChart } from './charts/CandidatePlacementTrendsChart';
import { TopSkillsDemandChart } from './charts/TopSkillsDemandChart';
import { SalaryExpectationsChart } from './charts/SalaryExpectationsChart';
import { RecentActivityCard } from './RecentActivityCard';
import { TotalChecksWidget } from '@/shared/components/backgroundChecks/widgets/TotalChecksWidget';
import { ActiveChecksWidget } from '@/shared/components/backgroundChecks/widgets/ActiveChecksWidget';
import { CompletionRateWidget } from '@/shared/components/backgroundChecks/widgets/CompletionRateWidget';
import { AvgCompletionTimeWidget } from '@/shared/components/backgroundChecks/widgets/AvgCompletionTimeWidget';
import { PendingActionsWidget } from '@/shared/components/backgroundChecks/widgets/PendingActionsWidget';
import { CheckTypeDistributionWidget } from '@/shared/components/backgroundChecks/widgets/CheckTypeDistributionWidget';
import { StatusDistributionWidget } from '@/shared/components/backgroundChecks/widgets/StatusDistributionWidget';
import { RecentActivityWidget } from '@/shared/components/backgroundChecks/widgets/RecentActivityWidget';
import { useNavigate } from 'react-router-dom';
import type { DashboardWidget } from '@/shared/lib/dashboard/types';
import { getCardActions } from '@/shared/lib/dashboard/cardActions';

const COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
  EnhancedStatCard,
  HiringTrendsChart,
  ApplicationFunnelChart,
  JobDistributionChart,
  SourceOfHireChart,
  ServicePipelineChart,
  ServiceTypeDistributionChart,
  ConsultantPerformanceChart,
  ServiceRevenueTrendsChart,
  ProjectCompletionRateChart,
  AttendanceTrendsChart,
  EmployeeDistributionChart,
  LeaveAnalysisChart,
  PerformanceOverviewChart,
  RevenueExpenseChart,
  BudgetAnalysisChart,
  CostBreakdownChart,
  PayrollTrendsChart,
  ProjectPipelineChart,
  ClientDistributionChart,
  ResourceAllocationChart,
  RevenueForecastChart,
  CandidatePipelineChart,
  CandidateSourceDistributionChart,
  CandidateExperienceBreakdownChart,
  CandidatePlacementTrendsChart,
  TopSkillsDemandChart,
  SalaryExpectationsChart,
  RecentActivityCard,
  TotalChecksWidget,
  ActiveChecksWidget,
  CompletionRateWidget,
  AvgCompletionTimeWidget,
  PendingActionsWidget,
  CheckTypeDistributionWidget,
  StatusDistributionWidget,
  RecentActivityWidget,
};

interface WidgetRendererProps {
  widget: DashboardWidget;
  dashboardType?: string;
}

export function WidgetRenderer({ widget, dashboardType = 'jobs' }: WidgetRendererProps) {
  const navigate = useNavigate();
  const Component = COMPONENT_MAP[widget.component];

  if (!Component) {
    return (
      <div className="flex items-center justify-center h-full border-2 border-dashed border-border rounded-lg bg-muted/20">
        <p className="text-sm text-muted-foreground">
          Widget not found: {widget.component}
        </p>
      </div>
    );
  }

  // Add navigation and icons to stat cards using cardActions config
  if (widget.component === 'EnhancedStatCard') {
    const cardAction = getCardActions(widget.title, dashboardType);

    if (!cardAction) {
      // Fallback if no card action found
      return <Component {...widget.props} />;
    }

    const Icon = cardAction.icon;
    const icon = <Icon className="h-6 w-6" />;

    // Map card actions to menu items
    const menuItems = cardAction.actions?.map(action => ({
      label: action.label,
      icon: <action.icon className="h-4 w-4" />,
      onClick: action.path ? () => navigate(action.path!) : action.action || (() => { }),
    }));

    // Use first action as primary action button
    const primaryAction = cardAction.actions?.[0];

    return (
      <Component
        {...widget.props}
        icon={icon}
        showAction={!!primaryAction}
        actionLabel={primaryAction?.label || 'View'}
        onAction={primaryAction?.path ? () => navigate(primaryAction.path!) : primaryAction?.action}
        showMenu={!!menuItems && menuItems.length > 0}
        menuItems={menuItems}
      />
    );
  }

  return <Component {...widget.props} />;
}
