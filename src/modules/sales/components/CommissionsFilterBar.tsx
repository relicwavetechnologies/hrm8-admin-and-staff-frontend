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
import { CommissionStatus } from "@/shared/types/salesCommission";

interface CommissionsFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: CommissionStatus | 'all';
  onStatusFilterChange: (value: CommissionStatus | 'all') => void;
  agentFilter: string;
  onAgentFilterChange: (value: string) => void;
  onClearFilters: () => void;
}

export function CommissionsFilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  agentFilter,
  onAgentFilterChange,
  onClearFilters,
}: CommissionsFilterBarProps) {
  const hasActiveFilters = search || statusFilter !== 'all' || agentFilter !== 'all';

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by agent or deal name..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={statusFilter} onValueChange={(value) => onStatusFilterChange(value as CommissionStatus | 'all')}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="paid">Paid</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
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
