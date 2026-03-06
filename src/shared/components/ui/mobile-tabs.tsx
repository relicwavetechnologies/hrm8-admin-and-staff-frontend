import * as React from 'react';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { cn } from '@/shared/lib/utils';

interface MobileTabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const MobileTabsContext = React.createContext<MobileTabsContextValue | undefined>(undefined);

interface MobileTabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function MobileTabs({ value, onValueChange, children, className }: MobileTabsProps) {
  return (
    <MobileTabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn('w-full', className)}>{children}</div>
    </MobileTabsContext.Provider>
  );
}

interface MobileTabsListProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileTabsList({ children, className }: MobileTabsListProps) {
  return (
    <ScrollArea className="w-full">
      <div
        className={cn(
          'flex gap-1 p-1 bg-muted rounded-lg overflow-x-auto scrollbar-hide',
          className
        )}
      >
        {children}
      </div>
    </ScrollArea>
  );
}

interface MobileTabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function MobileTabsTrigger({ value, children, className }: MobileTabsTriggerProps) {
  const context = React.useContext(MobileTabsContext);
  if (!context) throw new Error('MobileTabsTrigger must be used within MobileTabs');

  const isActive = context.value === value;

  return (
    <button
      onClick={() => context.onValueChange(value)}
      className={cn(
        'flex-shrink-0 px-4 py-2.5 text-sm font-medium rounded-md transition-all',
        'min-h-[44px] touch-manipulation whitespace-nowrap',
        isActive
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground',
        className
      )}
    >
      {children}
    </button>
  );
}

interface MobileTabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function MobileTabsContent({ value, children, className }: MobileTabsContentProps) {
  const context = React.useContext(MobileTabsContext);
  if (!context) throw new Error('MobileTabsContent must be used within MobileTabs');

  if (context.value !== value) return null;

  return <div className={cn('mt-4', className)}>{children}</div>;
}
