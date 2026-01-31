import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Search, Filter, X, Tags } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { ApplicationStage, ApplicationStatus } from "@/shared/types/application";
import { getAllTags } from "@/shared/lib/applicationTags";

interface ApplicationFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedStages: ApplicationStage[];
  onStagesChange: (stages: ApplicationStage[]) => void;
  selectedStatuses: ApplicationStatus[];
  onStatusesChange: (statuses: ApplicationStatus[]) => void;
  selectedTags?: string[];
  onTagsChange?: (tags: string[]) => void;
  onClearFilters: () => void;
}

const allStages: ApplicationStage[] = [
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

const allStatuses: ApplicationStatus[] = [
  "applied",
  "screening",
  "interview",
  "offer",
  "hired",
  "rejected",
  "withdrawn",
];

export function ApplicationFilters({
  searchQuery,
  onSearchChange,
  selectedStages,
  onStagesChange,
  selectedStatuses,
  onStatusesChange,
  selectedTags = [],
  onTagsChange,
  onClearFilters,
}: ApplicationFiltersProps) {
  const activeFiltersCount = selectedStages.length + selectedStatuses.length + selectedTags.length;
  const allTags = getAllTags();

  const toggleStage = (stage: ApplicationStage) => {
    if (selectedStages.includes(stage)) {
      onStagesChange(selectedStages.filter((s) => s !== stage));
    } else {
      onStagesChange([...selectedStages, stage]);
    }
  };

  const toggleStatus = (status: ApplicationStatus) => {
    if (selectedStatuses.includes(status)) {
      onStatusesChange(selectedStatuses.filter((s) => s !== status));
    } else {
      onStatusesChange([...selectedStatuses, status]);
    }
  };

  const toggleTag = (tag: string) => {
    if (!onTagsChange) return;
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search candidates, jobs..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Stage</DropdownMenuLabel>
          {allStages.slice(0, 9).map((stage) => (
            <DropdownMenuCheckboxItem
              key={stage}
              checked={selectedStages.includes(stage)}
              onCheckedChange={() => toggleStage(stage)}
            >
              {stage}
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Status</DropdownMenuLabel>
          {allStatuses.map((status) => (
            <DropdownMenuCheckboxItem
              key={status}
              checked={selectedStatuses.includes(status)}
              onCheckedChange={() => toggleStatus(status)}
              className="capitalize"
            >
              {status}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {onTagsChange && allTags.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Tags className="h-4 w-4 mr-2" />
              Tags
              {selectedTags.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedTags.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filter by Tags</DropdownMenuLabel>
            {allTags.map((tag) => (
              <DropdownMenuCheckboxItem
                key={tag}
                checked={selectedTags.includes(tag)}
                onCheckedChange={() => toggleTag(tag)}
              >
                {tag}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {activeFiltersCount > 0 && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          <X className="h-4 w-4 mr-2" />
          Clear
        </Button>
      )}
    </div>
  );
}
