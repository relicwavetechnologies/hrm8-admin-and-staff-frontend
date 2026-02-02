/**
 * Stripe Integration Card Component
 * Displays Stripe connection status and provides connect/manage options
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { AlertCircle, CheckCircle2, CreditCard, ExternalLink, RefreshCw } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';
import { cn } from '@/shared/lib/utils';

interface StripeIntegrationCardProps {
    onConnectionChange?: (connected: boolean) => void;
}

export function StripeIntegrationCard({ onConnectionChange }: StripeIntegrationCardProps) {
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [connected, setConnected] = useState(false);
    const [integration, setIntegration] = useState<any>(null);
    const { toast } = useToast();

    const fetchStatus = async () => {
        try {
            const response = await fetch('/api/integrations/stripe/status', {
                credentials: 'include',
            });

            const data = await response.json();

            if (data.success) {
                setConnected(data.data.connected);
                setIntegration(data.data.integration);
                onConnectionChange?.(data.data.connected);
            }
        } catch (error) {
            console.error('Failed to fetch Stripe status:', error);
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
            const response = await fetch('/api/integrations/stripe/connect', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await response.json();

            if (data.success && data.data.onboarding_url) {
                // Redirect to Stripe onboarding
                window.location.href = data.data.onboarding_url;
            } else {
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to start Stripe connection',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to connect to Stripe',
                variant: 'destructive',
            });
        } finally {
            setConnecting(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            const response = await fetch('/api/integrations/stripe/sync', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: 'Success',
                    description: 'Stripe account status synced successfully',
                });
                await fetchStatus();
            } else {
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to sync Stripe status',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to sync Stripe status',
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
                        Stripe Payments
                    </CardTitle>
                    <CardDescription>Payment processing integration</CardDescription>
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
                            Stripe Payments
                        </CardTitle>
                        <CardDescription>Payment processing integration</CardDescription>
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
                            <p className="text-sm font-medium mb-2">No Stripe account connected</p>
                            <p className="text-xs text-muted-foreground mb-4">
                                Connect your Stripe account to accept payments and process subscriptions
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
                                    Connect Stripe Account
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
                                    integration.stripe_account_status === 'active' ? 'text-green-600' : 'text-yellow-600'
                                )}>
                                    {integration.stripe_account_status || 'Pending'}
                                </span>
                            </div>
                            {integration.stripe_account_id && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Account ID</span>
                                    <code className="text-xs bg-muted px-2 py-1 rounded">
                                        {integration.stripe_account_id.substring(0, 20)}...
                                    </code>
                                </div>
                            )}
                            {integration.stripe_onboarded_at && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Connected</span>
                                    <span className="font-medium">
                                        {new Date(integration.stripe_onboarded_at).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>

                        {integration.stripe_account_status !== 'active' && (
                            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/20 p-4 border border-yellow-200 dark:border-yellow-900">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                                            Complete Onboarding
                                        </p>
                                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                                            Your Stripe account setup is incomplete. Complete onboarding to accept payments.
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
                            {integration.stripe_account_status !== 'active' && (
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
