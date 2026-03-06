import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import { Label } from "@/shared/components/ui/label";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface ComparisonConfig {
  enabled: boolean;
  mode: "period" | "segment";
  compareField?: string;
  baseValue?: string;
  compareValue?: string;
  showDifference?: boolean;
  showPercentage?: boolean;
}

interface PivotComparisonProps {
  config: ComparisonConfig;
  onConfigChange: (config: ComparisonConfig) => void;
  availableFields: { key: string; label: string; type?: "number" | "string" | "date" }[];
}

export function PivotComparison({
  config,
  onConfigChange,
  availableFields,
}: PivotComparisonProps) {
  const updateConfig = (updates: Partial<ComparisonConfig>) => {
    onConfigChange({ ...config, ...updates });
  };


  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="comparison-enabled" className="text-sm font-semibold">
          Enable Comparison
        </Label>
        <Switch
          id="comparison-enabled"
          checked={config.enabled}
          onCheckedChange={(checked) => updateConfig({ enabled: checked })}
        />
      </div>

      {config.enabled && (
        <>
          <div>
            <label className="text-sm font-medium mb-2 block">Comparison Mode</label>
            <Select
              value={config.mode}
              onValueChange={(value) =>
                updateConfig({ mode: value as ComparisonConfig["mode"] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="period">Time Period Comparison</SelectItem>
                <SelectItem value="segment">Segment Comparison</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              {config.mode === "period" ? "Date Field" : "Comparison Field"}
            </label>
            <Select
              value={config.compareField}
              onValueChange={(value) => updateConfig({ compareField: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select field..." />
              </SelectTrigger>
              <SelectContent>
                {availableFields
                  .filter((f) =>
                    config.mode === "period"
                      ? f.type === "date"
                      : f.type === "string" || f.type === "number"
                  )
                  .map((field) => (
                    <SelectItem key={field.key} value={field.key}>
                      {field.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {config.compareField && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Base Value</label>
                  <Select
                    value={config.baseValue}
                    onValueChange={(value) => updateConfig({ baseValue: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="Q4">Q4</SelectItem>
                      <SelectItem value="Q3">Q3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Compare Value</label>
                  <Select
                    value={config.compareValue}
                    onValueChange={(value) => updateConfig({ compareValue: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="Q4">Q4</SelectItem>
                      <SelectItem value="Q3">Q3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-difference" className="text-sm">
                    Show Difference
                  </Label>
                  <Switch
                    id="show-difference"
                    checked={config.showDifference}
                    onCheckedChange={(checked) =>
                      updateConfig({ showDifference: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-percentage" className="text-sm">
                    Show Percentage Change
                  </Label>
                  <Switch
                    id="show-percentage"
                    checked={config.showPercentage}
                    onCheckedChange={(checked) =>
                      updateConfig({ showPercentage: checked })
                    }
                  />
                </div>
              </div>
            </>
          )}
        </>
      )}
    </Card>
  );
}

export function renderComparisonCell(
  baseValue: number,
  compareValue: number,
  config: ComparisonConfig
): React.JSX.Element {
  const difference = compareValue - baseValue;
  const percentageChange = baseValue !== 0 ? ((difference / baseValue) * 100).toFixed(1) : "N/A";

  const isPositive = difference > 0;
  const isNegative = difference < 0;

  return (
    <div className="flex items-center gap-2">
      <span>{compareValue.toFixed(2)}</span>
      {config.showDifference && (
        <Badge
          variant={isPositive ? "default" : isNegative ? "destructive" : "secondary"}
          className="text-xs"
        >
          {isPositive && <TrendingUp className="h-3 w-3 mr-1" />}
          {isNegative && <TrendingDown className="h-3 w-3 mr-1" />}
          {!isPositive && !isNegative && <Minus className="h-3 w-3 mr-1" />}
          {config.showPercentage ? `${percentageChange}%` : difference.toFixed(2)}
        </Badge>
      )}
    </div>
  );
}
