import { ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

export type AggregateFunction = "sum" | "avg" | "count" | "min" | "max";

export interface GroupConfig {
  column: string;
  label?: string;
  aggregates?: {
    column: string;
    function: AggregateFunction;
    label: string;
    format?: (value: number) => string;
  }[];
  renderGroupHeader?: (groupValue: any, count: number, aggregates: Record<string, number>) => ReactNode;
}

export interface GroupedData<T> {
  groupValue: any;
  items: T[];
  aggregates: Record<string, number>;
}

export function calculateAggregates<T>(
  items: T[],
  aggregateConfigs: GroupConfig["aggregates"]
): Record<string, number> {
  if (!aggregateConfigs) return {};

  const results: Record<string, number> = {};

  aggregateConfigs.forEach((config) => {
    const values = items
      .map((item) => {
        const value = item[config.column as keyof T];
        return typeof value === "number" ? value : parseFloat(String(value || 0));
      })
      .filter((v) => !isNaN(v));

    switch (config.function) {
      case "sum":
        results[config.column] = values.reduce((acc, val) => acc + val, 0);
        break;
      case "avg":
        results[config.column] = values.length > 0
          ? values.reduce((acc, val) => acc + val, 0) / values.length
          : 0;
        break;
      case "count":
        results[config.column] = values.length;
        break;
      case "min":
        results[config.column] = values.length > 0 ? Math.min(...values) : 0;
        break;
      case "max":
        results[config.column] = values.length > 0 ? Math.max(...values) : 0;
        break;
    }
  });

  return results;
}

export function groupData<T>(
  data: T[],
  groupByColumn: string
): GroupedData<T>[] {
  const groups = new Map<any, T[]>();

  data.forEach((item) => {
    const groupValue = item[groupByColumn as keyof T];
    const existing = groups.get(groupValue) || [];
    groups.set(groupValue, [...existing, item]);
  });

  return Array.from(groups.entries()).map(([groupValue, items]) => ({
    groupValue,
    items,
    aggregates: {},
  }));
}

interface GroupHeaderProps {
  isExpanded: boolean;
  onToggle: () => void;
  groupValue: any;
  count: number;
  aggregates: Record<string, number>;
  groupConfig: GroupConfig;
  colSpan: number;
}

export function GroupHeader({
  isExpanded,
  onToggle,
  groupValue,
  count,
  aggregates,
  groupConfig,
  colSpan,
}: GroupHeaderProps) {
  const defaultHeader = () => (
    <div className="flex items-center gap-4">
      <span className="font-semibold">
        {groupConfig.label || "Group"}: {String(groupValue)}
      </span>
      <span className="text-sm text-muted-foreground">
        ({count} item{count !== 1 ? 's' : ''})
      </span>
      {groupConfig.aggregates && groupConfig.aggregates.length > 0 && (
        <div className="flex items-center gap-4 ml-4">
          {groupConfig.aggregates.map((agg) => {
            const value = aggregates[agg.column];
            const formatted = agg.format ? agg.format(value) : value.toFixed(2);
            return (
              <span key={agg.column} className="text-sm">
                <span className="text-muted-foreground">{agg.label}:</span>{" "}
                <span className="font-medium">{formatted}</span>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <tr className="bg-muted/50 hover:bg-muted/70 border-b-2">
      <td colSpan={colSpan} className="p-0">
        <Button
          variant="ghost"
          className="w-full justify-start h-12 px-4 rounded-none"
          onClick={onToggle}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 mr-2" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-2" />
          )}
          {groupConfig.renderGroupHeader
            ? groupConfig.renderGroupHeader(groupValue, count, aggregates)
            : defaultHeader()}
        </Button>
      </td>
    </tr>
  );
}
