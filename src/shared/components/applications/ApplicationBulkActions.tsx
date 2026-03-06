import { Button } from "@/shared/components/ui/button";

import { CheckSquare, Mail, Trash2, UserPlus, Download } from "lucide-react";

interface ApplicationBulkActionsProps {
  selectedCount: number;
  onMoveStage: () => void;
  onSendEmail: () => void;
  onAssignRecruiter: () => void;
  onReject: () => void;
  onExport: () => void;
  onClearSelection: () => void;
}

export function ApplicationBulkActions({
  selectedCount,
  onMoveStage,
  onSendEmail,
  onAssignRecruiter,
  onReject,
  onExport,
  onClearSelection,
}: ApplicationBulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-card border shadow-lg rounded-lg p-4 flex items-center gap-3 z-50">
      <div className="flex items-center gap-2">
        <CheckSquare className="h-4 w-4" />
        <span className="font-medium">{selectedCount} selected</span>
      </div>

      <div className="h-6 w-px bg-border" />

      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={onMoveStage}>
          Move Stage
        </Button>
        <Button size="sm" variant="outline" onClick={onSendEmail}>
          <Mail className="h-4 w-4 mr-2" />
          Email
        </Button>
        <Button size="sm" variant="outline" onClick={onAssignRecruiter}>
          <UserPlus className="h-4 w-4 mr-2" />
          Assign
        </Button>
        <Button size="sm" variant="outline" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button size="sm" variant="destructive" onClick={onReject}>
          <Trash2 className="h-4 w-4 mr-2" />
          Reject
        </Button>
      </div>

      <div className="h-6 w-px bg-border" />

      <Button size="sm" variant="ghost" onClick={onClearSelection}>
        Clear
      </Button>
    </div>
  );
}
