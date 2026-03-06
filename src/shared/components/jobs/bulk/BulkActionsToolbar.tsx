import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/shared/components/ui/select";
import { X, Archive, Trash2 } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";

interface BulkActionsToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkAction: (action: string) => void;
}

export function BulkActionsToolbar({
  selectedCount,
  onClearSelection,
  onBulkAction
}: BulkActionsToolbarProps) {
  const { toast } = useToast();

  if (selectedCount === 0) return null;

  const handleAction = (action: string) => {
    onBulkAction(action);
    toast({
      title: "Action completed",
      description: `${selectedCount} job(s) updated successfully.`,
    });
  };

  return (
    <div className="sticky top-0 z-10 bg-primary/10 border-b border-primary/20 p-4 mb-4 rounded-lg">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Badge variant="default" className="font-semibold">
            {selectedCount} selected
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Select onValueChange={(value) => handleAction(`status:${value}`)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Change Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Close</SelectItem>
              <SelectItem value="on_hold">Put on Hold</SelectItem>
              <SelectItem value="draft">Move to Draft</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={(value) => handleAction(`assign:${value}`)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Assign Consultant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sarah">Sarah Johnson</SelectItem>
              <SelectItem value="michael">Michael Chen</SelectItem>
              <SelectItem value="emma">Emma Wilson</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction("archive")}
          >
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction("delete")}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
