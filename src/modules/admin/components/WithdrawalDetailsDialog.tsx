import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog";
import { Badge } from "@/shared/components/ui/badge";
import { useCurrencyFormat } from "@/shared/contexts/CurrencyFormatContext";
import { AdminWithdrawalRequest } from "@/shared/lib/admin/withdrawalService";
import { format } from "date-fns";
import { Timeline } from "@/shared/components/ui/timeline";

interface WithdrawalDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    withdrawal: AdminWithdrawalRequest;
}

export function WithdrawalDetailsDialog({ open, onOpenChange, withdrawal }: WithdrawalDetailsDialogProps) {
    const { formatCurrency } = useCurrencyFormat();
    const normalizedMethod = withdrawal.paymentMethod?.toLowerCase?.() || '';
    const paymentMethodLabel =
        normalizedMethod === 'bank_transfer'
            ? 'Airwallex bank payout'
            : normalizedMethod === 'paypal'
                ? 'Legacy PayPal payout'
                : normalizedMethod === 'wise'
                    ? 'Legacy Wise payout'
                    : withdrawal.paymentMethod.replace('_', ' ');
    const timelineItems = (withdrawal.timeline || [])
        .filter((entry) => entry.at)
        .map((entry) => ({
            id: entry.key,
            title: entry.label,
            description: entry.description,
            timestamp: new Date(entry.at as string),
            variant: (
                entry.tone === 'success'
                    ? 'success'
                    : entry.tone === 'warning'
                        ? 'warning'
                        : entry.tone === 'danger'
                            ? 'destructive'
                            : 'default'
            ) as 'default' | 'success' | 'warning' | 'destructive',
        }));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Withdrawal Request Details</DialogTitle>
                    <DialogDescription>
                        Review the complete withdrawal request information
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Recipient Info */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-sm text-muted-foreground">Recipient</h3>
                        <div className="bg-slate-50 p-3 rounded-md">
                            <div className="font-medium">{withdrawal.recipientName || withdrawal.consultantName || withdrawal.companyName}</div>
                            <div className="text-sm text-muted-foreground">{withdrawal.recipientEmail || withdrawal.consultantEmail || 'Company refund balance'}</div>
                        </div>
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-sm text-muted-foreground">Amount</h3>
                        <div className="text-3xl font-bold text-green-600">
                            {formatCurrency(withdrawal.payoutAmount ?? withdrawal.amount, withdrawal.payoutCurrency || withdrawal.currency || undefined)}
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-sm text-muted-foreground">Payment Method</h3>
                        <div className="capitalize">{paymentMethodLabel}</div>
                        {normalizedMethod === 'paypal' || normalizedMethod === 'wise' ? (
                            <p className="text-xs text-muted-foreground">
                                This withdrawal used a legacy payout method. Active payout flows now use Airwallex bank payouts only.
                            </p>
                        ) : null}
                    </div>

                    {withdrawal.beneficiaryStatus ? (
                        <div className="space-y-2">
                            <h3 className="font-semibold text-sm text-muted-foreground">Beneficiary Readiness</h3>
                            <div className="bg-slate-50 p-3 rounded-md space-y-1 text-sm">
                                <div className="flex items-center justify-between gap-3">
                                    <span>{withdrawal.beneficiaryStatus.label}</span>
                                    <Badge variant="outline">{withdrawal.beneficiaryStatus.status}</Badge>
                                </div>
                                <p className="text-muted-foreground">{withdrawal.beneficiaryStatus.description}</p>
                                {withdrawal.beneficiaryStatus.missingFields?.length ? (
                                    <p>Missing: {withdrawal.beneficiaryStatus.missingFields.join(', ')}</p>
                                ) : null}
                            </div>
                        </div>
                    ) : null}

                    {/* Payment Details */}
                    {withdrawal.paymentDetails && (
                        <div className="space-y-2">
                            <h3 className="font-semibold text-sm text-muted-foreground">Payment Details</h3>
                            <div className="bg-slate-50 p-3 rounded-md space-y-1 text-sm">
                                {normalizedMethod === 'bank_transfer' && (
                                    <>
                                        <div><span className="font-medium">Bank:</span> {withdrawal.paymentDetails.bankName}</div>
                                        <div><span className="font-medium">Account Name:</span> {withdrawal.paymentDetails.accountName}</div>
                                        <div><span className="font-medium">Account Number:</span> {withdrawal.paymentDetails.accountNumber}</div>
                                        <div><span className="font-medium">Routing:</span> {withdrawal.paymentDetails.routingNumber || withdrawal.paymentDetails.ifscCode}</div>
                                    </>
                                )}
                                {normalizedMethod === 'paypal' && (
                                    <div><span className="font-medium">PayPal Email:</span> {withdrawal.paymentDetails.email}</div>
                                )}
                                {normalizedMethod === 'wise' && (
                                    <div><span className="font-medium">Wise Details:</span> {withdrawal.paymentDetails.email || withdrawal.paymentDetails.accountName || 'Legacy payout record'}</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Request Notes */}
                    {withdrawal.notes && (
                        <div className="space-y-2">
                            <h3 className="font-semibold text-sm text-muted-foreground">Request Notes</h3>
                            <div className="bg-slate-50 p-3 rounded-md text-sm">
                                {withdrawal.notes}
                            </div>
                        </div>
                    )}

                    {withdrawal.requestKind !== 'COMPANY' ? (
                        <div className="space-y-2">
                            <h3 className="font-semibold text-sm text-muted-foreground">Commissions Included</h3>
                            <div>{withdrawal.commissionIds?.length || 0} commission(s)</div>
                        </div>
                    ) : null}

                    {withdrawal.riskHoldReason ? (
                        <div className="space-y-2">
                            <h3 className="font-semibold text-sm text-muted-foreground">Risk Hold</h3>
                            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                                {withdrawal.riskHoldReason}
                            </div>
                        </div>
                    ) : null}

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <h3 className="font-semibold text-sm text-muted-foreground">Requested</h3>
                            <div className="text-sm">{format(new Date(withdrawal.createdAt), "MMM d, yyyy 'at' h:mm a")}</div>
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-semibold text-sm text-muted-foreground">Status</h3>
                            <Badge variant="outline">{withdrawal.status}</Badge>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold text-sm text-muted-foreground">Timeline</h3>
                        <div className="bg-slate-50 p-3 rounded-md">
                            {timelineItems.length > 0 ? (
                                <Timeline items={timelineItems} />
                            ) : (
                                <p className="text-sm text-muted-foreground">No payout lifecycle events recorded yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
