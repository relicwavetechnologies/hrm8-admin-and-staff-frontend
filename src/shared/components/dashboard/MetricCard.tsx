
import { Card, CardContent } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: 'up' | 'down';
    trendValue?: string;
    icon?: React.ReactNode;
    colorClass?: string;
    bgClass?: string;
    onClick?: () => void;
    loading?: boolean;
    className?: string;
}

export function MetricCard({
    title,
    value,
    subtitle,
    trend,
    trendValue,
    icon,
    colorClass = "text-primary",
    bgClass = "bg-primary/10",
    onClick,
    loading,
    className
}: MetricCardProps) {
    if (loading) {
        return (
            <Card className={cn("overflow-hidden border border-border", className)}>
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                            <div className="h-9 w-32 bg-muted animate-pulse rounded" />
                            <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                        </div>
                        <div className="h-12 w-12 bg-muted animate-pulse rounded-xl" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card
            className={cn(
                "relative overflow-hidden transition-all duration-300 border border-border hover:border-primary/40 hover:shadow-lg",
                onClick && "cursor-pointer",
                className
            )}
            onClick={onClick}
        >
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
                        <h3 className="text-2xl font-bold tracking-tight mb-1">{value}</h3>
                        {subtitle && (
                            <p className="text-xs text-muted-foreground">{subtitle}</p>
                        )}
                        {trendValue && (
                            <div className={cn(
                                "flex items-center gap-1 text-xs font-medium mt-2",
                                trend === 'up' ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                            )}>
                                {trend === 'up' ? (
                                    <ArrowUpRight className="h-3 w-3" />
                                ) : (
                                    <ArrowDownRight className="h-3 w-3" />
                                )}
                                <span>{trendValue}</span>
                            </div>
                        )}
                    </div>
                    <div className={cn("p-3 rounded-xl ring-1 ring-current/15", bgClass)}>
                        <div className={cn("h-5 w-5", colorClass)}>
                            {icon}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
