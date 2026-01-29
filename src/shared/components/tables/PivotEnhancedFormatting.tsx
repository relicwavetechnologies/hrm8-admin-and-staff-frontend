import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Plus, Trash2, Palette } from "lucide-react";
import { Switch } from "@/shared/components/ui/switch";
import { Label } from "@/shared/components/ui/label";

export interface ConditionalFormattingRule {
  id: string;
  field: string;
  condition: "greater" | "less" | "equal" | "between" | "top" | "bottom";
  value?: number;
  value2?: number; // For 'between'
  topBottomN?: number; // For 'top' or 'bottom' N
  backgroundColor?: string;
  textColor?: string;
  bold?: boolean;
  icon?: "arrow-up" | "arrow-down" | "check" | "x" | "alert";
}

interface PivotEnhancedFormattingProps {
  rules: ConditionalFormattingRule[];
  onRulesChange: (rules: ConditionalFormattingRule[]) => void;
  availableFields: { key: string; label: string; type?: "number" | "string" | "date" }[];
}

export function PivotEnhancedFormatting({
  rules,
  onRulesChange,
  availableFields,
}: PivotEnhancedFormattingProps) {
  const addRule = () => {
    const newRule: ConditionalFormattingRule = {
      id: `rule_${Date.now()}`,
      field: availableFields[0]?.key || "",
      condition: "greater",
      value: 0,
      backgroundColor: "#22c55e",
      textColor: "#ffffff",
      bold: false,
    };
    onRulesChange([...rules, newRule]);
  };

  const updateRule = (id: string, updates: Partial<ConditionalFormattingRule>) => {
    onRulesChange(rules.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const removeRule = (id: string) => {
    onRulesChange(rules.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          <h3 className="text-sm font-semibold">Conditional Formatting Rules</h3>
        </div>
        <Button onClick={addRule} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </div>

      {rules.map((rule) => {
        const field = availableFields.find((f) => f.key === rule.field);
        
        return (
          <Card key={rule.id} className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <Badge variant="secondary">{field?.label || "Field"}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRule(rule.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block">Field</label>
                  <Select
                    value={rule.field}
                    onValueChange={(value) => updateRule(rule.id, { field: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFields
                        .filter((f) => f.type === "number")
                        .map((field) => (
                          <SelectItem key={field.key} value={field.key}>
                            {field.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium mb-1 block">Condition</label>
                  <Select
                    value={rule.condition}
                    onValueChange={(value) =>
                      updateRule(rule.id, {
                        condition: value as ConditionalFormattingRule["condition"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="greater">Greater than</SelectItem>
                      <SelectItem value="less">Less than</SelectItem>
                      <SelectItem value="equal">Equal to</SelectItem>
                      <SelectItem value="between">Between</SelectItem>
                      <SelectItem value="top">Top N</SelectItem>
                      <SelectItem value="bottom">Bottom N</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(rule.condition === "greater" ||
                rule.condition === "less" ||
                rule.condition === "equal") && (
                <div>
                  <label className="text-xs font-medium mb-1 block">Value</label>
                  <Input
                    type="number"
                    value={rule.value || 0}
                    onChange={(e) =>
                      updateRule(rule.id, { value: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              )}

              {rule.condition === "between" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium mb-1 block">Min Value</label>
                    <Input
                      type="number"
                      value={rule.value || 0}
                      onChange={(e) =>
                        updateRule(rule.id, { value: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Max Value</label>
                    <Input
                      type="number"
                      value={rule.value2 || 0}
                      onChange={(e) =>
                        updateRule(rule.id, { value2: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>
              )}

              {(rule.condition === "top" || rule.condition === "bottom") && (
                <div>
                  <label className="text-xs font-medium mb-1 block">N (count)</label>
                  <Input
                    type="number"
                    value={rule.topBottomN || 10}
                    onChange={(e) =>
                      updateRule(rule.id, { topBottomN: parseInt(e.target.value) || 10 })
                    }
                  />
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block">Background</label>
                  <Input
                    type="color"
                    value={rule.backgroundColor || "#22c55e"}
                    onChange={(e) =>
                      updateRule(rule.id, { backgroundColor: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Text Color</label>
                  <Input
                    type="color"
                    value={rule.textColor || "#ffffff"}
                    onChange={(e) => updateRule(rule.id, { textColor: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Icon</label>
                  <Select
                    value={rule.icon || "none"}
                    onValueChange={(value) =>
                      updateRule(rule.id, {
                        icon: value === "none" ? undefined : (value as any),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="arrow-up">↑</SelectItem>
                      <SelectItem value="arrow-down">↓</SelectItem>
                      <SelectItem value="check">✓</SelectItem>
                      <SelectItem value="x">✗</SelectItem>
                      <SelectItem value="alert">⚠</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id={`bold-${rule.id}`}
                  checked={rule.bold}
                  onCheckedChange={(checked) => updateRule(rule.id, { bold: checked })}
                />
                <Label htmlFor={`bold-${rule.id}`} className="text-xs">
                  Bold text
                </Label>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export function evaluateFormattingRule(
  value: number,
  rule: ConditionalFormattingRule,
  allValues: number[]
): boolean {
  switch (rule.condition) {
    case "greater":
      return value > (rule.value || 0);
    case "less":
      return value < (rule.value || 0);
    case "equal":
      return value === (rule.value || 0);
    case "between":
      return value >= (rule.value || 0) && value <= (rule.value2 || 0);
    case "top": {
      const sorted = [...allValues].sort((a, b) => b - a);
      const topN = sorted.slice(0, rule.topBottomN || 10);
      return topN.includes(value);
    }
    case "bottom": {
      const sorted = [...allValues].sort((a, b) => a - b);
      const bottomN = sorted.slice(0, rule.topBottomN || 10);
      return bottomN.includes(value);
    }
    default:
      return false;
  }
}
