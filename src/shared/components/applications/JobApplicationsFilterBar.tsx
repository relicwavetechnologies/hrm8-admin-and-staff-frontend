import { useState, useEffect, useMemo } from "react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Search, Filter, X, Tags, Calendar, SlidersHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { ApplicationStage, ApplicationStatus } from "@/shared/types/application";
import { getAllTags } from "@/shared/lib/applicationTags";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Label } from "@/shared/components/ui/label";
import { Slider } from "@/shared/components/ui/slider";
import { Calendar as CalendarComponent } from "@/shared/components/ui/calendar";
import { format } from "date-fns";
import { StatusQuickFilters, quickFilters as _quickFilters } from "./StatusQuickFilters";

export interface JobApplicationsFilters {
  searchQuery: string;
  selectedStages: ApplicationStage[];
  selectedStatuses: ApplicationStatus[];
  selectedTags: string[];
  dateFrom?: Date;
  dateTo?: Date;
  minScore?: number;
  maxScore?: number;
  assignedTo?: string;
  quickFilter?: 'new' | 'interviewed' | 'shortlisted' | 'offered' | 'rejected' | 'needs-review' | null;
}

interface JobApplicationsFilterBarProps {
  filters: JobApplicationsFilters;
  onFiltersChange: (filters: JobApplicationsFilters) => void;
  totalCount: number;
  filteredCount: number;
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

// Note: quickFilterOptions is no longer used - StatusQuickFilters component handles this
// Keeping this for backwards compatibility but it's not referenced
const quickFilterOptions = [
  { id: 'new', label: 'New Applications' },
  { id: 'interviewed', label: 'In Interview' },
  { id: 'shortlisted', label: 'Shortlisted' },
  { id: 'offered', label: 'Offered' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'needs-review', label: 'Needs Review' },
] as const;

export function JobApplicationsFilterBar({
  filters,
  onFiltersChange,
  totalCount,
  filteredCount,
}: JobApplicationsFilterBarProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(filters.searchQuery);
  const debouncedSearch = useDebounce(localSearchQuery, 300);
  const allTags = getAllTags();

  // Update parent when debounced search changes
  useEffect(() => {
    onFiltersChange({ ...filters, searchQuery: debouncedSearch });
  }, [debouncedSearch]);

  // Sync local search with filters
  useEffect(() => {
    setLocalSearchQuery(filters.searchQuery);
  }, [filters.searchQuery]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.selectedStages.length > 0) count += filters.selectedStages.length;
    if (filters.selectedStatuses.length > 0) count += filters.selectedStatuses.length;
    if (filters.selectedTags.length > 0) count += filters.selectedTags.length;
    if (filters.dateFrom || filters.dateTo) count += 1;
    if (filters.minScore !== undefined || filters.maxScore !== undefined) count += 1;
    if (filters.assignedTo) count += 1;
    if (filters.quickFilter) count += 1;
    return count;
  }, [filters]);

  const handleQuickFilter = (filterId: typeof quickFilterOptions[number]['id'] | null) => {
    const newFilters: JobApplicationsFilters = {
      ...filters,
      quickFilter: filterId || undefined,
    };

    // Apply quick filter logic
    if (filterId === 'new') {
      newFilters.selectedStatuses = ['applied'];
      newFilters.selectedStages = ['New Application'];
    } else if (filterId === 'interviewed') {
      newFilters.selectedStages = [
        'Phone Screen',
        'Technical Interview',
        'Manager Interview',
        'Final Round',
      ];
    } else if (filterId === 'shortlisted') {
      // Will be handled by filtering logic
    } else if (filterId === 'offered') {
      newFilters.selectedStatuses = ['offer'];
      newFilters.selectedStages = ['Offer Extended'];
    } else if (filterId === 'rejected') {
      newFilters.selectedStatuses = ['rejected'];
      newFilters.selectedStages = ['Rejected'];
    } else if (filterId === 'needs-review') {
      newFilters.minScore = undefined;
      newFilters.maxScore = undefined;
    }

    onFiltersChange(newFilters);
  };

  const toggleStage = (stage: ApplicationStage) => {
    const newStages = filters.selectedStages.includes(stage)
      ? filters.selectedStages.filter((s) => s !== stage)
      : [...filters.selectedStages, stage];
    onFiltersChange({ ...filters, selectedStages: newStages });
  };

  const toggleStatus = (status: ApplicationStatus) => {
    const newStatuses = filters.selectedStatuses.includes(status)
      ? filters.selectedStatuses.filter((s) => s !== status)
      : [...filters.selectedStatuses, status];
    onFiltersChange({ ...filters, selectedStatuses: newStatuses });
  };

  const toggleTag = (tag: string) => {
    const newTags = filters.selectedTags.includes(tag)
      ? filters.selectedTags.filter((t) => t !== tag)
      : [...filters.selectedTags, tag];
    onFiltersChange({ ...filters, selectedTags: newTags });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      searchQuery: '',
      selectedStages: [],
      selectedStatuses: [],
      selectedTags: [],
      dateFrom: undefined,
      dateTo: undefined,
      minScore: undefined,
      maxScore: undefined,
      assignedTo: undefined,
      quickFilter: null,
    });
    setLocalSearchQuery('');
  };

  return (
    <div className="space-y-4">
      {/* Quick Filter Chips */}
      <StatusQuickFilters
        activeFilterId={filters.quickFilter || undefined}
        onFilterChange={(filterId) => handleQuickFilter(filterId as any || null)}
      />

      {/* Main Filter Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates, email, job..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Stage Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Stage
              {filters.selectedStages.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filters.selectedStages.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 max-h-[300px] overflow-y-auto">
            <DropdownMenuLabel>Filter by Stage</DropdownMenuLabel>
            {allStages.map((stage) => (
              <DropdownMenuCheckboxItem
                key={stage}
                checked={filters.selectedStages.includes(stage)}
                onCheckedChange={() => toggleStage(stage)}
              >
                {stage}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Status
              {filters.selectedStatuses.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filters.selectedStatuses.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            {allStatuses.map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={filters.selectedStatuses.includes(status)}
                onCheckedChange={() => toggleStatus(status)}
                className="capitalize"
              >
                {status}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Tags Filter */}
        {allTags.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Tags className="h-4 w-4 mr-2" />
                Tags
                {filters.selectedTags.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {filters.selectedTags.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 max-h-[300px] overflow-y-auto">
              <DropdownMenuLabel>Filter by Tags</DropdownMenuLabel>
              {allTags.map((tag) => (
                <DropdownMenuCheckboxItem
                  key={tag}
                  checked={filters.selectedTags.includes(tag)}
                  onCheckedChange={() => toggleTag(tag)}
                >
                  {tag}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Advanced Filters */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Advanced
              {((filters.dateFrom || filters.dateTo) ||
                (filters.minScore !== undefined || filters.maxScore !== undefined) ||
                filters.assignedTo) && (
                  <Badge variant="secondary" className="ml-2">
                    1+
                  </Badge>
                )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80">
            <div className="space-y-4">
              {/* Date Range */}
              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1 justify-start">
                        <Calendar className="h-4 w-4 mr-2" />
                        {filters.dateFrom ? format(filters.dateFrom, "PPP") : "From"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={filters.dateFrom}
                        onSelect={(date) => onFiltersChange({ ...filters, dateFrom: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1 justify-start">
                        <Calendar className="h-4 w-4 mr-2" />
                        {filters.dateTo ? format(filters.dateTo, "PPP") : "To"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={filters.dateTo}
                        onSelect={(date) => onFiltersChange({ ...filters, dateTo: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Score Range */}
              <div className="space-y-2">
                <Label>Score Range: {filters.minScore ?? 0} - {filters.maxScore ?? 100}</Label>
                <Slider
                  value={[filters.minScore ?? 0, filters.maxScore ?? 100]}
                  onValueChange={([min, max]) =>
                    onFiltersChange({ ...filters, minScore: min, maxScore: max })
                  }
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFiltersChange({ ...filters, minScore: undefined, maxScore: undefined })}
                    className="h-6 px-2"
                  >
                    Clear
                  </Button>
                </div>
              </div>

              {/* Assigned To - Placeholder for now */}
              {/* <div className="space-y-2">
                <Label>Assigned To</Label>
                <Select
                  value={filters.assignedTo || "all"}
                  onValueChange={(value) => 
                    onFiltersChange({ ...filters, assignedTo: value === "all" ? undefined : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Recruiters</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear ({activeFiltersCount})
          </Button>
        )}

        {/* Results Count */}
        <div className="text-sm text-muted-foreground ml-auto">
          Showing <span className="font-medium text-foreground">{filteredCount}</span> of{" "}
          <span className="font-medium text-foreground">{totalCount}</span>
        </div>
      </div>
    </div>
  );
}

