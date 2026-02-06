/**
 * Subscription Upgrade Dialog
 * Dialog for upgrading/purchasing subscription plans with wallet credit
 */

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useToast } from "@/shared/hooks/use-toast";
import { useStripeIntegration } from "@/shared/hooks/useStripeIntegration";
import { StripePromptDialog } from "@/shared/components/integrations/StripePromptDialog";
import { cn } from "@/shared/lib/utils";

interface SubscriptionUpgradeDialogProps {
    open: boolean;
    onClose: () => void;
    currentPlan?: string;
}

const SUBSCRIPTION_PLANS = [
    {
        id: 'free',
        name: 'ATS Lite',
        price: 0,
        billingCycle: 'MONTHLY' as const,
        jobQuota: 1,
        features: ['1 Active Job', 'Basic ATS', 'Email Support'],
        recommended: false,
    },
    {
        id: 'basic',
        name: 'Small Plan',
        price: 295,
        billingCycle: 'MONTHLY' as const,
        jobQuota: 5,
        features: ['5 Jobs/month', 'Full ATS', 'AI Screening', 'Priority Support', 'Consultant Access'],
        recommended: true,
    },
    {
        id: 'professional',
        name: 'Medium Plan',
        price: 495,
        billingCycle: 'MONTHLY' as const,
        jobQuota: 25,
        features: ['25 Jobs/month', 'Everything in Small', 'Advanced Analytics', 'Dedicated Support'],
        recommended: false,
    },
    {
        id: 'enterprise',
        name: 'Large Plan',
        price: 695,
        billingCycle: 'MONTHLY' as const,
        jobQuota: 50,
        features: ['50 Jobs/month', 'Everything in Medium', 'Custom Integrations', 'Account Manager'],
        recommended: false,
    },
    {
        id: 'custom',
        name: 'Custom Enterprise',
        price: 995,
        billingCycle: 'MONTHLY' as const,
        jobQuota: null, // Unlimited
        features: ['Unlimited Jobs', 'Everything in Large', 'Custom SLA', 'White-label Options'],
        recommended: false,
    },
];

export function SubscriptionUpgradeDialog({
    open,
    onClose,
    currentPlan,
}: SubscriptionUpgradeDialogProps) {
    const [selectedPlan, setSelectedPlan] = useState<string>('');
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { showPrompt, setShowPrompt, redirectPath } = useStripeIntegration();

    const upgradeMutation = useMutation({
        mutationFn: async (planId: string) => {
            const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
            if (!plan) throw new Error('Invalid plan selected');

            return walletService.createSubscription({
                planType: planId.toUpperCase().replace(/-/g, '_'),
                name: plan.name,
                basePrice: plan.price,
                billingCycle: plan.billingCycle,
                jobQuota: plan.jobQuota || undefined,
                autoRenew: true,
            });
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] });
            queryClient.invalidateQueries({ queryKey: ['wallet', 'subscription'] });
            queryClient.invalidateQueries({ queryKey: ['wallet', 'subscriptions'] });

            toast({
                title: "Subscription Activated",
                description: data.message || "Your new subscription has been activated and your wallet has been credited.",
            });

            onClose();
        },
        onError: (error: any) => {
            // Check if error is due to Stripe not connected (402)
            if (error.response?.status === 402 || error.errorCode === 'STRIPE_NOT_CONNECTED') {
                // StripePromptDialog will be shown automatically
                return;
            }

            toast({
                title: "Upgrade Failed",
                description: error.message || "Failed to upgrade subscription.",
                variant: "destructive",
            });
        },
    });

    const handleSelectPlan = (planId: string) => {
        if (planId === 'free') {
            toast({
                title: "Free Plan",
                description: "This is the free plan. No payment required.",
            });
            return;
        }

        setSelectedPlan(planId);
        upgradeMutation.mutate(planId);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Choose Your Plan</DialogTitle>
                    <DialogDescription>
                        Select a subscription plan to unlock more features. Your wallet will be credited with the subscription amount.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
                    {SUBSCRIPTION_PLANS.map((plan) => {
                        const isCurrent = currentPlan?.toLowerCase() === plan.id;
                        const isDisabled = upgradeMutation.isPending;

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
                                        <span className="text-3xl font-bold text-foreground">
                                            ${plan.price}
                                        </span>
                                        <span className="text-muted-foreground">/month</span>
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Job Quota */}
                                    <div className="p-3 rounded-lg bg-accent">
                                        <p className="text-sm text-muted-foreground">Job Postings</p>
                                        <p className="text-lg font-semibold">
                                            {plan.jobQuota === null ? 'Unlimited' : `${plan.jobQuota} per month`}
                                        </p>
                                    </div>

                                    {/* Features */}
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">Features:</p>
                                        <ul className="space-y-1">
                                            {plan.features.map((feature, index) => (
                                                <li key={index} className="flex items-start gap-2 text-sm">
                                                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Action Button */}
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

                <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-muted-foreground">
                        <strong>How it works:</strong> When you subscribe, your virtual wallet will be credited with the subscription amount.
                        Job postings will be deducted from your wallet balance automatically.
                    </p>
                </div>
            </DialogContent>

            {/* Stripe Connection Prompt */}
            <StripePromptDialog
                open={showPrompt}
                onOpenChange={setShowPrompt}
                redirectPath={redirectPath}
            />
        </Dialog>
    );
}
