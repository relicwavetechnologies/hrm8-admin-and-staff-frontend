import { useState } from "react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { Slider } from "@/shared/components/ui/slider";
import { Badge } from "@/shared/components/ui/badge";
import { Check, X, Edit2 } from "lucide-react";
import { applicationService } from "@/shared/lib/applicationService";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";

interface QuickScoringWidgetProps {
  applicationId: string;
  score?: number;
  onScoreUpdate?: (newScore: number) => void;
  variant?: "inline" | "card";
  showSlider?: boolean;
}

export function QuickScoringWidget({ 
  applicationId, 
  score, 
  onScoreUpdate,
  variant = "inline",
  showSlider = false 
}: QuickScoringWidgetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingScore, setEditingScore] = useState(score?.toString() || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleScoreUpdate = async () => {
    const numScore = parseFloat(editingScore);
    if (isNaN(numScore) || numScore < 0 || numScore > 100) {
      toast.error("Score must be between 0 and 100");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await applicationService.updateScore(applicationId, numScore);
      if (response.success) {
        toast.success("Score updated");
        setIsEditing(false);
        onScoreUpdate?.(numScore);
      } else {
        toast.error("Failed to update score", {
          description: response.error || "Please try again"
        });
      }
    } catch (error) {
      console.error('Failed to update score:', error);
      toast.error("Failed to update score");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSliderChange = async (values: number[]) => {
    const newScore = values[0];
    setEditingScore(newScore.toString());
    
    setIsUpdating(true);
    try {
      const response = await applicationService.updateScore(applicationId, newScore);
      if (response.success) {
        onScoreUpdate?.(newScore);
      } else {
        toast.error("Failed to update score");
      }
    } catch (error) {
      console.error('Failed to update score:', error);
      toast.error("Failed to update score");
    } finally {
      setIsUpdating(false);
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return "text-muted-foreground";
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreLabel = (score?: number) => {
    if (!score) return "Not scored";
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Great";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    return "Poor";
  };

  if (variant === "card") {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Fit Score</span>
          {score !== undefined && (
            <Badge variant="outline" className={cn("text-xs", getScoreColor(score))}>
              {getScoreLabel(score)}
            </Badge>
          )}
        </div>
        
        {showSlider && score !== undefined ? (
          <div className="space-y-2">
            <Slider
              value={[score]}
              onValueChange={handleSliderChange}
              max={100}
              step={1}
              disabled={isUpdating}
              className="w-full"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span className="font-semibold text-foreground">{score}/100</span>
              <span>100</span>
            </div>
          </div>
        ) : isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              max="100"
              value={editingScore}
              onChange={(e) => setEditingScore(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleScoreUpdate();
                if (e.key === 'Escape') {
                  setIsEditing(false);
                  setEditingScore(score?.toString() || "");
                }
              }}
              className="flex-1"
              autoFocus
              disabled={isUpdating}
            />
            <Button
              size="sm"
              onClick={handleScoreUpdate}
              disabled={isUpdating}
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsEditing(false);
                setEditingScore(score?.toString() || "");
              }}
              disabled={isUpdating}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div 
                className={cn("text-2xl font-bold cursor-pointer hover:opacity-70 transition-opacity", getScoreColor(score))}
                onClick={() => setIsEditing(true)}
              >
                {score !== undefined ? score : "—"}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            </div>
            {score !== undefined && (
              <Progress value={score} className="h-2" />
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
            min="0"
            max="100"
            value={editingScore}
            onChange={(e) => setEditingScore(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleScoreUpdate();
              if (e.key === 'Escape') {
                setIsEditing(false);
                setEditingScore(score?.toString() || "");
              }
            }}
            className="w-20 h-8"
            autoFocus
            disabled={isUpdating}
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={handleScoreUpdate}
            disabled={isUpdating}
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsEditing(false);
              setEditingScore(score?.toString() || "");
            }}
            disabled={isUpdating}
          >
            <X className="h-3 w-3" />
          </Button>
        </>
      ) : (
        <>
          <div 
            className={cn("font-semibold cursor-pointer hover:opacity-70 transition-opacity", getScoreColor(score))}
            onClick={() => setIsEditing(true)}
          >
            {score !== undefined ? `${score}/100` : "Not scored"}
          </div>
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

