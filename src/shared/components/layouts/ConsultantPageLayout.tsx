import { ReactNode } from 'react';
import { ConsultantHeader } from './ConsultantHeader';

interface ConsultantPageLayoutProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  breadcrumbActions?: ReactNode;
  fullWidth?: boolean;
}

export function ConsultantPageLayout({
  title,
  subtitle,
  actions,
  children,
  breadcrumbActions,
  fullWidth = true,
}: ConsultantPageLayoutProps) {
  return (
    <>
      <ConsultantHeader breadcrumbActions={breadcrumbActions} />

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

































