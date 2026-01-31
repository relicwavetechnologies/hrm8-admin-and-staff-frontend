import { useMemo } from "react";
import { DataTable, Column } from "@/shared/components/tables/DataTable";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { AIMatchBadge } from "./AIMatchBadge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { MoreVertical, Eye, Mail, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { FileText } from "lucide-react";
import type { Application, ApplicationStatus } from "@/shared/types/application";

interface ApplicationListViewProps {
  applications: Application[];
  onApplicationClick: (application: Application) => void;
  selectable?: boolean;
  onSelectedRowsChange?: (selectedIds: string[]) => void;
}

const statusConfig: Record<ApplicationStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  applied: { label: "Applied", variant: "outline" },
  screening: { label: "Screening", variant: "secondary" },
  interview: { label: "Interview", variant: "default" },
  offer: { label: "Offer", variant: "default" },
  hired: { label: "Hired", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
  withdrawn: { label: "Withdrawn", variant: "outline" },
};

const stageColors: Record<string, string> = {
  'New Application': 'bg-blue-500',
  'Resume Review': 'bg-cyan-500',
  'Phone Screen': 'bg-purple-500',
  'Technical Interview': 'bg-indigo-500',
  'Manager Interview': 'bg-violet-500',
  'Final Round': 'bg-fuchsia-500',
  'Reference Check': 'bg-pink-500',
  'Offer Extended': 'bg-green-500',
  'Offer Accepted': 'bg-emerald-500',
  'Rejected': 'bg-red-500',
  'Withdrawn': 'bg-gray-500',
};

export function ApplicationListView({
  applications,
  onApplicationClick,
  selectable = false,
  onSelectedRowsChange,
}: ApplicationListViewProps) {
  const columns: Column<Application>[] = useMemo(() => [
    {
      key: "candidateName",
      label: "Candidate",
      sortable: true,
      render: (app: Application) => (
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-8 w-8">
              <AvatarImage src={app.candidatePhoto} />
              <AvatarFallback>
                {app.candidateName.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {(app.isNew || !app.isRead) && (
              <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-blue-500 rounded-full border-2 border-background" />
            )}
          </div>
          <div className="flex flex-col">
            <span className={`font-medium ${!app.isRead ? 'font-semibold' : ''}`}>
              {app.candidateName}
            </span>
            <span className="text-xs text-muted-foreground">{app.candidateEmail}</span>
          </div>
        </div>
      ),
    },
    {
      key: "jobTitle",
      label: "Job Position",
      sortable: true,
      render: (app: Application) => (
        <div className="flex flex-col">
          <span className="font-medium">{app.jobTitle}</span>
          <span className="text-xs text-muted-foreground">{app.employerName}</span>
        </div>
      ),
    },
    {
      key: "aiMatchScore",
      label: "AI Match",
      sortable: true,
      width: "120px",
      render: (app: Application) => {
        if (!app.aiMatchScore) return <span className="text-muted-foreground text-sm">-</span>;
        return <AIMatchBadge score={app.aiMatchScore} size="sm" />;
      },
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (app: Application) => {
        const config = statusConfig[app.status as ApplicationStatus];
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: "stage",
      label: "Stage",
      sortable: true,
      render: (app: Application) => {
        const color = stageColors[app.stage] || 'bg-gray-500';
        return (
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${color}`} />
            <span className="text-sm">{app.stage}</span>
          </div>
        );
      },
    },
    {
      key: "appliedDate",
      label: "Applied Date",
      render: (app: Application) => <span className="text-sm">{format(app.appliedDate, "MMM d, yyyy")}</span>,
    },
    {
      key: "score",
      label: "Score",
      sortable: true,
      render: (app: Application) => {
        if (app.score === undefined || app.score === null) {
          return <span className="text-muted-foreground text-sm">—</span>;
        }
        const passed = app.score >= 70;
        return (
          <div className="flex flex-col items-center leading-tight">
            <Badge variant={passed ? "success" : "destructive"} className="text-xs px-1.5 py-0.5">
              {passed ? "Pass" : "Fail"}
            </Badge>
            <span className="text-xs text-muted-foreground">{app.score}%</span>
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (app: Application) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onApplicationClick(app)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <CheckCircle className="mr-2 h-4 w-4" />
              Move to Next Stage
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <XCircle className="mr-2 h-4 w-4" />
              Reject Application
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [onApplicationClick]);

  if (applications.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No applications found"
        description="No applications match your current filters. Try adjusting your search criteria."
      />
    );
  }

  return (
    <DataTable
      columns={columns}
      data={applications}
      searchable
      searchKeys={["candidateName", "candidateEmail", "jobTitle"]}
      emptyMessage="No applications found"
      selectable={selectable}
      onSelectedRowsChange={onSelectedRowsChange}
    />
  );
}
