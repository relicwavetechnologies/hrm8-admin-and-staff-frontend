import { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';

export interface NestedSidebarItem {
  id: string;
  label: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface NestedSidebarLayoutProps {
  title: string;
  subtitle?: string;
  backPath?: string;
  backLabel?: string;
  items: NestedSidebarItem[];
  children: ReactNode;
}

export function NestedSidebarLayout({
  title,
  subtitle,
  backPath,
  backLabel = 'Back',
  items,
  children,
}: NestedSidebarLayoutProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    if (location.pathname === path) return true;
    return location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="flex flex-1 min-h-0">
      <aside className="hidden lg:flex w-[272px] shrink-0 border-r bg-card/40 sticky top-0 self-start max-h-[calc(100svh-8rem)]">
        <div className="w-full p-3 space-y-3">
          {backPath && (
            <Button variant="ghost" className="justify-start px-2" asChild>
              <NavLink to={backPath}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {backLabel}
              </NavLink>
            </Button>
          )}

          <div className="px-2">
            <h2 className="text-lg font-semibold">{title}</h2>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>

          <nav className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                    isActive(item.path)
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </aside>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
