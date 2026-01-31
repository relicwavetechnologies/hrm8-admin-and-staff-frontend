import { ReactNode } from 'react';
// import { DashboardHeader } from './DashboardHeader';
// import { DashboardSelector } from '@/shared/components/dashboard/DashboardSelector';
// import { useCurrentDashboard } from '@/shared/hooks/useCurrentDashboard';
// import { OnboardingReminderBanner } from '@/shared/components/onboarding/OnboardingReminderBanner';

interface DashboardPageLayoutProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  breadcrumbActions?: ReactNode;
  fullWidth?: boolean;
  dashboardActions?: ReactNode;
}

export function DashboardPageLayout({
  title,
  subtitle,
  actions,
  children,
  // breadcrumbActions,
  fullWidth = true,
  // dashboardActions
}: DashboardPageLayoutProps) {
  // const currentDashboard = useCurrentDashboard();

  return (
    <>
      {/* <DashboardHeader breadcrumbActions={breadcrumbActions} /> */}

      {/* Onboarding Reminder Banner - shows when profile is incomplete */}
      {/* <OnboardingReminderBanner /> */}

      {/* Persistent Dashboard Selector */}
      {/* {currentDashboard && (
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="w-full px-12 py-3">
            <div className="flex items-center justify-between">
              <DashboardSelector currentDashboard={currentDashboard} />
              {dashboardActions && <div>{dashboardActions}</div>}
            </div>
          </div>
        </div>
      )} */}

      <div className="flex-1">
        {(title || subtitle || actions) && (
          <div className="p-12 pb-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                {title && <h1 className="text-3xl font-bold">{title}</h1>}
                {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
              </div>
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
          </div>
        )}
        <div className={fullWidth ? "w-full" : "container"}>
          {children}
        </div>
      </div>
    </>
  );
}
