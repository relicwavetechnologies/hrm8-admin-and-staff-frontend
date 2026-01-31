import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { applicationService } from "@/shared/lib/applicationService";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";

interface ShortlistButtonProps {
  applicationId: string;
  shortlisted: boolean;
  onShortlistChange?: (shortlisted: boolean) => void;
  variant?: "button" | "icon" | "badge";
  size?: "sm" | "default" | "lg";
  showLabel?: boolean;
}

export function ShortlistButton({ 
  applicationId, 
  shortlisted,
  onShortlistChange,
  variant = "button",
  size = "default",
  showLabel = true
}: ShortlistButtonProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      const response = shortlisted
        ? await applicationService.unshortlistCandidate(applicationId)
        : await applicationService.shortlistCandidate(applicationId);
      
      if (response.success) {
        toast.success(shortlisted ? "Candidate unshortlisted" : "Candidate shortlisted");
        onShortlistChange?.(!shortlisted);
      } else {
        toast.error(shortlisted ? "Failed to unshortlist" : "Failed to shortlist", {
          description: response.error || "Please try again"
        });
      }
    } catch (error) {
      console.error('Failed to update shortlist status:', error);
      toast.error(shortlisted ? "Failed to unshortlist" : "Failed to shortlist");
    } finally {
      setIsUpdating(false);
    }
  };

  if (variant === "badge") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant={shortlisted ? "default" : "outline"}
              className={cn(
                "cursor-pointer hover:opacity-70 transition-opacity flex items-center gap-1",
                shortlisted && "bg-primary text-primary-foreground"
              )}
              onClick={handleToggle}
            >
              {shortlisted ? (
                <>
                  <BookmarkCheck className="h-3 w-3" />
                  Shortlisted
                </>
              ) : (
                <>
                  <Bookmark className="h-3 w-3" />
                  Not Shortlisted
                </>
              )}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            {shortlisted ? "Click to unshortlist" : "Click to shortlist"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === "icon") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={shortlisted ? "default" : "ghost"}
              size={size}
              onClick={handleToggle}
              disabled={isUpdating}
              className={cn(
                "h-8 w-8 p-0",
                shortlisted && "bg-primary hover:bg-primary/90"
              )}
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : shortlisted ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {shortlisted ? "Unshortlist candidate" : "Shortlist candidate"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Button variant
  return (
    <Button
      variant={shortlisted ? "default" : "outline"}
      size={size}
      onClick={handleToggle}
      disabled={isUpdating}
      className={cn(
        shortlisted && "bg-primary hover:bg-primary/90"
      )}
    >
      {isUpdating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {shortlisted ? "Unshortlisting..." : "Shortlisting..."}
        </>
      ) : shortlisted ? (
        <>
          <BookmarkCheck className="h-4 w-4 mr-2" />
          {showLabel && "Unshortlist"}
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4 mr-2" />
          {showLabel && "Shortlist"}
        </>
      )}
    </Button>
  );
}

