import { Button } from "@/shared/components/ui/button";
import { SearchInput } from "@/shared/components/common/SearchInput";
import { FilterDropdown } from "@/shared/components/common/FilterDropdown";
import { X } from "lucide-react";

interface BackgroundChecksFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  checkTypeFilter: string;
  onCheckTypeChange: (value: string) => void;
  resultFilter?: string;
  onResultChange?: (value: string) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

export function BackgroundChecksFilterBar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  checkTypeFilter,
  onCheckTypeChange,
  resultFilter = 'all',
  onResultChange,
  onClearFilters,
  activeFilterCount,
}: BackgroundChecksFilterBarProps) {
  const statusOptions = [
    { label: "All Statuses", value: "all" },
    { label: "Not Started", value: "not-started" },
    { label: "Pending Consent", value: "pending-consent" },
    { label: "In Progress", value: "in-progress" },
    { label: "Completed", value: "completed" },
    { label: "Issues Found", value: "issues-found" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const checkTypeOptions = [
    { label: "All Types", value: "all" },
    { label: "Reference Check", value: "reference" },
    { label: "Criminal Record Check", value: "criminal" },
    { label: "Identity Verification", value: "identity" },
    { label: "Qualification Verification", value: "education" },
  ];

  const resultOptions = [
    { label: "All Results", value: "all" },
    { label: "Clear", value: "clear" },
    { label: "Conditional", value: "conditional" },
    { label: "Not Clear", value: "not-clear" },
    { label: "Pending Review", value: "pending" },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <SearchInput
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="Search background checks..."
        className="flex-1"
      />
      
      <div className="flex gap-2 flex-wrap">
        <FilterDropdown
          label="Status"
          value={statusFilter}
          onChange={onStatusChange}
          options={statusOptions}
        />
        
        <FilterDropdown
          label="Check Type"
          value={checkTypeFilter}
          onChange={onCheckTypeChange}
          options={checkTypeOptions}
        />

        {onResultChange && (
          <FilterDropdown
            label="Overall Result"
            value={resultFilter}
            onChange={onResultChange}
            options={resultOptions}
          />
        )}
        
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="gap-1"
          >
            <X className="h-4 w-4" />
            Clear ({activeFilterCount})
          </Button>
        )}
      </div>
    </div>
  );
}
