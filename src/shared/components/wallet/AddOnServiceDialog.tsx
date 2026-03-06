/**
 * Add-on Service Purchase Dialog
 * Dialog for purchasing add-on services with wallet balance check
 */

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { AlertCircle, CheckCircle, Loader2, Wallet, CreditCard } from "lucide-react";
import { walletService } from "@/shared/services/walletService";
import { useToast } from "@/shared/hooks/use-toast";

interface AddOnServiceDialogProps {
    open: boolean;
    onClose: () => void;
    jobId?: string;
    preselectedService?: string;
}

// Add-on service pricing (from HRM8 Pricing Model)
const ADD_ON_SERVICES = [
    { value: 'PSYCHOMETRIC_ASSESSMENT', label: 'Psychometric Assessment', price: 50 },
    { value: 'REFERENCE_CHECK', label: 'Reference Check (3 refs)', price: 75 },
    { value: 'CRIMINAL_RECORD_CHECK', label: 'Criminal Record Check', price: 100 },
    { value: 'EDUCATION_VERIFICATION', label: 'Education Verification', price: 60 },
    { value: 'EMPLOYMENT_VERIFICATION', label: 'Employment Verification', price: 60 },
    { value: 'VIDEO_INTERVIEW', label: 'Video Interview Setup', price: 25 },
    { value: 'SKILLS_ASSESSMENT', label: 'Skills Assessment', price: 40 },
];

export function AddOnServiceDialog({
    open,
    onClose,
    jobId,
    preselectedService,
}: AddOnServiceDialogProps) {
    const [serviceType, setServiceType] = useState(preselectedService || "");
    const [description, setDescription] = useState("");
    const [showRechargePrompt, setShowRechargePrompt] = useState(false);
    const [shortfall, setShortfall] = useState(0);

    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch wallet balance
    const { data: walletData } = useQuery({
        queryKey: ['wallet', 'balance'],
        queryFn: () => walletService.getBalance(),
        enabled: open,
    });

    const purchaseMutation = useMutation({
        mutationFn: async () => {
            const service = ADD_ON_SERVICES.find(s => s.value === serviceType);
            if (!service) throw new Error('Invalid service selected');

            return walletService.purchaseAddOnService({
                serviceType: service.value,
                jobId,
                amount: service.price,
                description: description || `${service.label} for job`,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] });
            queryClient.invalidateQueries({ queryKey: ['wallet', 'transactions'] });

            toast({
                title: "Service Purchased",
                description: "Add-on service has been added and charged to your wallet.",
            });

            handleClose();
        },
        onError: (error: any) => {
            if (error.type === 'INSUFFICIENT_BALANCE') {
                setShortfall(error.shortfall || 0);
                setShowRechargePrompt(true);
            } else {
                toast({
                    title: "Purchase Failed",
                    description: error.message || "Failed to purchase add-on service.",
                    variant: "destructive",
                });
            }
        },
    });

    const handleClose = () => {
        setServiceType(preselectedService || "");
        setDescription("");
        setShowRechargePrompt(false);
        setShortfall(0);
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!serviceType) {
            toast({
                title: "Service Required",
                description: "Please select an add-on service.",
                variant: "destructive",
            });
            return;
        }

        purchaseMutation.mutate();
    };

    const handleRecharge = () => {
        // TODO: Navigate to recharge/upgrade page
        toast({
            title: "Coming Soon",
            description: "Wallet recharge feature will be available soon.",
        });
    };

    const selectedService = ADD_ON_SERVICES.find(s => s.value === serviceType);
    const currentBalance = walletData?.balance || 0;
    const hasSufficientBalance = selectedService ? currentBalance >= selectedService.price : true;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Purchase Add-on Service</DialogTitle>
                    <DialogDescription>
                        Add recruitment services to your job posting
                    </DialogDescription>
                </DialogHeader>

                {showRechargePrompt ? (
                    /* Recharge Prompt */
                    <div className="space-y-4 py-4">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <p className="font-semibold mb-1">Insufficient Balance</p>
                                <p className="text-sm">
                                    You need ${shortfall.toFixed(2)} more to purchase this service.
                                </p>
                            </AlertDescription>
                        </Alert>

                        <div className="flex items-center justify-between p-4 border rounded-lg bg-accent/50">
                            <div>
                                <p className="text-sm text-muted-foreground">Current Balance</p>
                                <p className="text-2xl font-bold">${currentBalance.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Service Cost</p>
                                <p className="text-2xl font-bold text-red-600">${selectedService?.price || 0}</p>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button onClick={handleRecharge}>
                                <CreditCard className="h-4 w-4 mr-2" />
                                Recharge Wallet
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    /* Purchase Form */
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Wallet Balance */}
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-blue-50 dark:bg-blue-950/20">
                            <div className="flex items-center gap-2">
                                <Wallet className="h-4 w-4 text-blue-600" />
                                <span className="text-sm text-muted-foreground">Wallet Balance:</span>
                            </div>
                            <span className="font-semibold">${currentBalance.toFixed(2)}</span>
                        </div>

                        {/* Service Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="serviceType">Select Service *</Label>
                            <Select value={serviceType} onValueChange={setServiceType} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose an add-on service" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ADD_ON_SERVICES.map((service) => (
                                        <SelectItem key={service.value} value={service.value}>
                                            <div className="flex items-center justify-between w-full">
                                                <span>{service.label}</span>
                                                <Badge variant="outline" className="ml-2">${service.price}</Badge>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Service Details */}
                        {selectedService && (
                            <div className="p-3 rounded-lg border bg-accent/50">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="font-medium">{selectedService.label}</p>
                                    <p className="text-lg font-bold">${selectedService.price}</p>
                                </div>
                                {!hasSufficientBalance && (
                                    <Alert variant="destructive" className="mt-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription className="text-xs">
                                            Insufficient balance. You need ${(selectedService.price - currentBalance).toFixed(2)} more.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        )}

                        {/* Description/Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Notes (Optional)</Label>
                            <Textarea
                                id="description"
                                placeholder="Any special instructions or notes..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleClose} disabled={purchaseMutation.isPending}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={!hasSufficientBalance || purchaseMutation.isPending}>
                                {purchaseMutation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Purchase Service
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
