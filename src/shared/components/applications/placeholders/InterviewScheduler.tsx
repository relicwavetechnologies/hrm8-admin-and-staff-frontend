import { Button } from "@/shared/components/ui/button";

export function InterviewScheduler({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void; candidateName: string; jobTitle: string }) {
    return (
        <div className="p-4 space-y-4">
            <p className="text-muted-foreground">Interview Scheduler Placeholder</p>
            <div className="flex gap-2">
                <Button onClick={() => onSubmit({})}>Schedule</Button>
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
            </div>
        </div>
    );
}
