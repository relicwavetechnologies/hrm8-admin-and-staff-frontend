import { useState } from "react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Check, X, Edit2, ChevronUp, ChevronDown } from "lucide-react";
import { applicationService } from "@/shared/lib/applicationService";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";

interface RankingWidgetProps {
  applicationId: string;
  rank?: number;
  onRankUpdate?: (newRank: number) => void;
  variant?: "inline" | "card";
  canReorder?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export function RankingWidget({
  applicationId,
  rank,
  onRankUpdate,
  variant = "inline",
  canReorder = false,
  onMoveUp,
  onMoveDown
}: RankingWidgetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingRank, setEditingRank] = useState(rank?.toString() || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRankUpdate = async () => {
    const numRank = parseInt(editingRank, 10);
    if (isNaN(numRank) || numRank < 1) {
      toast.error("Rank must be at least 1");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await applicationService.updateRank(applicationId, numRank);
      if (response.success) {
        toast.success("Rank updated");
        setIsEditing(false);
        onRankUpdate?.(numRank);
      } else {
        toast.error("Failed to update rank", {
          description: response.error || "Please try again"
        });
      }
    } catch (error) {
      console.error('Failed to update rank:', error);
      toast.error("Failed to update rank");
    } finally {
      setIsUpdating(false);
    }
  };

  if (variant === "card") {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Rank</span>
        </div>

        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="1"
              value={editingRank}
              onChange={(e) => setEditingRank(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRankUpdate();
                if (e.key === 'Escape') {
                  setIsEditing(false);
                  setEditingRank(rank?.toString() || "");
                }
              }}
              className="flex-1"
              autoFocus
              disabled={isUpdating}
            />
            <Button
              size="sm"
              onClick={handleRankUpdate}
              disabled={isUpdating}
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsEditing(false);
                setEditingRank(rank?.toString() || "");
              }}
              disabled={isUpdating}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="text-base font-bold px-3 py-1 cursor-pointer hover:opacity-70 transition-opacity"
              onClick={() => setIsEditing(true)}
            >
              #{rank || "—"}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            {canReorder && (
              <div className="flex flex-col gap-0.5 ml-auto">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 w-5 p-0"
                        onClick={onMoveUp}
                        disabled={!rank || rank <= 1}
                      >
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Move up</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 w-5 p-0"
                        onClick={onMoveDown}
                        disabled={!rank}
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Move down</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Inline variant
  return (
    <div className="flex items-center gap-2">
      {isEditing ? (
        <>
          <Input
            type="number"
            min="1"
            value={editingRank}
            onChange={(e) => setEditingRank(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRankUpdate();
              if (e.key === 'Escape') {
                setIsEditing(false);
                setEditingRank(rank?.toString() || "");
              }
            }}
            className="w-20 h-8"
            autoFocus
            disabled={isUpdating}
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRankUpdate}
            disabled={isUpdating}
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsEditing(false);
              setEditingRank(rank?.toString() || "");
            }}
            disabled={isUpdating}
          >
            <X className="h-3 w-3" />
          </Button>
        </>
      ) : (
        <>
          <Badge
            variant="secondary"
            className="font-semibold cursor-pointer hover:opacity-70 transition-opacity"
            onClick={() => setIsEditing(true)}
          >
            #{rank || "—"}
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(true)}
            className="h-6 w-6 p-0"
          >
            <Edit2 className="h-3 w-3" />
          </Button>
        </>
      )}
    </div>
  );
}

