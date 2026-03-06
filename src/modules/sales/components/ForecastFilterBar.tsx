import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { ConfidenceLevel } from "@/shared/lib/salesForecastUtils";

interface ForecastFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  quarterFilter: string;
  onQuarterFilterChange: (value: string) => void;
  confidenceFilter: ConfidenceLevel | 'all';
  onConfidenceFilterChange: (value: ConfidenceLevel | 'all') => void;
  agentFilter: string;
  onAgentFilterChange: (value: string) => void;
  onClearFilters: () => void;
}

export function ForecastFilterBar({
  search,
  onSearchChange,
  quarterFilter,
  onQuarterFilterChange,
  confidenceFilter,
  onConfidenceFilterChange,
  agentFilter,
  onAgentFilterChange,
  onClearFilters,
}: ForecastFilterBarProps) {
  const hasActiveFilters = search || quarterFilter !== 'all' || confidenceFilter !== 'all' || agentFilter !== 'all';

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search opportunities..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={quarterFilter} onValueChange={onQuarterFilterChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Quarter" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Quarters</SelectItem>
          <SelectItem value="Q1 2024">Q1 2024</SelectItem>
          <SelectItem value="Q2 2024">Q2 2024</SelectItem>
          <SelectItem value="Q3 2024">Q3 2024</SelectItem>
          <SelectItem value="Q4 2024">Q4 2024</SelectItem>
          <SelectItem value="Q1 2025">Q1 2025</SelectItem>
        </SelectContent>
      </Select>

      <Select value={confidenceFilter} onValueChange={(value) => onConfidenceFilterChange(value as ConfidenceLevel | 'all')}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Confidence" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Confidence</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>

      <Select value={agentFilter} onValueChange={onAgentFilterChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Agent" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Agents</SelectItem>
          <SelectItem value="agent-001">Sarah Johnson</SelectItem>
          <SelectItem value="agent-002">Michael Chen</SelectItem>
          <SelectItem value="agent-003">Emily Rodriguez</SelectItem>
          <SelectItem value="agent-004">David Park</SelectItem>
          <SelectItem value="agent-005">Jessica Martinez</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" onClick={onClearFilters} className="shrink-0">
          <X className="h-4 w-4 mr-2" />
          Clear
        </Button>
      )}
    </div>
  );
}
