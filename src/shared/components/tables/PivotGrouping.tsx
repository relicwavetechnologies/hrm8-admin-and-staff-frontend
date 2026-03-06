import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Layers, Trash2 } from "lucide-react";
import { toast } from "@/shared/hooks/use-toast";

export interface GroupingConfig {
  field: string;
  type: "numeric" | "date";
  ranges?: { min: number; max: number; label: string }[];
  dateInterval?: "day" | "week" | "month" | "quarter" | "year";
  customBuckets?: number[];
}

interface PivotGroupingProps {
  groupings: GroupingConfig[];
  onGroupingsChange: (groupings: GroupingConfig[]) => void;
  availableFields: { key: string; label: string; type?: "number" | "string" | "date" }[];
}

export function PivotGrouping({
  groupings,
  onGroupingsChange,
  availableFields,
}: PivotGroupingProps) {
  const addGrouping = (field: string) => {
    const fieldInfo = availableFields.find((f) => f.key === field);
    if (!fieldInfo) return;

    const newGrouping: GroupingConfig = {
      field,
      type: fieldInfo.type === "date" ? "date" : "numeric",
      ...(fieldInfo.type === "date"
        ? { dateInterval: "month" as const }
        : { ranges: [] }),
    };

    onGroupingsChange([...groupings, newGrouping]);
    toast({
      title: "Grouping Added",
      description: `Grouping for "${fieldInfo.label}" has been created`,
    });
  };

  const removeGrouping = (field: string) => {
    onGroupingsChange(groupings.filter((g) => g.field !== field));
  };

  const updateGrouping = (field: string, updates: Partial<GroupingConfig>) => {
    onGroupingsChange(
      groupings.map((g) => (g.field === field ? { ...g, ...updates } : g))
    );
  };

  const addNumericRange = (field: string) => {
    const grouping = groupings.find((g) => g.field === field);
    if (!grouping || grouping.type !== "numeric") return;

    const newRange = {
      min: 0,
      max: 100,
      label: "Range " + ((grouping.ranges?.length || 0) + 1),
    };

    updateGrouping(field, {
      ranges: [...(grouping.ranges || []), newRange],
    });
  };

  const updateRange = (
    field: string,
    index: number,
    updates: Partial<{ min: number; max: number; label: string }>
  ) => {
    const grouping = groupings.find((g) => g.field === field);
    if (!grouping || !grouping.ranges) return;

    const newRanges = [...grouping.ranges];
    newRanges[index] = { ...newRanges[index], ...updates };
    updateGrouping(field, { ranges: newRanges });
  };

  const removeRange = (field: string, index: number) => {
    const grouping = groupings.find((g) => g.field === field);
    if (!grouping || !grouping.ranges) return;

    updateGrouping(field, {
      ranges: grouping.ranges.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Add Grouping</label>
        <Select onValueChange={addGrouping}>
          <SelectTrigger>
            <SelectValue placeholder="Select field to group..." />
          </SelectTrigger>
          <SelectContent>
            {availableFields
              .filter(
                (f) =>
                  (f.type === "number" || f.type === "date") &&
                  !groupings.find((g) => g.field === f.key)
              )
              .map((field) => (
                <SelectItem key={field.key} value={field.key}>
                  {field.label} ({field.type})
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {groupings.map((grouping) => {
        const field = availableFields.find((f) => f.key === grouping.field);
        if (!field) return null;

        return (
          <Card key={grouping.field} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                <Badge variant="secondary">{field.label}</Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeGrouping(grouping.field)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {grouping.type === "date" && (
              <div>
                <label className="text-sm font-medium mb-2 block">Date Interval</label>
                <Select
                  value={grouping.dateInterval}
                  onValueChange={(value) =>
                    updateGrouping(grouping.field, {
                      dateInterval: value as GroupingConfig["dateInterval"],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="quarter">Quarter</SelectItem>
                    <SelectItem value="year">Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {grouping.type === "numeric" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Numeric Ranges</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addNumericRange(grouping.field)}
                  >
                    Add Range
                  </Button>
                </div>
                {grouping.ranges?.map((range, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      type="text"
                      placeholder="Label"
                      value={range.label}
                      onChange={(e) =>
                        updateRange(grouping.field, index, { label: e.target.value })
                      }
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Min"
                      value={range.min}
                      onChange={(e) =>
                        updateRange(grouping.field, index, {
                          min: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-20"
                    />
                    <span className="text-sm">to</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={range.max}
                      onChange={(e) =>
                        updateRange(grouping.field, index, {
                          max: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-20"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRange(grouping.field, index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

export function applyGrouping<T>(
  data: T[],
  groupings: GroupingConfig[]
): T[] {
  return data.map((row) => {
    const groupedRow = { ...row };
    
    groupings.forEach((grouping) => {
      const value = (row as any)[grouping.field];
      
      if (grouping.type === "numeric" && typeof value === "number") {
        const range = grouping.ranges?.find(
          (r) => value >= r.min && value <= r.max
        );
        if (range) {
          (groupedRow as any)[grouping.field] = range.label;
        }
      } else if (grouping.type === "date" && value) {
        const date = new Date(value);
        switch (grouping.dateInterval) {
          case "day":
            (groupedRow as any)[grouping.field] = date.toLocaleDateString();
            break;
          case "week":
            const week = Math.ceil(date.getDate() / 7);
            (groupedRow as any)[grouping.field] = `Week ${week} ${date.toLocaleDateString('default', { month: 'short', year: 'numeric' })}`;
            break;
          case "month":
            (groupedRow as any)[grouping.field] = date.toLocaleDateString('default', { month: 'short', year: 'numeric' });
            break;
          case "quarter":
            const quarter = Math.floor(date.getMonth() / 3) + 1;
            (groupedRow as any)[grouping.field] = `Q${quarter} ${date.getFullYear()}`;
            break;
          case "year":
            (groupedRow as any)[grouping.field] = date.getFullYear().toString();
            break;
        }
      }
    });
    
    return groupedRow;
  }) as T[];
}
