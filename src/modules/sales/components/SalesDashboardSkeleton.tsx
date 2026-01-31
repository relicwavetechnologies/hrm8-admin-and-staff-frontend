import { Skeleton } from "@/shared/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";

export function SalesDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* KPI Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-3 w-40" />
          </Card>
        ))}
      </div>

      {/* Pipeline Chart Skeleton */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-1">
            <Skeleton className="h-9 w-9 rounded" />
            <Skeleton className="h-9 w-9 rounded" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="flex justify-between mb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-3 w-full rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
              <div className="flex gap-1">
                <Skeleton className="h-9 w-9 rounded" />
                <Skeleton className="h-9 w-9 rounded" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Data Tables Skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
              <div className="flex gap-1">
                <Skeleton className="h-9 w-9 rounded" />
                <Skeleton className="h-9 w-9 rounded" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Table Header */}
                <div className="grid grid-cols-4 gap-4 pb-2 border-b">
                  <Skeleton className="h-4" />
                  <Skeleton className="h-4" />
                  <Skeleton className="h-4" />
                  <Skeleton className="h-4" />
                </div>
                {/* Table Rows */}
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="grid grid-cols-4 gap-4 py-3 border-b last:border-0">
                    <Skeleton className="h-4" />
                    <Skeleton className="h-4" />
                    <Skeleton className="h-4" />
                    <Skeleton className="h-4" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

