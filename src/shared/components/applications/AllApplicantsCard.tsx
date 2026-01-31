import { Card } from "@/shared/components/ui/card";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Calendar, Users } from "lucide-react";

interface AllApplicantsCardProps {
  onClick: () => void;
  count?: number;
}

/**
 * All Applicants Card
 * Styled to visually match a single ApplicationCard in the pipeline.
 */
export function AllApplicantsCard({ onClick, count }: AllApplicantsCardProps) {
  return (
    <Card
      className="p-2.5 cursor-pointer hover:shadow-md transition-all relative group"
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            AA
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold truncate">
            All Applicants
          </h4>
          <p className="text-xs text-muted-foreground truncate leading-tight">
            View everyone who applied to this job
          </p>

          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-0.5">
              <Users className="h-2.5 w-2.5" />
              <span>{count ?? 0} total</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Calendar className="h-2.5 w-2.5" />
              <span>List view</span>
            </div>
          </div>

          <div className="mt-1.5">
            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
              Open list
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}














































