import { Skeleton } from "@/shared/components/ui/skeleton";

export function DetailSkeleton() {
    return (
        <div className="p-6 space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between border-b pb-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-20" />
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Column */}
                <div className="md:col-span-2 space-y-6">
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4">
                        <Skeleton className="h-6 w-32" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    </div>
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4">
                        <Skeleton className="h-6 w-32" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4">
                        <Skeleton className="h-6 w-24" />
                        <div className="space-y-3">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
