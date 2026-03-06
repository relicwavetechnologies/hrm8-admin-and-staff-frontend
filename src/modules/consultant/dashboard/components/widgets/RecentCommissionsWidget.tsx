import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { DollarSign } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/shared/lib/utils";

interface Commission {
    id: string;
    amount: number;
    status: string;
    description: string;
    date: string;
    jobTitle?: string;
}

interface RecentCommissionsWidgetProps {
    commissions: Commission[];
}

export function RecentCommissionsWidget({ commissions = [] }: RecentCommissionsWidgetProps) {
    const commissionsList = Array.isArray(commissions) ? commissions : [];
    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
            <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Recent Activity
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {commissionsList.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No recent commissions.</p>
                    ) : (
                        commissionsList.map((c) => (
                            <div key={c.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                <div className="space-y-1 overflow-hidden mr-2">
                                    <p className="font-medium text-sm truncate" title={c.description}>
                                        {c.jobTitle || (c as any).job_title || 'Commission'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {format(new Date(c.date || (c as any).created_at || new Date()), 'MMM d, yyyy')}
                                    </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="font-bold text-sm text-emerald-600">
                                        +${c.amount.toLocaleString()}
                                    </p>
                                    <Badge
                                        variant={c.status === 'PAID' ? 'default' : 'outline'}
                                        className={cn("text-[10px] h-5 px-1 mt-1",
                                            c.status === 'PAID' ? 'bg-emerald-500 hover:bg-emerald-600' : 'text-amber-600 border-amber-200 bg-amber-50'
                                        )}
                                    >
                                        {c.status}
                                    </Badge>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
