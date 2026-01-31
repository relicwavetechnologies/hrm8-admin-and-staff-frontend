import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { ListFilter } from "lucide-react";

interface PipelineStage {
    stage: string;
    count: number;
}

interface PipelineSnapshotWidgetProps {
    stages: PipelineStage[];
}

const STAGE_ORDER = [
    'NEW_APPLICATION', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'
];

const STAGE_LABELS: Record<string, string> = {
    'NEW_APPLICATION': 'New Applications',
    'SCREENING': 'Screening',
    'INTERVIEW': 'Interview',
    'OFFER': 'Offer Extended',
    'HIRED': 'Hired',
    'REJECTED': 'Rejected'
};

const STAGE_COLORS: Record<string, string> = {
    'NEW_APPLICATION': 'bg-blue-500',
    'SCREENING': 'bg-indigo-500',
    'INTERVIEW': 'bg-purple-500',
    'OFFER': 'bg-green-500',
    'HIRED': 'bg-emerald-600',
    'REJECTED': 'bg-red-200'
};

export function PipelineSnapshotWidget({ stages }: PipelineSnapshotWidgetProps) {
    // Normalize and sort stages
    const processedStages = STAGE_ORDER.map(key => {
        const found = stages.find(s => s.stage === key);
        return {
            key,
            label: STAGE_LABELS[key] || key,
            count: found?.count || 0,
            color: STAGE_COLORS[key] || 'bg-gray-200'
        };
    }).filter(s => s.count > 0 || ['SCREENING', 'INTERVIEW', 'OFFER'].includes(s.key));

    const totalCandidates = stages.reduce((acc, curr) => acc + curr.count, 0);

    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <ListFilter className="h-4 w-4" />
                    Pipeline Status
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {processedStages.map((stage) => (
                        <div key={stage.key} className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="font-medium text-muted-foreground">{stage.label}</span>
                                <span className="font-bold">{stage.count}</span>
                            </div>
                            <Progress
                                value={totalCandidates > 0 ? (stage.count / totalCandidates) * 100 : 0}
                                className="h-2"
                                indicatorClassName={stage.color}
                            />
                        </div>
                    ))}
                    {stages.length === 0 && (
                        <p className="text-sm text-muted-foreground">No candidates in pipeline.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
