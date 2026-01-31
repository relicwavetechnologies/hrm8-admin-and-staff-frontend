import { useState, useEffect } from "react";
import { Search, X, RefreshCw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";

interface LocationOption {
  region: string;
  countries: string[];
}

interface JobsFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedConsultants: string[];
  onConsultantsChange: (consultants: string[]) => void;
  selectedLocations: string[];
  onLocationsChange: (locations: string[]) => void;
  selectedService: string;
  onServiceChange: (service: string) => void;
  selectedStatus?: string;
  onStatusChange?: (status: string) => void;
  consultantOptions: string[];
  locationOptions: LocationOption[];
  currentUserId?: string;
}

const serviceTypeLabels: Record<string, string> = {
  'all': 'All Services',
  'self-managed': 'Self-Managed',
  'shortlisting': 'Shortlisting',
  'full-service': 'Full-Service',
  'executive-search': 'Executive Search',
  'rpo': 'RPO',
};

export function JobsFilterBar({
  searchValue,
  onSearchChange,
  selectedConsultants,
  onConsultantsChange,
  selectedLocations,
  onLocationsChange,
  selectedService,
  onServiceChange,
  selectedStatus = "all",
  onStatusChange,
  consultantOptions,
  locationOptions,
}: JobsFilterBarProps) {
  const [isSearchExpanded, setIsSearchExpanded] = useState(!!searchValue);

  // Keep search expanded if there's a value
  useEffect(() => {
    if (searchValue) {
      setIsSearchExpanded(true);
    }
  }, [searchValue]);

  const activeFilterCount =
    (searchValue ? 1 : 0) +
    (selectedConsultants.length > 0 ? 1 : 0) +
    (selectedLocations.length > 0 ? 1 : 0) +
    (selectedService !== "all" ? 1 : 0) +
    (selectedStatus !== "all" ? 1 : 0);

  const hasActiveFilters = activeFilterCount > 0;

  const clearAllFilters = () => {
    onSearchChange("");
    onConsultantsChange([]);
    onLocationsChange([]);
    onServiceChange("all");
    if (onStatusChange) {
      onStatusChange("all");
    }
    setIsSearchExpanded(false);
  };

  const handleSearchFocus = () => {
    setIsSearchExpanded(true);
  };

  const handleSearchBlur = () => {
    // Only collapse if search is empty
    if (!searchValue) {
      setIsSearchExpanded(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="flex items-center gap-2 min-w-max">
          {/* Collapsible Search */}
          {isSearchExpanded ? (
            <div className="relative" style={{ minWidth: '200px', width: '280px' }}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input
                placeholder="Search jobs..."
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                onBlur={handleSearchBlur}
                onFocus={handleSearchFocus}
                autoFocus
                className="pl-10 pr-8 h-9"
              />
              {searchValue && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => {
                    onSearchChange("");
                    setIsSearchExpanded(false);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSearchExpanded(true)}
              className="shrink-0 h-9 w-9 p-0"
              title="Search"
            >
              <Search className="h-4 w-4" />
            </Button>
          )}

          {/* Filter Dropdowns */}
          <Select
            value={selectedConsultants.length === 0 ? 'all' : selectedConsultants[0] || 'all'}
            onValueChange={(value) => {
              if (value === 'all') {
                onConsultantsChange([]);
              } else if (value === 'my-jobs') {
                onConsultantsChange(['my-jobs']);
              } else {
                onConsultantsChange([value]);
              }
            }}
          >
            <SelectTrigger className="w-[160px] h-9 shrink-0">
              <SelectValue placeholder="Consultant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Consultants</SelectItem>
              <SelectItem value="my-jobs">My Jobs Only</SelectItem>
              {consultantOptions.map((consultant) => (
                <SelectItem key={consultant} value={consultant}>
                  {consultant}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedLocations.length === 0 ? 'all' : selectedLocations[0] || 'all'}
            onValueChange={(value) => {
              if (value === 'all') {
                onLocationsChange([]);
              } else {
                onLocationsChange([value]);
              }
            }}
          >
            <SelectTrigger className="w-[160px] h-9 shrink-0">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locationOptions.map(({ region: _region, countries }) => (
                countries.map(country => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedService} onValueChange={onServiceChange}>
            <SelectTrigger className="w-[160px] h-9 shrink-0">
              <SelectValue placeholder="Service Type" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(serviceTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {onStatusChange && (
            <Select value={selectedStatus} onValueChange={onStatusChange}>
              <SelectTrigger className="w-[160px] h-9 shrink-0">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
                <SelectItem value="filled">Filled</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="template">Template</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            title="Reset all filters"
            className="shrink-0 h-9 w-9 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-7 px-2 text-xs"
          >
            <X className="mr-1 h-3 w-3" />
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
