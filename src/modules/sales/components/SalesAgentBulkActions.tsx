import { Button } from "@/shared/components/ui/button";
import { Download, Trash2, Mail, X } from "lucide-react";

interface SalesAgentBulkActionsProps {
  selectedCount: number;
  onExport: () => void;
  onDelete: () => void;
  onSendEmail: () => void;
  onClearSelection: () => void;
}

export function SalesAgentBulkActions({
  selectedCount,
  onExport,
  onDelete,
  onSendEmail,
  onClearSelection,
}: SalesAgentBulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-background border rounded-lg shadow-lg p-4 flex items-center gap-4">
        <span className="text-sm font-medium">
          {selectedCount} agent{selectedCount > 1 ? 's' : ''} selected
        </span>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Button size="sm" variant="outline" onClick={onSendEmail}>
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </Button>

          <Button size="sm" variant="destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>

          <Button size="sm" variant="ghost" onClick={onClearSelection}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
