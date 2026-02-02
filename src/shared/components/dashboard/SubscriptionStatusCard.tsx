/**
 * Subscription Card Component
 * Displays active subscription info on Home dashboard
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Sparkles, Calendar, AlertCircle, CreditCard, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/shared/lib/utils';
import { useNavigate } from 'react-router-dom';

interface Subscription {
    id: string;
    name: string;
    plan_type: string;
    base_price: number;
    billing_cycle: string;
    status: string;
    renewal_date: string | null;
    job_quota: number | null;
    jobs_used: number;
    prepaid_balance: number | null;
}

interface SubscriptionData {
    subscription: Subscription;
    canUpgrade: boolean;
    nextTier: string | null;
    usagePercent: number;
}

interface SubscriptionStatusCardProps {
    data: SubscriptionData | null;
    loading: boolean;
}

const PLAN_BADGE_COLORS: Record<string, string> = {
    FREE: 'bg-gray-500',
    BASIC: 'bg-blue-500',
    PROFESSIONAL: 'bg-purple-500',
    ENTERPRISE: 'bg-amber-500',
    CUSTOM: 'bg-green-500',
};

export function SubscriptionStatusCard({ data, loading }: SubscriptionStatusCardProps) {
    const navigate = useNavigate();

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Current Plan
                            </CardTitle>
                            <CardDescription>Your subscription details</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-16 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (!data) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Current Plan
                    </CardTitle>
                    <CardDescription>Choose a subscription plan</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-6">
                        <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <p className="text-sm text-muted-foreground mb-4">
                            No active subscription
                        </p>
                        <p className="text-xs text-muted-foreground mb-4">
                            Subscribe to get monthly wallet credits automatically
                        </p>
                        <Button onClick={() => navigate('/subscriptions')} className="w-full">
                            <Sparkles className="h-4 w-4 mr-2" />
                            Choose a Plan
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const { subscription, canUpgrade, usagePercent } = data;
    const isNearingLimit = usagePercent >= 80;
    const hasExceededLimit = subscription.job_quota && subscription.jobs_used >= subscription.job_quota;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Current Plan
                        </CardTitle>
                        <CardDescription>Monthly subscription</CardDescription>
                    </div>
                    <Badge
                        className={cn(
                            'text-white',
                            PLAN_BADGE_COLORS[subscription.plan_type] || 'bg-gray-500'
                        )}
                    >
                        {subscription.plan_type}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Plan Name & Price */}
                <div>
                    <p className="text-2xl font-bold">{subscription.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        ${subscription.base_price.toFixed(2)} / {subscription.billing_cycle.toLowerCase()}
                    </p>
                </div>

                {/* Jobs Usage */}
                {subscription.job_quota && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Jobs Used</span>
                            <span className="font-medium">
                                {subscription.jobs_used} / {subscription.job_quota}
                            </span>
                        </div>
                        <Progress
                            value={usagePercent}
                            className={cn(
                                hasExceededLimit && "bg-red-200",
                                isNearingLimit && !hasExceededLimit && "bg-yellow-200"
                            )}
                        />
                        {hasExceededLimit && (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-950/20">
                                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                                <p className="text-xs text-red-700 dark:text-red-400">
                                    Job quota exceeded. Upgrade to post more jobs.
                                </p>
                            </div>
                        )}
                        {isNearingLimit && !hasExceededLimit && (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                                <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                                <p className="text-xs text-yellow-700 dark:text-yellow-400">
                                    Nearing job quota limit. Consider upgrading.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Renewal Date */}
                {subscription.renewal_date && (
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Renews on:</span>
                        <span className="font-medium">
                            {format(new Date(subscription.renewal_date), 'MMM dd, yyyy')}
                        </span>
                    </div>
                )}

                {/* Upgrade Button */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                    {canUpgrade && (
                        <Button
                            onClick={() => navigate('/subscriptions')}
                            className="w-full"
                            variant="default"
                        >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Upgrade
                        </Button>
                    )}
                    <Button
                        onClick={() => navigate('/subscriptions')}
                        className="w-full"
                        variant="outline"
                    >
                        Manage
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
