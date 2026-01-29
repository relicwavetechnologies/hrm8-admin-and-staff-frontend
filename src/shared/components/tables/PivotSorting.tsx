import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { ArrowUpDown, X } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";

export interface SortConfig {
  field: string;
  direction: "asc" | "desc";
  valueField?: string; // For sorting by value columns
}

interface PivotSortingProps {
  sortConfig: SortConfig[];
  onSortChange: (config: SortConfig[]) => void;
  availableFields: { key: string; label: string; type?: "number" | "string" | "date" }[];
  valueFields: { field: string; aggregation: string; label?: string }[];
}

export function PivotSorting({
  sortConfig,
  onSortChange,
  availableFields,
  valueFields,
}: PivotSortingProps) {
  const addSort = (field: string) => {
    if (!sortConfig.find((s) => s.field === field)) {
      onSortChange([...sortConfig, { field, direction: "asc" }]);
    }
  };

  const removeSort = (field: string) => {
    onSortChange(sortConfig.filter((s) => s.field !== field));
  };

  const toggleDirection = (field: string) => {
    onSortChange(
      sortConfig.map((s) =>
        s.field === field
          ? { ...s, direction: s.direction === "asc" ? "desc" : "asc" }
          : s
      )
    );
  };

  const allFields = [
    ...availableFields,
    ...valueFields.map((v) => ({
      key: `${v.field}_${v.aggregation}`,
      label: v.label || `${v.aggregation}(${v.field})`,
      type: "number" as const,
    })),
  ];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Sort By</label>
      <Select onValueChange={addSort}>
        <SelectTrigger>
          <SelectValue placeholder="Add sort field..." />
        </SelectTrigger>
        <SelectContent>
          {allFields
            .filter((f) => !sortConfig.find((s) => s.field === f.key))
            .map((field) => (
              <SelectItem key={field.key} value={field.key}>
                {field.label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
      <div className="flex flex-wrap gap-2">
        {sortConfig.map((sort) => {
          const field = allFields.find((f) => f.key === sort.field);
          return (
            <Badge key={sort.field} variant="secondary" className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => toggleDirection(sort.field)}
              >
                <ArrowUpDown className="h-3 w-3" />
              </Button>
              <span className="text-xs">
                {field?.label} ({sort.direction})
              </span>
              <button
                onClick={() => removeSort(sort.field)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
