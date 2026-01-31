import { ApplicationStage } from "@/shared/types/application";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { 
  ChevronDown, 
  FileText, 
  Phone, 
  Code, 
  Users, 
  CheckCircle, 
  XCircle,
  ArrowRight
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface StageDropdownMenuProps {
  currentStage: ApplicationStage;
  onStageChange: (stage: ApplicationStage) => void;
  variant?: "button" | "trigger";
  size?: "sm" | "default" | "lg";
}

const stageConfig: Record<ApplicationStage, { label: string; icon: any; color: string }> = {
  "New Application": {
    label: "New Application",
    icon: FileText,
    color: "text-blue-600 dark:text-blue-400",
  },
  "Resume Review": {
    label: "Resume Review",
    icon: FileText,
    color: "text-purple-600 dark:text-purple-400",
  },
  "Phone Screen": {
    label: "Phone Screen",
    icon: Phone,
    color: "text-amber-600 dark:text-amber-400",
  },
  "Technical Interview": {
    label: "Technical Interview",
    icon: Code,
    color: "text-cyan-600 dark:text-cyan-400",
  },
  "Manager Interview": {
    label: "Manager Interview",
    icon: Users,
    color: "text-indigo-600 dark:text-indigo-400",
  },
  "Final Round": {
    label: "Final Round",
    icon: CheckCircle,
    color: "text-violet-600 dark:text-violet-400",
  },
  "Reference Check": {
    label: "Reference Check",
    icon: Users,
    color: "text-pink-600 dark:text-pink-400",
  },
  "Offer Extended": {
    label: "Offer Extended",
    icon: CheckCircle,
    color: "text-green-600 dark:text-green-400",
  },
  "Offer Accepted": {
    label: "Offer Accepted",
    icon: CheckCircle,
    color: "text-emerald-600 dark:text-emerald-400",
  },
  "Rejected": {
    label: "Rejected",
    icon: XCircle,
    color: "text-red-600 dark:text-red-400",
  },
  "Withdrawn": {
    label: "Withdrawn",
    icon: XCircle,
    color: "text-gray-600 dark:text-gray-400",
  },
};

const stageOrder: ApplicationStage[] = [
  "New Application",
  "Resume Review",
  "Phone Screen",
  "Technical Interview",
  "Manager Interview",
  "Final Round",
  "Reference Check",
  "Offer Extended",
  "Offer Accepted",
  "Rejected",
  "Withdrawn",
];

export function StageDropdownMenu({ 
  currentStage, 
  onStageChange,
  variant = "button",
  size = "default"
}: StageDropdownMenuProps) {
  const currentConfig = stageConfig[currentStage];
  const CurrentIcon = currentConfig.icon;

  const handleStageChange = (stage: ApplicationStage) => {
    if (stage !== currentStage) {
      onStageChange(stage);
    }
  };

  const getNextStages = (): ApplicationStage[] => {
    const currentIndex = stageOrder.indexOf(currentStage);
    if (currentIndex === -1) return stageOrder;
    return stageOrder.slice(currentIndex + 1);
  };

  const getPreviousStages = (): ApplicationStage[] => {
    const currentIndex = stageOrder.indexOf(currentStage);
    if (currentIndex === -1) return [];
    return stageOrder.slice(0, currentIndex);
  };

  const nextStages = getNextStages();
  const previousStages = getPreviousStages();

  if (variant === "trigger") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size={size} className="h-auto p-2">
            <CurrentIcon className={cn("h-4 w-4 mr-2", currentConfig.color)} />
            <span className="text-sm">{currentConfig.label}</span>
            <ChevronDown className="h-3 w-3 ml-2 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Move to Stage</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Current Stage */}
          <DropdownMenuItem disabled className="opacity-100">
            <CurrentIcon className={cn("h-4 w-4 mr-2", currentConfig.color)} />
            <span>{currentConfig.label}</span>
            <Badge variant="outline" className="ml-auto">Current</Badge>
          </DropdownMenuItem>

          {nextStages.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">Next Stages</DropdownMenuLabel>
              {nextStages.map((stage) => {
                const config = stageConfig[stage];
                const Icon = config.icon;
                return (
                  <DropdownMenuItem
                    key={stage}
                    onClick={() => handleStageChange(stage)}
                  >
                    <ArrowRight className="h-4 w-4 mr-2 opacity-50" />
                    <Icon className={cn("h-4 w-4 mr-2", config.color)} />
                    <span>{config.label}</span>
                  </DropdownMenuItem>
                );
              })}
            </>
          )}

          {previousStages.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">Previous Stages</DropdownMenuLabel>
              {previousStages.map((stage) => {
                const config = stageConfig[stage];
                const Icon = config.icon;
                return (
                  <DropdownMenuItem
                    key={stage}
                    onClick={() => handleStageChange(stage)}
                  >
                    <Icon className={cn("h-4 w-4 mr-2", config.color)} />
                    <span>{config.label}</span>
                  </DropdownMenuItem>
                );
              })}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Button variant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={size}>
          <CurrentIcon className={cn("h-4 w-4 mr-2", currentConfig.color)} />
          Move to Stage
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Select Stage</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {stageOrder.map((stage) => {
          const config = stageConfig[stage];
          const Icon = config.icon;
          const isCurrent = stage === currentStage;
          return (
            <DropdownMenuItem
              key={stage}
              onClick={() => handleStageChange(stage)}
              disabled={isCurrent}
              className={isCurrent ? "opacity-100" : ""}
            >
              <Icon className={cn("h-4 w-4 mr-2", config.color)} />
              <span>{config.label}</span>
              {isCurrent && (
                <Badge variant="outline" className="ml-auto">Current</Badge>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

