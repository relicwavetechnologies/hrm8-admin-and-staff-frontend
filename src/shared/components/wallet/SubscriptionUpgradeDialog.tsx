/**
 * Subscription Upgrade Dialog
 * Dialog for upgrading/purchasing subscription plans with backend-driven pricing.
 */

import { useMemo, useState } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { walletService } from "@/shared/services/walletService";
import { pricingService } from "@/shared/lib/pricingService";
import { useToast } from "@/shared/hooks/use-toast";
import { usePaymentProviderIntegration } from "@/shared/hooks/usePaymentProviderIntegration";
import { PaymentProviderPromptDialog } from "@/shared/components/integrations/PaymentProviderPromptDialog";
import { cn } from "@/shared/lib/utils";

interface SubscriptionUpgradeDialogProps {
    open: boolean;
    onClose: () => void;
    currentPlan?: string;
}

const PLAN_METADATA: Record<string, { name: string; jobQuota: number | null; features: string[]; recommended: boolean }> = {
    FREE: { name: 'ATS Lite', jobQuota: 1, features: ['1 Active Job', 'Basic ATS', 'Email Support'], recommended: false },
    SMALL: { name: 'Small Plan', jobQuota: 5, features: ['5 Jobs/month', 'Full ATS', 'AI Screening', 'Priority Support'], recommended: true },
    MEDIUM: { name: 'Medium Plan', jobQuota: 25, features: ['25 Jobs/month', 'Everything in Small', 'Advanced Analytics'], recommended: false },
    LARGE: { name: 'Large Plan', jobQuota: 50, features: ['50 Jobs/month', 'Everything in Medium', 'Custom Integrations'], recommended: false },
    ENTERPRISE: { name: 'Enterprise', jobQuota: null, features: ['Unlimited Jobs', 'Everything in Large', 'Custom SLA'], recommended: false },
    CUSTOM: { name: 'Custom Enterprise', jobQuota: null, features: ['Unlimited Jobs', 'Custom SLA', 'White-label'], recommended: false },
};

type PlanForDisplay = {
    id: string;
    planType: string;
    name: string;
    price: number;
    currency: string;
    billingCycle: 'MONTHLY';
    jobQuota: number | null;
    features: string[];
    recommended: boolean;
};

