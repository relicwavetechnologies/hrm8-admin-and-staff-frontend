import { Skeleton } from "@/shared/components/ui/skeleton";

export function DashboardSkeleton() {
    return (
        <div className="p-6 space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                </div>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </div>
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                ))}
            </div>

            {/* Main Content Skeleton (Charts/Tables) */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-[300px] w-full" />
                </div>
                <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-[300px] w-full" />
                </div>
            </div>
        </div>
    );
}
