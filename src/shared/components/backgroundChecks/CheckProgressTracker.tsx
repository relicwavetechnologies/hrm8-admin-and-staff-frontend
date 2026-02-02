import { Check, Circle, Clock } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { BackgroundCheck } from '@/types/backgroundCheck';

interface CheckProgressTrackerProps {
  check: BackgroundCheck;
}

export function CheckProgressTracker({ check }: CheckProgressTrackerProps) {
  const steps = [
    {
      label: 'Check Initiated',
      completed: true,
      date: check.initiatedDate,
    },
    {
      label: 'Consent Received',
      completed: check.consentGiven,
      date: check.consentDate,
    },
    {
      label: 'Checks In Progress',
      completed: check.status === 'in-progress' || check.status === 'completed',
      inProgress: check.status === 'in-progress',
    },
    {
      label: 'Review Completed',
      completed: check.status === 'completed',
      date: check.completedDate,
    },
  ];

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={index} className="flex items-start gap-4">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors',
                step.completed
                  ? 'border-primary bg-primary text-primary-foreground'
                  : step.inProgress
                  ? 'border-primary bg-background text-primary animate-pulse'
                  : 'border-muted bg-background text-muted-foreground'
              )}
            >
              {step.completed ? (
                <Check className="h-4 w-4" />
              ) : step.inProgress ? (
                <Clock className="h-4 w-4" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'h-12 w-0.5 transition-colors',
                  step.completed ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </div>
          <div className="flex-1 pb-8">
            <p
              className={cn(
                'font-medium',
                step.completed || step.inProgress
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {step.label}
            </p>
            {step.date && (
              <p className="text-sm text-muted-foreground mt-1">
                {new Date(step.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
