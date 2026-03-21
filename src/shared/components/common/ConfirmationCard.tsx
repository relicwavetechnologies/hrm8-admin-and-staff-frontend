import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface ConfirmationCardProps {
    toolName: string;
    message: string;
    onConfirm: () => void;
    onReject: () => void;
}

export function ConfirmationCard({ toolName: _toolName, message, onConfirm, onReject }: ConfirmationCardProps) {
    return (
        <div className="mt-2 rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-orange-100 p-1.5 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                    <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-card-foreground">Confirmation Required</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{message}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
                <Button size="sm" onClick={onConfirm} className="w-full gap-1.5 bg-primary/90 hover:bg-primary">
                    <CheckCircle2 className="h-4 w-4" />
                    Confirm Action
                </Button>
                <Button size="sm" variant="outline" onClick={onReject} className="w-full gap-1.5">
                    <XCircle className="h-4 w-4" />
                    Cancel
                </Button>
            </div>
        </div>
    );
}
