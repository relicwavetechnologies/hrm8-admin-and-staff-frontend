import { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface PillGroupProps {
  children: ReactNode;
  className?: string;
  compact?: boolean;
}

// Simple wrapper to align pill buttons consistently across pages
export function PillGroup({ children, className, compact = true }: PillGroupProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border bg-muted/40 px-1 py-1 shadow-sm max-w-full overflow-x-auto whitespace-nowrap",
        compact && "[&>*]:h-8 [&>*]:px-3",
        className
      )}
    >
      {children}
    </div>
  );
}
