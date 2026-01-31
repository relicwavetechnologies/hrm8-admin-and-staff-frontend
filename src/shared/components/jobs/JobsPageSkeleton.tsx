import { Skeleton } from "@/shared/components/ui/skeleton";
import { Card } from "@/shared/components/ui/card";

export function JobsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-5 rounded" />
            </div>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
          </Card>
        ))}
      </div>

      {/* Filter Bar Skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Table Skeleton */}
      <Card>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 pb-2 border-b">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 col-span-3" />
              <Skeleton className="h-4 col-span-2" />
              <Skeleton className="h-4 col-span-2" />
              <Skeleton className="h-4 col-span-2" />
              <Skeleton className="h-4 col-span-2" />
            </div>
            {/* Table Rows */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="grid grid-cols-12 gap-4 py-3 border-b last:border-0">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 col-span-3" />
                <Skeleton className="h-4 col-span-2" />
                <Skeleton className="h-4 col-span-2" />
                <Skeleton className="h-4 col-span-2" />
                <Skeleton className="h-4 col-span-2" />
              </div>
            ))}
          </div>
        </div>
        {/* Pagination Skeleton */}
        <div className="p-4 border-t flex items-center justify-between">
          <Skeleton className="h-4 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
      </Card>
    </div>
  );
}



















