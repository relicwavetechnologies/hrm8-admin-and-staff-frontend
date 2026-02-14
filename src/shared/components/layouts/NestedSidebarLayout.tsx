import { ReactNode, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ArrowLeft, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';


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
  const storageKey = `nested-sidebar-collapsed:${title}`;
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    setCollapsed(stored === '1');
  }, [storageKey]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(storageKey, next ? '1' : '0');
      return next;
    });
  };

  const isActive = (path: string) => {
    if (location.pathname === path) return true;
    return location.pathname.startsWith(`${path}/`);
  };

  return (
    <TooltipProvider>
      <div className="flex flex-1 min-h-0">
        <aside className={cn(
          "hidden lg:flex shrink-0 border-r bg-card/40 sticky top-0 self-start max-h-[calc(100svh-8rem)] transition-all duration-200",
          collapsed ? "w-[76px]" : "w-[272px]"
        )}>
          <div className="w-full p-3 space-y-3">
            <div className={cn("flex", collapsed ? "flex-col gap-2 items-center" : "flex-row items-center justify-between")}>
              {backPath && (
                collapsed ? (
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" asChild>
                        <NavLink to={backPath}>
                          <ArrowLeft className="h-4 w-4" />
                        </NavLink>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">{backLabel}</TooltipContent>
                  </Tooltip>
                ) : (
                  <Button variant="ghost" className="px-2 justify-start" asChild>
                    <NavLink to={backPath}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      {backLabel}
                    </NavLink>
                  </Button>
                )
              )}

              {collapsed ? (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleCollapsed}
                    >
                      <PanelLeftOpen className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Expand sidebar</TooltipContent>
                </Tooltip>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleCollapsed}
                  title="Collapse sidebar"
                  className={cn(!backPath && "ml-auto")}
                >
                  <PanelLeftClose className="h-4 w-4" />
                </Button>
              )}
            </div>

            {!collapsed && (
              <div className="px-2">
                <h2 className="text-lg font-semibold">{title}</h2>
                {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
              </div>
            )}

            <nav className="space-y-1">
              {items.map((item) => {
                const Icon = item.icon;
                const LinkContent = (
                  <NavLink
                    to={item.path}
                    className={cn(
                      'flex items-center rounded-md px-3 py-2 text-sm transition-colors',
                      collapsed ? 'justify-center gap-0' : 'gap-2',
                      isActive(item.path)
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                );

                if (collapsed) {
                  return (
                    <Tooltip key={item.id} delayDuration={0}>
                      <TooltipTrigger asChild>
                        {LinkContent}
                      </TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  );
                }

                return <div key={item.id}>{LinkContent}</div>;
              })}
            </nav>
          </div>
        </aside>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </TooltipProvider>
  );
}
