import { Button } from "@/shared/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { Edit2 } from "lucide-react";

export function ViewOnlyEditButton() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled
            className="cursor-not-allowed"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Layout
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>This dashboard has a fixed layout and cannot be edited</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
