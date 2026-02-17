import { useId, useMemo } from "react";
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
    showBackgroundGraph?: boolean;
    graphData?: number[];
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
    showBackgroundGraph = false,
    graphData,
}: DashboardStatCardProps) {
    if (loading) {
        return <SkeletonCard />;
    }

    const tone: "up" | "down" = trend === "down" ? "down" : "up";
    const graphId = useId().replace(/:/g, "");
    const shouldRenderGraph = Boolean(showBackgroundGraph && graphData && graphData.length > 1);
    const points = shouldRenderGraph ? (graphData as number[]) : [];

    const normalized = useMemo(() => {
        if (points.length < 2) return [];
        const min = Math.min(...points);
        const max = Math.max(...points);
        const range = Math.max(1, max - min);
        const yPadding = 8;
        return points.map((v, i) => {
            const x = (i / (points.length - 1)) * 100;
            const rawY = 100 - ((v - min) / range) * 100;
            const y = Math.min(100 - yPadding, Math.max(yPadding, rawY));
            return { x, y };
        });
    }, [points]);

    const linePath = normalized.length > 1
        ? normalized
        .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
            .join(" ")
        : "";
    const areaPath = `${linePath} L 100 100 L 0 100 Z`;

    return (
        <Card
            className={cn(
                "@container/card relative overflow-hidden bg-gradient-to-t from-primary/5 to-card shadow-xs dark:bg-card transition-all",
                onClick && "cursor-pointer hover:shadow-md"
            )}
            onClick={onClick}
        >
            {shouldRenderGraph && normalized.length > 1 && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 opacity-90">
                    <svg
                        className="h-full w-full"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                    >
                        <defs>
                            <linearGradient id={`stat-graph-fill-${tone}-${graphId}`} x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="0%"
                                    stopColor={tone === "up" ? "rgb(34 197 94 / 0.22)" : "rgb(239 68 68 / 0.22)"}
                                />
                                <stop
                                    offset="100%"
                                    stopColor={tone === "up" ? "rgb(34 197 94 / 0)" : "rgb(239 68 68 / 0)"}
                                />
                            </linearGradient>
                        </defs>
                        <path d={areaPath} fill={`url(#stat-graph-fill-${tone}-${graphId})`} />
                        <path
                            d={linePath}
                            fill="none"
                            stroke={tone === "up" ? "rgb(34 197 94 / 0.45)" : "rgb(239 68 68 / 0.45)"}
                            strokeWidth="0.85"
                            vectorEffect="non-scaling-stroke"
                        />
                    </svg>
                </div>
            )}
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
