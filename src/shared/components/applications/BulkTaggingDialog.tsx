import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Tags, Plus, Minus } from "lucide-react";
import { PREDEFINED_TAGS, bulkAddTags, bulkRemoveTags } from "@/shared/lib/applicationTags";
import { toast } from "sonner";

interface BulkTaggingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedApplicationIds: string[];
  onComplete: () => void;
}

export function BulkTaggingDialog({
  open,
  onOpenChange,
  selectedApplicationIds,
  onComplete,
}: BulkTaggingDialogProps) {
  const [action, setAction] = useState<'add' | 'remove'>('add');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");

  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags(prev => [...prev, customTag.trim()]);
      setCustomTag("");
    }
  };

  const handleApply = () => {
    if (selectedTags.length === 0) {
      toast.error("Please select at least one tag");
      return;
    }

    if (action === 'add') {
      bulkAddTags(selectedApplicationIds, selectedTags);
      toast.success(`Tags added to ${selectedApplicationIds.length} application(s)`);
    } else {
      bulkRemoveTags(selectedApplicationIds, selectedTags);
      toast.success(`Tags removed from ${selectedApplicationIds.length} application(s)`);
    }

    setSelectedTags([]);
    onComplete();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Tags className="h-5 w-5" />
            <DialogTitle>Bulk Tag Management</DialogTitle>
          </div>
          <DialogDescription>
            Manage tags for {selectedApplicationIds.length} selected application(s)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Action Selection */}
          <div className="space-y-3">
            <Label>Action</Label>
            <RadioGroup value={action} onValueChange={(v) => setAction(v as 'add' | 'remove')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="add" id="add" />
                <Label htmlFor="add" className="flex items-center gap-2 font-normal cursor-pointer">
                  <Plus className="h-4 w-4 text-green-600" />
                  Add tags to selected applications
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="remove" id="remove" />
                <Label htmlFor="remove" className="flex items-center gap-2 font-normal cursor-pointer">
                  <Minus className="h-4 w-4 text-red-600" />
                  Remove tags from selected applications
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Tag Selection */}
          <div className="space-y-3">
            <Label>Select Tags</Label>
            <div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-muted/30 min-h-[100px]">
              {PREDEFINED_TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer text-xs px-3 py-1.5 hover:bg-accent transition-colors"
                  onClick={() => handleToggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Custom Tag Input */}
          <div className="space-y-3">
            <Label>Custom Tag</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter custom tag name..."
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTag()}
              />
              <Button
                onClick={handleAddCustomTag}
                disabled={!customTag.trim()}
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>

          {/* Selected Tags Preview */}
          {selectedTags.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Tags ({selectedTags.length})</Label>
              <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-background">
                {selectedTags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={selectedTags.length === 0}>
            {action === 'add' ? 'Add Tags' : 'Remove Tags'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
