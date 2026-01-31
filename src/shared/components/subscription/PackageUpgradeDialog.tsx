import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";

interface PackageUpgradeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    companyId: string;
    onUpgradeSuccess?: () => void;
}

export function PackageUpgradeDialog({ open, onOpenChange, companyId, onUpgradeSuccess }: PackageUpgradeDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Upgrade Your Package</DialogTitle>
                    <DialogDescription>
                        You are currently on the ATS Lite plan. Upgrade to a paid plan to access recruitment consultant services for company ID: {companyId}.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                    <Button onClick={() => onUpgradeSuccess?.()} className="w-full">
                        Upgrade to Pro
                    </Button>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
