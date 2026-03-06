import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/shared/components/ui/dropdown-menu";
import { Filter, X } from "lucide-react";

export interface JobFiltersState {
  status: string[];
  employmentType: string[];
  serviceType: string[];
}

interface JobFiltersProps {
  filters: JobFiltersState;
  onFiltersChange: (filters: JobFiltersState) => void;
}

export function JobFilters({ filters, onFiltersChange }: JobFiltersProps) {
  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'open', label: 'Open' },
    { value: 'closed', label: 'Closed' },
    { value: 'on-hold', label: 'On Hold' },
    { value: 'filled', label: 'Filled' },
  ];

  const employmentTypeOptions = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'casual', label: 'Casual' },
  ];

  const serviceTypeOptions = [
    { value: 'self-managed', label: 'Self-Managed' },
    { value: 'shortlisting', label: 'Shortlisting' },
    { value: 'full-service', label: 'Full-Service' },
    { value: 'executive-search', label: 'Executive Search' },
  ];

  const toggleFilter = (category: keyof JobFiltersState, value: string) => {
    const current = filters[category];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];

    onFiltersChange({ ...filters, [category]: updated });
  };

  const clearFilters = () => {
    onFiltersChange({ status: [], employmentType: [], serviceType: [] });
  };

  const activeFilterCount = filters.status.length + filters.employmentType.length + filters.serviceType.length;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Status</DropdownMenuLabel>
          {statusOptions.map(option => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={filters.status.includes(option.value)}
              onCheckedChange={() => toggleFilter('status', option.value)}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Employment Type</DropdownMenuLabel>
          {employmentTypeOptions.map(option => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={filters.employmentType.includes(option.value)}
              onCheckedChange={() => toggleFilter('employmentType', option.value)}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Service Type</DropdownMenuLabel>
          {serviceTypeOptions.map(option => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={filters.serviceType.includes(option.value)}
              onCheckedChange={() => toggleFilter('serviceType', option.value)}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-2" />
          Clear filters
        </Button>
      )}
    </div>
  );
}
