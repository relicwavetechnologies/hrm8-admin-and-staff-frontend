import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  MoreHorizontal,
  Move,
  Star,
  X,
  Calendar,
  User,
  Tag,
  Download
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";


interface ApplicationQuickActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkMove?: () => void;
  onBulkShortlist?: () => void;
  onBulkReject?: () => void;
  onBulkScheduleInterview?: () => void;
  onBulkAssignRecruiter?: () => void;
  onBulkAddTags?: () => void;
  onBulkExport?: () => void;
}

export function ApplicationQuickActions({
  selectedCount,
  onClearSelection,
  onBulkMove,
  onBulkShortlist,
  onBulkReject,
  onBulkScheduleInterview,
  onBulkAssignRecruiter,
  onBulkAddTags,
  onBulkExport,
}: ApplicationQuickActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-background border rounded-lg shadow-lg px-4 py-3 flex items-center gap-3">
        <Badge variant="secondary" className="text-sm font-semibold">
          {selectedCount} {selectedCount === 1 ? 'candidate' : 'candidates'} selected
        </Badge>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-2">
          {onBulkMove && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkMove}
              className="h-8"
            >
              <Move className="h-3.5 w-3.5 mr-2" />
              Move
            </Button>
          )}

          {onBulkShortlist && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkShortlist}
              className="h-8"
            >
              <Star className="h-3.5 w-3.5 mr-2" />
              Shortlist
            </Button>
          )}

          {onBulkScheduleInterview && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkScheduleInterview}
              className="h-8"
            >
              <Calendar className="h-3.5 w-3.5 mr-2" />
              Schedule
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <MoreHorizontal className="h-3.5 w-3.5 mr-2" />
                More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onBulkAssignRecruiter && (
                <DropdownMenuItem onClick={onBulkAssignRecruiter}>
                  <User className="h-4 w-4 mr-2" />
                  Assign Recruiter
                </DropdownMenuItem>
              )}
              {onBulkAddTags && (
                <DropdownMenuItem onClick={onBulkAddTags}>
                  <Tag className="h-4 w-4 mr-2" />
                  Add Tags
                </DropdownMenuItem>
              )}
              {onBulkExport && (
                <DropdownMenuItem onClick={onBulkExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Selected
                </DropdownMenuItem>
              )}
              {onBulkReject && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onBulkReject} className="text-destructive">
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="h-8"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

