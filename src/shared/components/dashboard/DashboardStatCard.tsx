import { useId, useMemo, isValidElement } from "react";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { cn, formatCurrency } from "@/shared/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, MoreVertical } from "lucide-react";

export interface DashboardStatCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: LucideIcon | React.ReactNode;
    trend?: "up" | "down";
    trendValue?: string;
    onClick?: () => void;
    loading?: boolean;
    showBackgroundGraph?: boolean;
    graphData?: number[];
    variant?: "default" | "primary" | "success" | "warning" | "destructive" | "neutral";
    isCurrency?: boolean;
    rawValue?: number;
    menuItems?: Array<{
        label: string;
        icon?: React.ReactNode;
        onClick: () => void;
    }>;
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
    icon: IconOrNode,
    trend,
    trendValue,
    onClick,
    loading = false,
    showBackgroundGraph = false,
    graphData,
    variant = "default",
    isCurrency = false,
    rawValue,
    menuItems = [],
}: DashboardStatCardProps) {
    if (loading) {
        return <SkeletonCard />;
    }

    const displayValue = value || (rawValue !== undefined ? (isCurrency ? formatCurrency(rawValue) : rawValue) : "");

    const tone: "up" | "down" = trend === "down" ? "down" : "up";
    const graphId = useId().replace(/:/g, "");
    const shouldRenderGraph = Boolean(showBackgroundGraph && graphData && graphData.length > 1);
    const points = shouldRenderGraph ? (graphData as number[]) : [];

    // Icon handling
    const isElement = isValidElement(IconOrNode);
    const IconComponent = !isElement ? (IconOrNode as React.ElementType) : null;
    
    const iconNode = isElement 
        ? (IconOrNode as React.ReactNode)
        : (IconComponent ? <IconComponent className="h-4 w-4" /> : null);

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

    const variantStyles = {
        default: "from-primary/5 to-card",
        primary: "from-blue-500/10 to-card border-blue-200/20 dark:border-blue-800/20",
        success: "from-emerald-500/10 to-card border-emerald-200/20 dark:border-emerald-800/20",
        warning: "from-amber-500/10 to-card border-amber-200/20 dark:border-amber-800/20",
        destructive: "from-red-500/10 to-card border-red-200/20 dark:border-red-800/20",
        neutral: "from-slate-500/10 to-card border-slate-200/20 dark:border-slate-800/20",
    };

    const iconVariantStyles = {
        default: "text-foreground",
        primary: "text-blue-600 dark:text-blue-400",
        success: "text-emerald-600 dark:text-emerald-400",
        warning: "text-amber-600 dark:text-amber-400",
        destructive: "text-red-600 dark:text-red-400",
        neutral: "text-slate-600 dark:text-slate-400",
    };

    return (
        <Card
            className={cn(
                "@container/card relative overflow-hidden bg-gradient-to-t shadow-xs dark:bg-card transition-all",
                variantStyles[variant],
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
            <CardHeader className="relative flex flex-row items-center justify-between pb-2 space-y-0">
                <div className="space-y-1">
                    <CardDescription className="text-xs font-medium uppercase tracking-wider text-muted-foreground/90">
                        {title}
                    </CardDescription>
                    <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl">
                        {displayValue}
                    </CardTitle>
                </div>
                 {menuItems.length > 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 -mr-2 text-muted-foreground hover:text-foreground"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {menuItems.map((item, index) => (
                                <DropdownMenuItem
                                    key={index}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        item.onClick();
                                    }}
                                >
                                    {item.icon && <span className="mr-2 flex items-center justify-center w-4">{item.icon}</span>}
                                    {item.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm pt-0">
                <div className="flex items-center justify-between w-full">
                    {description && (
                         <div className={cn("line-clamp-1 flex gap-2 font-medium items-center", iconVariantStyles[variant])}>
                            {iconNode}
                            <span className="text-muted-foreground font-normal">{description}</span>
                        </div>
                    )}
                     {trendValue && (
                        <Badge variant="outline" className={cn("gap-1 ml-auto font-normal", 
                            trend === "up" ? "text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800" : 
                            trend === "down" ? "text-red-600 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800" : ""
                        )}>
                            {trend === "up" ? (
                                <TrendingUp className="h-3 w-3" />
                            ) : trend === "down" ? (
                                <TrendingDown className="h-3 w-3" />
                            ) : null}
                            {trendValue}
                        </Badge>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}
