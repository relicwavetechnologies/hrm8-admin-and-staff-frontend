import React from 'react';
import { cn } from '@/shared/lib/utils';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: Date;
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn('relative space-y-6', className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const variantClasses = {
          default: 'bg-primary text-primary-foreground',
          success: 'bg-success text-success-foreground',
          warning: 'bg-warning text-warning-foreground',
          destructive: 'bg-destructive text-destructive-foreground',
        };

        return (
          <div key={item.id} className="relative pl-12">
            {/* Vertical line */}
            {!isLast && (
              <div className="absolute left-3 top-7 bottom-0 w-px bg-border" />
            )}

            {/* Icon circle */}
            <div
              className={cn(
                'absolute left-0 top-1.5 w-6 h-6 rounded-full flex items-center justify-center',
                variantClasses[item.variant || 'default']
              )}
            >
              {item.icon}
            </div>

            {/* Content */}
            <div className="space-y-1">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-medium leading-5">{item.title}</h4>
                <time className="text-xs text-muted-foreground whitespace-nowrap">
                  {item.timestamp.toLocaleDateString()} {item.timestamp.toLocaleTimeString()}
                </time>
              </div>
              {item.description && (
                <p className="text-sm text-muted-foreground leading-5">{item.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}