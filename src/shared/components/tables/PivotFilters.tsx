import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { X } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";

export interface FilterConfig {
  field: string;
  operator: "equals" | "contains" | "gt" | "lt" | "gte" | "lte" | "between";
  value: string | number;
  value2?: string | number; // For 'between' operator
}

interface PivotFiltersProps {
  filters: FilterConfig[];
  onFiltersChange: (filters: FilterConfig[]) => void;
  availableFields: { key: string; label: string; type?: "number" | "string" | "date" }[];
}

export function PivotFilters({
  filters,
  onFiltersChange,
  availableFields,
}: PivotFiltersProps) {
  const addFilter = (field: string) => {
    const fieldInfo = availableFields.find((f) => f.key === field);
    const operator = fieldInfo?.type === "number" ? "gte" : "contains";
    onFiltersChange([...filters, { field, operator, value: "" }]);
  };

  const removeFilter = (index: number) => {
    onFiltersChange(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, updates: Partial<FilterConfig>) => {
    onFiltersChange(
      filters.map((f, i) => (i === index ? { ...f, ...updates } : f))
    );
  };

  const getOperatorOptions = (type?: "number" | "string" | "date") => {
    if (type === "number") {
      return [
        { value: "equals", label: "Equals" },
        { value: "gt", label: "Greater than" },
        { value: "lt", label: "Less than" },
        { value: "gte", label: "Greater or equal" },
        { value: "lte", label: "Less or equal" },
        { value: "between", label: "Between" },
      ];
    }
    return [
      { value: "equals", label: "Equals" },
      { value: "contains", label: "Contains" },
    ];
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Filters</label>
      <Select onValueChange={addFilter}>
        <SelectTrigger>
          <SelectValue placeholder="Add filter..." />
        </SelectTrigger>
        <SelectContent>
          {availableFields.map((field) => (
            <SelectItem key={field.key} value={field.key}>
              {field.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="space-y-2">
        {filters.map((filter, index) => {
          const field = availableFields.find((f) => f.key === filter.field);
          return (
            <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
              <Badge variant="outline">{field?.label}</Badge>
              <Select
                value={filter.operator}
                onValueChange={(value) =>
                  updateFilter(index, { operator: value as FilterConfig["operator"] })
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getOperatorOptions(field?.type).map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type={field?.type === "number" ? "number" : "text"}
                value={filter.value}
                onChange={(e) =>
                  updateFilter(index, { value: e.target.value })
                }
                className="flex-1"
                placeholder="Value"
              />
              {filter.operator === "between" && (
                <Input
                  type={field?.type === "number" ? "number" : "text"}
                  value={filter.value2 || ""}
                  onChange={(e) =>
                    updateFilter(index, { value2: e.target.value })
                  }
                  className="flex-1"
                  placeholder="Value 2"
                />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFilter(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