export function SubscriptionUpgradeDialog({
    open,
    onClose,
    currentPlan,
}: SubscriptionUpgradeDialogProps) {
    const [selectedPlan, setSelectedPlan] = useState<string>('');
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const {
        showProviderPrompt,
        setShowProviderPrompt,
        providerRedirectPath,
    } = usePaymentProviderIntegration();

    const SELECTABLE_PLANS = ['SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE', 'CUSTOM'];

    const { data: apiTiers, isLoading: tiersLoading } = useQuery({
        queryKey: ['pricing', 'admin-subscription-tiers'],
        queryFn: () => pricingService.getSubscriptionTiers(),
        enabled: open,
    });

    const upgradePreviews = useQueries({
        queries: (apiTiers ?? [])
            .filter((tier) => SELECTABLE_PLANS.includes(String(tier.planType).toUpperCase()))
            .map((tier) => ({
                queryKey: ['subscription', 'admin-upgrade-preview', tier.planType],
                queryFn: () => pricingService.getUpgradePreview(tier.planType),
                enabled: open && !!currentPlan,
            })),
    });

    const upgradePreviewByPlan = useMemo(() => {
        const tiers = apiTiers ?? [];
        const filtered = tiers.filter((tier) => SELECTABLE_PLANS.includes(String(tier.planType).toUpperCase()));
        const map: Record<string, { upgradeAmount: number; currency: string; daysRemaining: number } | null> = {};
        filtered.forEach((tier, index) => {
            map[String(tier.planType).toUpperCase()] = upgradePreviews[index]?.data ?? null;
        });
        return map;
    }, [apiTiers, upgradePreviews]);

    const plans = useMemo((): PlanForDisplay[] => {
        if (!apiTiers || apiTiers.length === 0) return [];
        return apiTiers
            .filter((tier) => SELECTABLE_PLANS.includes(String(tier.planType).toUpperCase()))
            .map((tier) => {
                const meta = PLAN_METADATA[tier.planType] ?? { name: tier.name, jobQuota: null, features: [], recommended: false };
                return {
                    id: tier.planType.toLowerCase(),
                    planType: tier.planType,
                    name: meta.name,
                    price: tier.price,
                    currency: tier.currency,
                    billingCycle: 'MONTHLY' as const,
                    jobQuota: meta.jobQuota,
                    features: meta.features,
                    recommended: meta.recommended,
                };
            });
    }, [apiTiers]);

    const upgradeMutation = useMutation({
        mutationFn: async (planId: string) => {
            const plan = plans.find((entry) => entry.id === planId || entry.planType.toLowerCase() === planId.toLowerCase());
            if (!plan) throw new Error('Pricing is currently unavailable for your account');

            const isFree = plan.price <= 0;
            if (isFree) {
                return walletService.createSubscription({
                    planType: plan.planType,
                    name: plan.name,
                    billingCycle: plan.billingCycle,
                    jobQuota: plan.jobQuota ?? undefined,
                    autoRenew: true,
                });
            }

            await walletService.createSubscriptionCheckout({
                planType: plan.planType,
                name: plan.name,
                amount: plan.price,
                billingCycle: plan.billingCycle,
                jobQuota: plan.jobQuota ?? undefined,
                currency: plan.currency,
            });
        },
        onSuccess: (data, planId) => {
            const plan = plans.find((entry) => entry.id === planId || entry.planType.toLowerCase() === planId.toLowerCase());
            const isFree = (plan?.price ?? 0) <= 0;

            queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] });
            queryClient.invalidateQueries({ queryKey: ['wallet', 'subscription'] });
            queryClient.invalidateQueries({ queryKey: ['wallet', 'subscriptions'] });
            queryClient.invalidateQueries({ queryKey: ['pricing', 'admin-subscription-tiers'] });

            if (isFree) {
                toast({
                    title: 'Subscription Activated',
                    description: data?.message || 'Your plan has been activated.',
                });
                onClose();
            }
        },
        onError: (error: any) => {
            if (
                error.response?.status === 402 ||
                error.errorCode === 'AIRWALLEX_NOT_CONNECTED' ||
                error.errorCode === 'STRIPE_NOT_CONNECTED'
            ) {
                return;
            }

            toast({
                title: 'Upgrade Failed',
                description: error.message || 'Failed to upgrade subscription.',
                variant: 'destructive',
            });
        },
    });

    const handleSelectPlan = (planId: string) => {
        const plan = plans.find((entry) => entry.id === planId || entry.planType.toLowerCase() === planId.toLowerCase());
        if (!plan) return;

        setSelectedPlan(planId);
        upgradeMutation.mutate(planId);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Choose Your Plan</DialogTitle>
                    <DialogDescription>
                        Select a subscription plan using your company&apos;s current billing currency and pricing.
                    </DialogDescription>
                </DialogHeader>

                {!tiersLoading && plans.length === 0 && (
                    <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
                        Unable to load dynamic subscription pricing. Please contact HRM8 admin.
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
                    {plans.map((plan) => {
                        const isCurrent = currentPlan?.toLowerCase() === plan.id;
                        const isDisabled = upgradeMutation.isPending;
                        const preview = upgradePreviewByPlan[plan.planType.toUpperCase()];

                        return (
                            <Card
                                key={plan.id}
                                className={cn(
                                    "relative transition-all",
                                    plan.recommended && "border-primary shadow-lg",
                                    isCurrent && "border-green-500"
                                )}
                            >
                                {plan.recommended && (
                                    <Badge className="absolute -top-2 -right-2 bg-primary">
                                        <Sparkles className="h-3 w-3 mr-1" />
                                        Recommended
                                    </Badge>
                                )}
                                {isCurrent && (
                                    <Badge className="absolute -top-2 -right-2 bg-green-600">
                                        Current Plan
                                    </Badge>
                                )}

                                <CardHeader>
                                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                                    <CardDescription>
                                        {preview ? (
                                            <>
                                                <span className="text-3xl font-bold text-foreground">
                                                    {pricingService.formatPrice(preview.upgradeAmount, preview.currency)}
                                                </span>
                                                <span className="text-muted-foreground"> upgrade</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-3xl font-bold text-foreground">
                                                    {pricingService.formatPrice(plan.price, plan.currency)}
                                                </span>
                                                <span className="text-muted-foreground">/month</span>
                                            </>
                                        )}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <div className="p-3 rounded-lg bg-accent">
                                        <p className="text-sm text-muted-foreground">Job Postings</p>
                                        <p className="text-lg font-semibold">
                                            {plan.jobQuota === null ? 'Unlimited' : `${plan.jobQuota} per month`}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">Features:</p>
                                        <ul className="space-y-1">
                                            {plan.features.map((feature) => (
                                                <li key={feature} className="flex items-start gap-2 text-sm">
                                                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <Button
                                        className="w-full"
                                        variant={plan.recommended ? "default" : "outline"}
                                        disabled={isCurrent || isDisabled}
                                        onClick={() => handleSelectPlan(plan.id)}
                                    >
                                        {upgradeMutation.isPending && selectedPlan === plan.id ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Processing...
                                            </>
                                        ) : isCurrent ? (
                                            'Current Plan'
                                        ) : plan.price === 0 ? (
                                            'Free Plan'
                                        ) : (
                                            'Select Plan'
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </DialogContent>

            <PaymentProviderPromptDialog
                open={showProviderPrompt}
                onOpenChange={setShowProviderPrompt}
                redirectPath={providerRedirectPath}
            />
        </Dialog>
    );
}
