/**
 * Airwallex Integration Card Component
 * Displays payout connectivity status and provides connect/manage options.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { AlertCircle, CheckCircle2, CreditCard, ExternalLink, RefreshCw } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';
import { cn } from '@/shared/lib/utils';

interface PayoutIntegrationCardProps {
    onConnectionChange?: (connected: boolean) => void;
}

export function PayoutIntegrationCard({ onConnectionChange }: PayoutIntegrationCardProps) {
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [connected, setConnected] = useState(false);
    const [integration, setIntegration] = useState<any>(null);
    const { toast } = useToast();

    const fetchStatus = async () => {
        try {
            const response = await fetch('/api/payouts/status', {
                credentials: 'include',
            });

            const data = await response.json();

            if (data.success) {
                const status = data.data || {};
                const isConnected = Boolean(status.isConnected || status.payoutEnabled || status.payoutsEnabled);
                setConnected(isConnected);
                setIntegration(status);
                onConnectionChange?.(isConnected);
            }
        } catch (error) {
            console.error('Failed to fetch payout status:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const handleConnect = async () => {
        setConnecting(true);
        try {
            const response = await fetch('/api/payouts/beneficiaries', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await response.json();

            const onboardingUrl = data?.data?.onboardingUrl || data?.data?.accountLink?.url;
            if (data.success && onboardingUrl) {
                window.location.href = onboardingUrl;
            } else {
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to start Airwallex onboarding',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to connect to Airwallex',
                variant: 'destructive',
            });
        } finally {
            setConnecting(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            await fetchStatus();
            toast({
                title: 'Success',
                description: 'Payout status synced successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to sync payout status',
                variant: 'destructive',
            });
        } finally {
            setSyncing(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Airwallex Payouts
                    </CardTitle>
                    <CardDescription>Payout rail integration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Airwallex Payouts
                        </CardTitle>
                        <CardDescription>Payout rail integration</CardDescription>
                    </div>
                    {connected && (
                        <Badge className="bg-green-500 text-white gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Connected
                        </Badge>
                    )}
                    {!connected && integration && (
                        <Badge variant="secondary" className="gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Pending
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {!integration ? (
                    // Not connected state
                    <>
                        <div className="rounded-lg border border-dashed p-6 text-center">
                            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                            <p className="text-sm font-medium mb-2">No Airwallex beneficiary connected</p>
                            <p className="text-xs text-muted-foreground mb-4">
                                Connect your Airwallex beneficiary to enable withdrawals
                            </p>
                        </div>
                        <Button
                            onClick={handleConnect}
                            disabled={connecting}
                            className="w-full"
                        >
                            {connecting ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Connecting...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Connect Airwallex
                                </>
                            )}
                        </Button>
                    </>
                ) : (
                    // Connected or pending state
                    <>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Status</span>
                                <span className={cn(
                                    "font-medium capitalize",
                                    integration.accountStatus === 'active' || integration.payoutsEnabled ? 'text-green-600' : 'text-yellow-600'
                                )}>
                                    {integration.accountStatus || (integration.payoutsEnabled ? 'Active' : 'Pending')}
                                </span>
                            </div>
                            {integration.accountId && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Account ID</span>
                                    <code className="text-xs bg-muted px-2 py-1 rounded">
                                        {integration.accountId.substring(0, 20)}...
                                    </code>
                                </div>
                            )}
                            {integration.onboardedAt && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Connected</span>
                                    <span className="font-medium">
                                        {new Date(integration.onboardedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>

                        {!(integration.payoutsEnabled || integration.payoutEnabled) && (
                            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/20 p-4 border border-yellow-200 dark:border-yellow-900">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                                            Complete Onboarding
                                        </p>
                                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                                            Your payout beneficiary setup is incomplete.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="outline"
                                onClick={handleSync}
                                disabled={syncing}
                                className="w-full"
                            >
                                {syncing ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        Syncing...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Sync Status
                                    </>
                                )}
                            </Button>
                            {!(integration.payoutsEnabled || integration.payoutEnabled) && (
                                <Button
                                    onClick={handleConnect}
                                    disabled={connecting}
                                    className="w-full"
                                >
                                    {connecting ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                            Opening...
                                        </>
                                    ) : (
                                        <>
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            Complete Setup
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
