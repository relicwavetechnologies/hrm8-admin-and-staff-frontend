import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Application } from "@/shared/types/application";
import {
  Mail,
  Calendar,
  ClipboardCheck,
  Shield,
  FileText,
  GitCompare,
  Download,
  MoreHorizontal,
  Send,
  UserX,
  ArrowRight,
  Briefcase,
} from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";

interface QuickActionsToolbarProps {
  application: Application;
}

export function QuickActionsToolbar({ application }: QuickActionsToolbarProps) {
  const { toast } = useToast();

  const handleAction = (action: string) => {
    toast({
      title: `${action} - Coming Soon`,
      description: `This feature will be implemented in the next phase.`,
    });
  };

  return (
    <div className="px-6 pb-4 border-b bg-muted/20">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Move to Stage */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" size="sm" className="gap-2">
              <ArrowRight className="h-4 w-4" />
              Move to Stage
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => handleAction("Move to Resume Review")}>
              Resume Review
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction("Move to Phone Screen")}>
              Phone Screen
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction("Move to Technical Interview")}>
              Technical Interview
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction("Move to Manager Interview")}>
              Manager Interview
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction("Move to Final Round")}>
              Final Round
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction("Move to Reference Check")}>
              Reference Check
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleAction("Move to Offer Extended")}>
              Offer Extended
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction("Move to Offer Accepted")}>
              Offer Accepted
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Schedule Interview */}
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => handleAction("Schedule Interview")}
        >
          <Calendar className="h-4 w-4" />
          Schedule Interview
        </Button>

        {/* Send Email */}
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => handleAction("Send Email")}
        >
          <Mail className="h-4 w-4" />
          Send Email
        </Button>

        {/* Assign Assessment */}
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => handleAction("Assign Assessment")}
        >
          <ClipboardCheck className="h-4 w-4" />
          Assign Assessment
        </Button>

        {/* Request Background Check */}
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => handleAction("Background Check")}
        >
          <Shield className="h-4 w-4" />
          Background Check
        </Button>

        {/* Make Offer (conditional) */}
        {(application.stage === "Final Round" || application.stage === "Reference Check") && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-green-500 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950"
            onClick={() => handleAction("Make Offer")}
          >
            <Briefcase className="h-4 w-4" />
            Make Offer
          </Button>
        )}

        {/* More Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <MoreHorizontal className="h-4 w-4" />
              More
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => handleAction("Add to Compare")}>
              <GitCompare className="h-4 w-4 mr-2" />
              Add to Compare
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction("Export Profile")}>
              <Download className="h-4 w-4 mr-2" />
              Export Profile (PDF)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction("Send to Client")}>
              <Send className="h-4 w-4 mr-2" />
              Send to Client
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction("Generate Report")}>
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleAction("Reject Candidate")}
              className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
            >
              <UserX className="h-4 w-4 mr-2" />
              Reject Candidate
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
