import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

interface ActivitiesFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  outcomeFilter: string;
  onOutcomeFilterChange: (value: string) => void;
  onClearFilters: () => void;
}

export function ActivitiesFilterBar({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  outcomeFilter,
  onOutcomeFilterChange,
  onClearFilters,
}: ActivitiesFilterBarProps) {
  const hasFilters = search || typeFilter !== 'all' || outcomeFilter !== 'all';

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search activities..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={typeFilter} onValueChange={onTypeFilterChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="call">Call</SelectItem>
          <SelectItem value="email">Email</SelectItem>
          <SelectItem value="meeting">Meeting</SelectItem>
          <SelectItem value="demo">Demo</SelectItem>
          <SelectItem value="follow-up">Follow-up</SelectItem>
        </SelectContent>
      </Select>

      <Select value={outcomeFilter} onValueChange={onOutcomeFilterChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Outcome" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Outcomes</SelectItem>
          <SelectItem value="successful">Successful</SelectItem>
          <SelectItem value="unsuccessful">Unsuccessful</SelectItem>
          <SelectItem value="follow-up-needed">Follow-up Needed</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          <X className="h-4 w-4 mr-2" />
          Clear
        </Button>
      )}
    </div>
  );
}
