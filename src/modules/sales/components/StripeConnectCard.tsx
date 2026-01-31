
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { salesService } from "@/shared/services/salesService";
import { Loader2, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface StripeConnectCardProps {
    onStatusChange?: () => void;
}

export function StripeConnectCard({ onStatusChange }: StripeConnectCardProps) {
    const [status, setStatus] = useState<{ payoutEnabled: boolean; detailsSubmitted: boolean } | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        try {
            setLoading(true);
            const response = await salesService.getStripeStatus();
            if (response.success && response.data) {
                setStatus(response.data);
                if (onStatusChange) onStatusChange();
            }
        } catch (error) {
            console.error("Failed to check Stripe status", error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async () => {
        try {
            setActionLoading(true);
            const response = await salesService.stripeOnboard();
            if (response.success && response.data?.onboardingUrl) {
                window.location.href = response.data.onboardingUrl;
            } else {
                toast.error("Failed to generate onboarding link");
            }
        } catch (error) {
            toast.error("Failed to start Stripe onboarding");
        } finally {
            setActionLoading(false);
        }
    };

    const handleLogin = async () => {
        try {
            setActionLoading(true);
            const response = await salesService.getStripeLoginLink();
            if (response.success && response.data?.url) {
                window.open(response.data.url, "_blank");
            } else {
                toast.error("Failed to get login link");
            }
        } catch (error) {
            toast.error("Failed to access Stripe dashboard");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="py-6 flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    const isConnected = status?.detailsSubmitted;
    const isPayoutEnabled = status?.payoutEnabled;

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            Payout Method
                            {!isConnected && <Badge variant="outline" className="text-muted-foreground">Not Connected</Badge>}
                            {isConnected && !isPayoutEnabled && <Badge variant="warning" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending Verification</Badge>}
                            {isConnected && isPayoutEnabled && <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>}
                        </CardTitle>
                        <CardDescription>
                            Connect your bank account via Stripe to receive automatic payouts.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4">
                    {!isConnected ? (
                        <div className="bg-muted/50 p-4 rounded-md flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-2 rounded-full">
                                    <DollarSignIcon className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium">Setup Automatic Payouts</p>
                                    <p className="text-sm text-muted-foreground">Receive commissions directly to your bank</p>
                                </div>
                            </div>
                            <Button onClick={handleConnect} disabled={actionLoading}>
                                {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Connect Stripe"}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {isPayoutEnabled ? (
                                    <>
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span>Your account is ready to receive payouts</span>
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                                        <span>Additional information may be required</span>
                                    </>
                                )}
                            </div>
                            <div className="flex gap-2">
                                {!isPayoutEnabled && (
                                    <Button variant="outline" size="sm" onClick={handleConnect} disabled={actionLoading}>
                                        Complete Setup
                                    </Button>
                                )}
                                <Button variant="ghost" size="sm" onClick={handleLogin} disabled={actionLoading}>
                                    View Dashboard <ExternalLink className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function DollarSignIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="12" x2="12" y1="2" y2="22" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    )
}
