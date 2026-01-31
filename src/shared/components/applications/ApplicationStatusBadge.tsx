import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";

export type ApplicationStatus =
    | "NEW"
    | "SCREENING"
    | "INTERVIEW"
    | "OFFER"
    | "HIRED"
    | "REJECTED"
    | "WITHDRAWN"
    | "ARCHIVED"
    | string;

interface ApplicationStatusBadgeProps {
    status: ApplicationStatus;
    className?: string;
}

export function ApplicationStatusBadge({ status, className }: ApplicationStatusBadgeProps) {
    const normalizedStatus = status?.toUpperCase() || "NEW";

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "NEW":
                return { label: "New", variant: "default" as const, className: "bg-blue-500 hover:bg-blue-600" };
            case "SCREENING":
                return { label: "Screening", variant: "secondary" as const, className: "bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300" };
            case "INTERVIEW":
                return { label: "Interview", variant: "outline" as const, className: "border-orange-200 text-orange-700 bg-orange-50 dark:border-orange-800 dark:text-orange-300 dark:bg-orange-900/20" };
            case "OFFER":
                return { label: "Offer", variant: "default" as const, className: "bg-emerald-500 hover:bg-emerald-600" };
            case "HIRED":
                return { label: "Hired", variant: "default" as const, className: "bg-green-600 hover:bg-green-700" };
            case "REJECTED":
                return { label: "Rejected", variant: "destructive" as const, className: "" };
            case "WITHDRAWN":
                return { label: "Withdrawn", variant: "outline" as const, className: "text-muted-foreground" };
            case "ARCHIVED":
                return { label: "Archived", variant: "outline" as const, className: "text-muted-foreground border-dashed" };
            default:
                return { label: status, variant: "outline" as const, className: "" };
        }
    };

    const config = getStatusConfig(normalizedStatus);

    return (
        <Badge
            variant={config.variant}
            className={cn("font-medium", config.className, className)}
        >
            {config.label}
        </Badge>
    );
}
