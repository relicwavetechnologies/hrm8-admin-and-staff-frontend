import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Send, FileDown, Edit, X } from "lucide-react";

interface BackgroundChecksBulkActionsToolbarProps {
  selectedCount: number;
  onSendReminders: () => void;
  onExportReports: () => void;
  onUpdateStatus: (status: string) => void;
  onCancel: () => void;
  onClearSelection: () => void;
}

export function BackgroundChecksBulkActionsToolbar({
  selectedCount,
  onSendReminders,
  onExportReports,
  onUpdateStatus,
  onCancel,
  onClearSelection,
}: BackgroundChecksBulkActionsToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-background border rounded-lg shadow-lg p-4 flex items-center gap-4">
        <span className="text-sm font-medium">
          {selectedCount} check{selectedCount > 1 ? 's' : ''} selected
        </span>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onSendReminders}>
            <Send className="h-4 w-4 mr-2" />
            Send Reminders
          </Button>

          <Button size="sm" variant="outline" onClick={onExportReports}>
            <FileDown className="h-4 w-4 mr-2" />
            Export Reports
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Update Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onUpdateStatus('in-progress')}>
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateStatus('completed')}>
                Completed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateStatus('issues-found')}>
                Issues Found
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onCancel} className="text-destructive">
                Cancel Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" variant="ghost" onClick={onClearSelection}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
