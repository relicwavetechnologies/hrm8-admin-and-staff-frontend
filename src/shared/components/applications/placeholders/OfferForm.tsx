import { Button } from "@/shared/components/ui/button";

export function OfferForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void; candidateName: string; jobTitle: string; job: any }) {
    return (
        <div className="p-4 space-y-4">
            <p className="text-muted-foreground">Offer Form Placeholder</p>
            <div className="flex gap-2">
                <Button onClick={() => onSubmit({})}>Create Offer</Button>
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
            </div>
        </div>
    );
}
