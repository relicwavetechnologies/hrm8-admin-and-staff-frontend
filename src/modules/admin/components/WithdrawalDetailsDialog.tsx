import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog";
import { Badge } from "@/shared/components/ui/badge";
import { useCurrencyFormat } from "@/shared/contexts/CurrencyFormatContext";
import { AdminWithdrawalRequest } from "@/shared/lib/admin/withdrawalService";
import { format } from "date-fns";

interface WithdrawalDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    withdrawal: AdminWithdrawalRequest;
}

export function WithdrawalDetailsDialog({ open, onOpenChange, withdrawal }: WithdrawalDetailsDialogProps) {
    const { formatCurrency } = useCurrencyFormat();

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
                    {/* Sales Agent Info */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-sm text-muted-foreground">Sales Agent</h3>
                        <div className="bg-slate-50 p-3 rounded-md">
                            <div className="font-medium">{withdrawal.consultantName}</div>
                            <div className="text-sm text-muted-foreground">{withdrawal.consultantEmail}</div>
                        </div>
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-sm text-muted-foreground">Amount</h3>
                        <div className="text-3xl font-bold text-green-600">
                            {formatCurrency(withdrawal.amount)}
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-sm text-muted-foreground">Payment Method</h3>
                        <div className="capitalize">{withdrawal.paymentMethod.replace('_', ' ')}</div>
                    </div>

                    {/* Payment Details */}
                    {withdrawal.paymentDetails && (
                        <div className="space-y-2">
                            <h3 className="font-semibold text-sm text-muted-foreground">Payment Details</h3>
                            <div className="bg-slate-50 p-3 rounded-md space-y-1 text-sm">
                                {withdrawal.paymentMethod === 'BANK_TRANSFER' && (
                                    <>
                                        <div><span className="font-medium">Bank:</span> {withdrawal.paymentDetails.bankName}</div>
                                        <div><span className="font-medium">Account Name:</span> {withdrawal.paymentDetails.accountName}</div>
                                        <div><span className="font-medium">Account Number:</span> {withdrawal.paymentDetails.accountNumber}</div>
                                        <div><span className="font-medium">Routing:</span> {withdrawal.paymentDetails.routingNumber}</div>
                                    </>
                                )}
                                {withdrawal.paymentMethod === 'PAYPAL' && (
                                    <div><span className="font-medium">PayPal Email:</span> {withdrawal.paymentDetails.email}</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Agent Notes */}
                    {withdrawal.notes && (
                        <div className="space-y-2">
                            <h3 className="font-semibold text-sm text-muted-foreground">Agent Notes</h3>
                            <div className="bg-slate-50 p-3 rounded-md text-sm">
                                {withdrawal.notes}
                            </div>
                        </div>
                    )}

                    {/* Commission Count */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-sm text-muted-foreground">Commissions Included</h3>
                        <div>{withdrawal.commissionIds?.length || 0} commission(s)</div>
                    </div>

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
                </div>
            </DialogContent>
        </Dialog>
    );
}
