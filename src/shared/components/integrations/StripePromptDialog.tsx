/**
 * Payment Integration Prompt Dialog
 * Prompts users to connect Airwallex when attempting payments without integration
 */

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { CreditCard, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StripePromptDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    redirectPath?: string;
}

export function StripePromptDialog({
    open,
    onOpenChange,
    redirectPath = '/integrations?tab=payments'
}: StripePromptDialogProps) {
    const navigate = useNavigate();

    const handleGoToIntegrations = () => {
        onOpenChange(false);
        navigate(redirectPath);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="rounded-full bg-primary/10 p-3">
                            <CreditCard className="h-6 w-6 text-primary" />
                        </div>
                        <DialogTitle className="text-xl">Connect Airwallex to Continue</DialogTitle>
                    </div>
                    <DialogDescription className="text-base">
                        To make payments, you need to connect your Airwallex account first.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="rounded-lg bg-muted p-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Airwallex handles payment processing securely. You'll be redirected to complete
                            a quick onboarding process to connect your account.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium">What happens next:</p>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                            <li>Navigate to Integrations page</li>
                            <li>Click "Connect Airwallex Account"</li>
                            <li>Complete Airwallex onboarding</li>
                            <li>Return and complete your payment</li>
                        </ul>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="w-full sm:w-auto"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleGoToIntegrations}
                        className="w-full sm:w-auto"
                    >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Go to Integrations
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
