import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { PivotConfig } from "./PivotTable";
import { BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";

export interface PivotTemplate {
  id: string;
  name: string;
  description: string;
  icon: any;
  config: Partial<PivotConfig>;
}

interface PivotTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (config: Partial<PivotConfig>) => void;
  availableFields: { key: string; label: string; type?: "number" | "string" | "date" }[];
}

export function PivotTemplates({
  isOpen,
  onClose,
  onApplyTemplate,
  availableFields,
}: PivotTemplatesProps) {
  const templates: PivotTemplate[] = [
    {
      id: "status-summary",
      name: "Status Summary",
      description: "Group by status with count aggregation",
      icon: BarChart3,
      config: {
        rows: availableFields.find((f) => f.key === "status")
          ? ["status"]
          : [availableFields[0]?.key],
        columns: [],
        values: [
          {
            field: availableFields.find((f) => f.type === "number")?.key || availableFields[0]?.key,
            aggregation: "count",
            label: "Count",
          },
        ],
        conditionalFormatting: {
          enabled: true,
          colorScale: "blue-red",
          thresholds: { low: 0, high: 100 },
          autoThresholds: true,
        },
      },
    },
    {
      id: "category-breakdown",
      name: "Category Breakdown",
      description: "Analyze by category and priority with sum",
      icon: TrendingUp,
      config: {
        rows: [
          availableFields.find((f) => f.key === "category")?.key || availableFields[0]?.key,
        ],
        columns: [
          availableFields.find((f) => f.key === "priority")?.key || availableFields[1]?.key,
        ],
        values: [
          {
            field: availableFields.find((f) => f.type === "number")?.key || availableFields[0]?.key,
            aggregation: "count",
            label: "Count",
          },
        ],
        conditionalFormatting: {
          enabled: true,
          colorScale: "red-green",
          thresholds: { low: 0, high: 100 },
          autoThresholds: true,
        },
      },
    },
    {
      id: "time-analysis",
      name: "Time Analysis",
      description: "Group by date fields with averages",
      icon: Users,
      config: {
        rows: [
          availableFields.find((f) => f.type === "date")?.key || availableFields[0]?.key,
        ],
        columns: [],
        values: [
          {
            field: availableFields.find((f) => f.type === "number")?.key || availableFields[0]?.key,
            aggregation: "avg",
            label: "Average",
          },
          {
            field: availableFields.find((f) => f.type === "number")?.key || availableFields[0]?.key,
            aggregation: "count",
            label: "Count",
          },
        ],
        conditionalFormatting: {
          enabled: true,
          colorScale: "yellow-green",
          thresholds: { low: 0, high: 100 },
          autoThresholds: true,
        },
      },
    },
    {
      id: "comprehensive",
      name: "Comprehensive View",
      description: "Multi-dimensional analysis with multiple aggregations",
      icon: DollarSign,
      config: {
        rows: [availableFields[0]?.key, availableFields[1]?.key].filter(Boolean),
        columns: [availableFields[2]?.key].filter(Boolean),
        values: [
          {
            field: availableFields.find((f) => f.type === "number")?.key || availableFields[0]?.key,
            aggregation: "sum",
            label: "Sum",
          },
          {
            field: availableFields.find((f) => f.type === "number")?.key || availableFields[0]?.key,
            aggregation: "avg",
            label: "Average",
          },
          {
            field: availableFields.find((f) => f.type === "number")?.key || availableFields[0]?.key,
            aggregation: "count",
            label: "Count",
          },
        ],
        conditionalFormatting: {
          enabled: true,
          colorScale: "red-green",
          thresholds: { low: 0, high: 100 },
          autoThresholds: true,
        },
      },
    },
  ];

  const handleApply = (template: PivotTemplate) => {
    onApplyTemplate(template.config);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Pivot Table Templates</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {templates.map((template) => {
            const Icon = template.icon;
            return (
              <Card key={template.id} className="cursor-pointer hover:border-primary transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        {template.name}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {template.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleApply(template)}
                    className="w-full"
                    variant="outline"
                  >
                    Apply Template
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
