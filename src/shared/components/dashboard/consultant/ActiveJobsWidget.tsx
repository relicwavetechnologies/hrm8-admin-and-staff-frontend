import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Briefcase, Users } from "lucide-react";
import { format } from "date-fns";

interface ActiveJob {
    id: string;
    title: string;
    company: string;
    postedAt: string;
    activeCandidates: number;
}

interface ActiveJobsWidgetProps {
    jobs: ActiveJob[];
}

export function ActiveJobsWidget({ jobs }: ActiveJobsWidgetProps) {
    return (
        <Card className="col-span-2">
            <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Active Jobs
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {jobs.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No active jobs found.</p>
                    ) : (
                        jobs.map((job) => (
                            <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="space-y-1">
                                    <p className="font-medium text-sm">{job.title}</p>
                                    <p className="text-xs text-muted-foreground">{job.company}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                                            <Users className="h-3 w-3" />
                                            Candidates
                                        </div>
                                        <Badge variant="secondary" className="font-mono">
                                            {job.activeCandidates}
                                        </Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground w-20 text-right">
                                        {format(new Date(job.postedAt), 'MMM d')}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
