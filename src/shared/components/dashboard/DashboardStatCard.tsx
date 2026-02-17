import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

export interface DashboardStatCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: LucideIcon;
    trend?: "up" | "down";
    trendValue?: string;
    onClick?: () => void;
    loading?: boolean;
}

function SkeletonCard() {
    return (
        <Card className="@container/card">
            <CardHeader>
                <div className="space-y-3 animate-pulse">
                    <div className="h-4 w-24 bg-muted rounded" />
                    <div className="h-8 w-32 bg-muted rounded" />
                </div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
            </CardFooter>
        </Card>
    );
}

export function DashboardStatCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    trendValue,
    onClick,
    loading = false,
}: DashboardStatCardProps) {
    if (loading) {
        return <SkeletonCard />;
    }

    return (
        <Card
            className={cn(
                "@container/card bg-gradient-to-t from-primary/5 to-card shadow-xs dark:bg-card transition-all",
                onClick && "cursor-pointer hover:shadow-md"
            )}
            onClick={onClick}
        >
            <CardHeader className="relative">
                <CardDescription>{title}</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    {value}
                </CardTitle>
                {trendValue && (
                    <CardAction>
                        <Badge variant="outline" className="gap-1">
                            {trend === "up" ? (
                                <TrendingUp className="h-3 w-3" />
                            ) : trend === "down" ? (
                                <TrendingDown className="h-3 w-3" />
                            ) : null}
                            {trendValue}
                        </Badge>
                    </CardAction>
                )}
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
                {description && (
                    <>
                        <div className="line-clamp-1 flex gap-2 font-medium items-center">
                            <Icon className="h-4 w-4" />
                            {description}
                        </div>
                        {onClick && (
                            <div className="text-muted-foreground text-xs">
                                Click to view details
                            </div>
                        )}
                    </>
                )}
            </CardFooter>
        </Card>
    );
}
