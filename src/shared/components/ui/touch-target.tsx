import React from 'react';
import { cn } from '@/shared/lib/utils';

interface TouchTargetProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'min-h-[40px] min-w-[40px]',
  md: 'min-h-[44px] min-w-[44px]',
  lg: 'min-h-[48px] min-w-[48px]',
};

export const TouchTarget = React.forwardRef<HTMLDivElement, TouchTargetProps>(
  ({ children, size = 'md', className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-center touch-manipulation',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TouchTarget.displayName = 'TouchTarget';
