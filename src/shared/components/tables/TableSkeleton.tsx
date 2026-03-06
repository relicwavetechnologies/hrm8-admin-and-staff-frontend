import { Skeleton } from '@/shared/components/ui/skeleton';

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
  hasSearch?: boolean;
}

export function TableSkeleton({ columns = 5, rows = 5, hasSearch = true }: TableSkeletonProps) {
  return (
    <div className="space-y-4">
      {hasSearch && (
        <div className="flex items-center justify-between py-4">
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-8 w-[100px]" />
        </div>
      )}
      <div className="rounded-md border">
        <div className="border-b px-4 py-3">
          <div className="flex items-center space-x-4">
            {[...Array(columns)].map((_, i) => (
              <Skeleton key={i} className={`h-4 w-[${Math.floor(Math.random() * (150 - 80 + 1)) + 80}px]`} />
            ))}
          </div>
        </div>
        {[...Array(rows)].map((_, rowIndex) => (
          <div key={rowIndex} className="flex items-center space-x-4 border-b px-4 py-4 last:border-0">
            {[...Array(columns)].map((_, colIndex) => (
              <Skeleton key={colIndex} className={`h-4 w-[${Math.floor(Math.random() * (150 - 80 + 1)) + 80}px]`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
