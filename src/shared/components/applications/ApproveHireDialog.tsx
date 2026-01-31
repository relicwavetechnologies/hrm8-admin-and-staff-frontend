
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { applicationService } from "@/shared/lib/applicationService";

interface ApproveHireDialogProps {
    applicationId: string;
    candidateName: string;
    jobTitle: string;
    onSuccess: () => void;
    trigger?: React.ReactNode;
}

export function ApproveHireDialog({
    applicationId,
    candidateName,
    jobTitle,
    onSuccess,
    trigger
}: ApproveHireDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleApprove = async () => {
        setLoading(true);
        try {
            const response = await applicationService.approveHire(applicationId);

            if (response.success) {
                toast.success("Candidate hire approved successfully!");
                setOpen(false);
                onSuccess();
            } else {
                toast.error(response.error || "Failed to approve hire");
            }
        } catch (error: any) {
            toast.error(error.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-green-600 hover:bg-green-700">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Approve Hire
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Confirm Hire Approval</DialogTitle>
                    <DialogDescription>
                        You are about to approve the hiring of <strong>{candidateName}</strong> for the position of <strong>{jobTitle}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <span className="text-amber-500">ℹ️</span>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-amber-700">
                                Approving this hire will:
                                <ul className="list-disc ml-4 mt-1">
                                    <li>Confirm the placement</li>
                                    <li>Finalize the commission for the consultant</li>
                                    <li>Mark the recruitment process as successful for this candidate</li>
                                </ul>
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={handleApprove}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Approving...
                            </>
                        ) : (
                            "Confirm Approval"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
