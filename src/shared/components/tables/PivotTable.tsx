import { useMemo, useState, useEffect, useRef } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { X, Settings2, Download, FileSpreadsheet, FileText, Library, BarChart3, Copy, Save, Layers, Undo, Redo } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
// import { cn } from "@/shared/lib/utils";
import * as XLSX from "xlsx";
import { PivotDrillDown } from "./PivotDrillDown";
import { PivotTemplates } from "./PivotTemplates";
import { PivotChart } from "./PivotChart";
import { PivotSorting, SortConfig } from "./PivotSorting";
import { PivotFilters, FilterConfig } from "./PivotFilters";
import { PivotFormatting, NumberFormat, formatNumber } from "./PivotFormatting";
import { PivotConfigManager } from "./PivotConfigManager";
import { PivotFieldDragDrop } from "./PivotFieldDragDrop";
import { PivotCalculatedFields, CalculatedField } from "./PivotCalculatedFields";
import { PivotGrouping, GroupingConfig } from "./PivotGrouping";
import { PivotComparison, ComparisonConfig } from "./PivotComparison";
import { calculateAdvancedAggregate, AdvancedAggregateFunction, ADVANCED_AGGREGATION_OPTIONS } from "./PivotAdvancedAggregations";
import { PivotEnhancedFormatting, ConditionalFormattingRule } from "./PivotEnhancedFormatting";

export type PivotAggregateFunction = "sum" | "avg" | "count" | "min" | "max" | AdvancedAggregateFunction;

export interface ConditionalFormatting {
  enabled: boolean;
  colorScale: "red-green" | "blue-red" | "yellow-green" | "custom";
  customColors?: {
    low: string;
    mid: string;
    high: string;
  };
  thresholds: {
    low: number;
    high: number;
  };
  autoThresholds: boolean;
}

export interface PivotConfig {
  rows: string[];
  columns: string[];
  values: {
    field: string;
    aggregation: PivotAggregateFunction;
    label?: string;
  }[];
  conditionalFormatting?: ConditionalFormatting;
  showTotals?: boolean;
  showChart?: boolean;
  sortConfig?: SortConfig[];
  filters?: FilterConfig[];
  numberFormat?: NumberFormat;
  calculatedFields?: CalculatedField[];
  groupings?: GroupingConfig[];
  comparison?: ComparisonConfig;
  enhancedFormatting?: ConditionalFormattingRule[];
}

interface PivotTableProps<T> {
  data: T[];
  availableFields: { key: string; label: string; type?: "number" | "string" | "date" }[];
  initialConfig?: PivotConfig;
  onConfigChange?: (config: PivotConfig) => void;
}

interface PivotData {
  [rowKey: string]: {
    [colKey: string]: {
      [valueKey: string]: number | number[];
    };
  };
}

function calculateAggregate(
  values: number[],
  aggregation: PivotAggregateFunction
): number {
  if (values.length === 0) return 0;

  // Check if it's an advanced aggregation
  const advancedTypes: AdvancedAggregateFunction[] = ["median", "mode", "stddev", "variance", "percentile", "distinct", "first", "last"];
  if (advancedTypes.includes(aggregation as AdvancedAggregateFunction)) {
    return calculateAdvancedAggregate(values, aggregation as AdvancedAggregateFunction);
  }

  switch (aggregation) {
    case "sum":
      return values.reduce((acc, val) => acc + val, 0);
    case "avg":
      return values.reduce((acc, val) => acc + val, 0) / values.length;
    case "count":
      return values.length;
    case "min":
      return Math.min(...values);
    case "max":
      return Math.max(...values);
    default:
      return 0;
  }
}

function getColorScale(
  scale: ConditionalFormatting["colorScale"]
): { low: string; mid: string; high: string } {
  const scales = {
    "red-green": {
      low: "239 68 68", // red-500
      mid: "251 191 36", // amber-400
      high: "34 197 94", // green-500
    },
    "blue-red": {
      low: "59 130 246", // blue-500
      mid: "168 85 247", // purple-500
      high: "239 68 68", // red-500
    },
    "yellow-green": {
      low: "250 204 21", // yellow-400
      mid: "132 204 22", // lime-500
      high: "22 163 74", // green-600
    },
    custom: {
      low: "148 163 184", // slate-400
      mid: "100 116 139", // slate-500
      high: "51 65 85", // slate-700
    },
  };
  return scales[scale];
}

function getCellBackgroundColor(
  value: number,
  min: number,
  max: number,
  formatting?: ConditionalFormatting
): string | undefined {
  if (!formatting?.enabled) return undefined;

  const { low: lowThreshold, high: highThreshold } = formatting.thresholds;
  const range = max - min;
  const normalizedValue = range === 0 ? 0.5 : (value - min) / range;

  const colors =
    formatting.colorScale === "custom" && formatting.customColors
      ? formatting.customColors
      : getColorScale(formatting.colorScale);

  let opacity: number;
  let baseColor: string;

  if (formatting.autoThresholds) {
    // Use normalized value for auto thresholds
    if (normalizedValue <= 0.33) {
      opacity = normalizedValue / 0.33;
      baseColor = colors.low;
    } else if (normalizedValue <= 0.66) {
      opacity = (normalizedValue - 0.33) / 0.33;
      baseColor = colors.mid;
    } else {
      opacity = (normalizedValue - 0.66) / 0.34;
      baseColor = colors.high;
    }
  } else {
    // Use custom thresholds
    if (value <= lowThreshold) {
      opacity = lowThreshold === min ? 1 : (value - min) / (lowThreshold - min);
      baseColor = colors.low;
    } else if (value <= highThreshold) {
      opacity = (value - lowThreshold) / (highThreshold - lowThreshold);
      baseColor = colors.mid;
    } else {
      opacity = highThreshold === max ? 1 : (value - highThreshold) / (max - highThreshold);
      baseColor = colors.high;
    }
  }

  opacity = Math.max(0.15, Math.min(0.85, opacity));
  return `rgb(${baseColor} / ${opacity})`;
}

export function PivotTable<T extends Record<string, any>>({
  data,
  availableFields,
  initialConfig,
  onConfigChange,
}: PivotTableProps<T>) {
  const { toast } = useToast();
  const [config, setConfig] = useState<PivotConfig>(
    initialConfig || {
      rows: [],
      columns: [],
      values: [],
      conditionalFormatting: {
        enabled: false,
        colorScale: "red-green",
        thresholds: { low: 0, high: 100 },
        autoThresholds: true,
      },
      showTotals: false,
      showChart: false,
      sortConfig: [],
      filters: [],
      numberFormat: {
        type: "number",
        decimals: 2,
        thousandsSeparator: false,
      },
      calculatedFields: [],
      groupings: [],
      comparison: {
        enabled: false,
        mode: "period",
        showDifference: true,
        showPercentage: true,
      },
      enhancedFormatting: [],
    }
  );
  const [showConfig, setShowConfig] = useState(!initialConfig);
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showConfigManager, setShowConfigManager] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDragDrop, setShowDragDrop] = useState(false);

  // Undo/Redo state
  const [configHistory, setConfigHistory] = useState<PivotConfig[]>([config]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoRedoAction = useRef(false);

  // Auto-save state
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const AUTO_SAVE_KEY = "pivot-table-autosave";

  // Load saved configuration on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem(AUTO_SAVE_KEY);
    if (savedConfig && autoSaveEnabled) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
        onConfigChange?.(parsed);
        setLastSaved(new Date(parsed.savedAt || Date.now()));
        toast({
          title: "Configuration Restored",
          description: "Auto-saved configuration loaded successfully",
        });
      } catch (error) {
        console.error("Failed to load saved configuration:", error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save configuration with debouncing
  useEffect(() => {
    if (!autoSaveEnabled) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      const configToSave = {
        ...config,
        savedAt: Date.now(),
      };
      localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(configToSave));
      setLastSaved(new Date());
    }, 2000); // Save after 2 seconds of inactivity

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [config, autoSaveEnabled]);

  const clearAutoSave = () => {
    localStorage.removeItem(AUTO_SAVE_KEY);
    setLastSaved(null);
    toast({
      title: "Auto-save Cleared",
      description: "Saved configuration has been removed",
    });
  };

  const updateConfig = (newConfig: PivotConfig) => {
    if (isUndoRedoAction.current) {
      // If this is an undo/redo action, don't add to history
      setConfig(newConfig);
      onConfigChange?.(newConfig);
      isUndoRedoAction.current = false;
      return;
    }

    // Remove any future history if we're not at the end
    const newHistory = configHistory.slice(0, historyIndex + 1);

    // Add new config to history
    const updatedHistory = [...newHistory, newConfig];

    // Keep history limited to 50 entries
    const limitedHistory = updatedHistory.slice(-50);

    setConfigHistory(limitedHistory);
    setHistoryIndex(limitedHistory.length - 1);
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      isUndoRedoAction.current = true;
      updateConfig(configHistory[newIndex]);
      toast({
        title: "Undo",
        description: "Configuration change reverted",
      });
    }
  };

  const handleRedo = () => {
    if (historyIndex < configHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      isUndoRedoAction.current = true;
      updateConfig(configHistory[newIndex]);
      toast({
        title: "Redo",
        description: "Configuration change reapplied",
      });
    }
  };

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyIndex, configHistory]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < configHistory.length - 1;

  const addRow = (field: string) => {
    if (!config.rows.includes(field)) {
      updateConfig({ ...config, rows: [...config.rows, field] });
    }
  };

  const removeRow = (field: string) => {
    updateConfig({ ...config, rows: config.rows.filter((r) => r !== field) });
  };

  const addColumn = (field: string) => {
    if (!config.columns.includes(field)) {
      updateConfig({ ...config, columns: [...config.columns, field] });
    }
  };

  const removeColumn = (field: string) => {
    updateConfig({ ...config, columns: config.columns.filter((c) => c !== field) });
  };

  const addValue = (field: string, aggregation: PivotAggregateFunction) => {
    const fieldInfo = availableFields.find((f) => f.key === field);
    updateConfig({
      ...config,
      values: [
        ...config.values,
        {
          field,
          aggregation,
          label: `${aggregation}(${fieldInfo?.label || field})`,
        },
      ],
    });
  };

  const removeValue = (index: number) => {
    updateConfig({
      ...config,
      values: config.values.filter((_, i) => i !== index),
    });
  };

  // Apply filters to data
  const filteredData = useMemo(() => {
    if (!config.filters || config.filters.length === 0) return data;

    return data.filter((item) => {
      return config.filters!.every((filter) => {
        const value = item[filter.field];
        const filterValue = filter.value;

        switch (filter.operator) {
          case "equals":
            return String(value) === String(filterValue);
          case "contains":
            return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
          case "gt":
            return Number(value) > Number(filterValue);
          case "lt":
            return Number(value) < Number(filterValue);
          case "gte":
            return Number(value) >= Number(filterValue);
          case "lte":
            return Number(value) <= Number(filterValue);
          case "between":
            return Number(value) >= Number(filterValue) && Number(value) <= Number(filter.value2 || filterValue);
          default:
            return true;
        }
      });
    });
  }, [data, config.filters]);

  // Calculate pivot data
  const pivotData = useMemo(() => {
    if (config.rows.length === 0 || config.values.length === 0) {
      return null;
    }

    const result: PivotData = {};
    const rawData: any = {}; // Store raw records for drill-down
    const rowKeys = new Set<string>();
    const colKeys = new Set<string>();

    // Group data
    filteredData.forEach((item) => {
      const rowKey = config.rows.map((r) => String(item[r] || "")).join(" | ");
      const colKey =
        config.columns.length > 0
          ? config.columns.map((c) => String(item[c] || "")).join(" | ")
          : "Total";

      rowKeys.add(rowKey);
      colKeys.add(colKey);

      if (!result[rowKey]) {
        result[rowKey] = {};
        rawData[rowKey] = {};
      }
      if (!result[rowKey][colKey]) {
        result[rowKey][colKey] = {};
        rawData[rowKey][colKey] = [];
      }

      // Store raw record for drill-down
      rawData[rowKey][colKey].push(item);

      config.values.forEach((valueConfig) => {
        const key = `${valueConfig.field}_${valueConfig.aggregation}`;
        if (!result[rowKey][colKey][key]) {
          result[rowKey][colKey][key] = [] as number[];
        }

        const value = item[valueConfig.field];
        const numValue =
          typeof value === "number"
            ? value
            : valueConfig.aggregation === "count"
              ? 1
              : parseFloat(String(value || 0));

        if (!isNaN(numValue)) {
          const currentArray = result[rowKey][colKey][key] as number[];
          currentArray.push(numValue);
        }
      });
    });

    // Calculate aggregates
    const aggregated: PivotData = {};
    let minValue = Infinity;
    let maxValue = -Infinity;

    const sortedRowKeys = Array.from(rowKeys).sort();
    const sortedColKeys = Array.from(colKeys).sort();

    // Apply sorting
    if (config.sortConfig && config.sortConfig.length > 0) {
      config.sortConfig.forEach((sortConfig) => {
        const isValueField = sortConfig.field.includes("_");

        if (isValueField) {
          // Sort by value column
          sortedRowKeys.sort((a, b) => {
            // @ts-ignore - Assuming array access is valid for these fields
            const aVal = Number((result[a]?.[sortedColKeys[0]]?.[sortConfig.field] as any)?.[0] || 0);
            // @ts-ignore - Assuming array access is valid for these fields
            const bVal = Number((result[b]?.[sortedColKeys[0]]?.[sortConfig.field] as any)?.[0] || 0);
            return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
          });
        } else {
          // Sort by dimension
          sortedRowKeys.sort((a, b) => {
            const compare = a.localeCompare(b);
            return sortConfig.direction === "asc" ? compare : -compare;
          });
        }
      });
    }

    sortedRowKeys.forEach((rowKey) => {
      aggregated[rowKey] = {};
      sortedColKeys.forEach((colKey) => {
        aggregated[rowKey][colKey] = {};
        config.values.forEach((valueConfig) => {
          const key = `${valueConfig.field}_${valueConfig.aggregation}`;
          const values = (result[rowKey]?.[colKey]?.[key] || []) as number[];
          const aggregateValue = calculateAggregate(values, valueConfig.aggregation);
          aggregated[rowKey][colKey][key] = aggregateValue;

          // Track min/max for conditional formatting
          if (aggregateValue < minValue) minValue = aggregateValue;
          if (aggregateValue > maxValue) maxValue = aggregateValue;
        });
      });
    });

    // Calculate totals if enabled
    const rowTotals: any = {};
    const colTotals: any = {};
    const grandTotal: any = {};

    if (config.showTotals) {
      // Calculate row totals
      sortedRowKeys.forEach((rowKey) => {
        rowTotals[rowKey] = {};
        config.values.forEach((valueConfig) => {
          const key = `${valueConfig.field}_${valueConfig.aggregation}`;
          const allValues: number[] = [];
          sortedColKeys.forEach((colKey) => {
            const cellValue = aggregated[rowKey][colKey][key];
            if (typeof cellValue === "number") {
              allValues.push(cellValue);
            }
          });
          rowTotals[rowKey][key] = calculateAggregate(allValues, valueConfig.aggregation);
        });
      });

      // Calculate column totals
      sortedColKeys.forEach((colKey) => {
        colTotals[colKey] = {};
        config.values.forEach((valueConfig) => {
          const key = `${valueConfig.field}_${valueConfig.aggregation}`;
          const allValues: number[] = [];
          sortedRowKeys.forEach((rowKey) => {
            const cellValue = aggregated[rowKey][colKey][key];
            if (typeof cellValue === "number") {
              allValues.push(cellValue);
            }
          });
          colTotals[colKey][key] = calculateAggregate(allValues, valueConfig.aggregation);
        });
      });

      // Calculate grand total
      config.values.forEach((valueConfig) => {
        const key = `${valueConfig.field}_${valueConfig.aggregation}`;
        const allValues: number[] = [];
        sortedRowKeys.forEach((rowKey) => {
          sortedColKeys.forEach((colKey) => {
            const cellValue = aggregated[rowKey][colKey][key];
            if (typeof cellValue === "number") {
              allValues.push(cellValue);
            }
          });
        });
        grandTotal[key] = calculateAggregate(allValues, valueConfig.aggregation);
      });
    }

    return {
      data: aggregated,
      rowKeys: sortedRowKeys,
      colKeys: sortedColKeys,
      minValue: minValue === Infinity ? 0 : minValue,
      maxValue: maxValue === -Infinity ? 0 : maxValue,
      rawData,
      rowTotals,
      colTotals,
      grandTotal,
    };
  }, [filteredData, config]);

  const copyToClipboard = () => {
    if (!pivotData) return;

    const rows: string[] = [];

    // Header
    const header1 = [
      config.rows.map((r) => {
        const field = availableFields.find((f) => f.key === r);
        return field?.label || r;
      }).join(" / "),
      ...pivotData.colKeys.flatMap((colKey) =>
        config.values.map((v) => `${colKey} - ${v.label}`)
      ),
    ];
    rows.push(header1.join("\t"));

    // Data
    pivotData.rowKeys.forEach((rowKey) => {
      const row = [
        rowKey,
        ...pivotData.colKeys.flatMap((colKey) =>
          config.values.map((value) => {
            const key = `${value.field}_${value.aggregation}`;
            const cellValue = Number(pivotData.data[rowKey]?.[colKey]?.[key] || 0);
            return formatNumber(cellValue, config.numberFormat!);
          })
        ),
      ];
      rows.push(row.join("\t"));
    });

    navigator.clipboard.writeText(rows.join("\n"));
    toast({
      title: "Copied to clipboard",
      description: "Pivot table data has been copied",
    });
  };

  const availableRowFields = availableFields.filter(
    (f) => !config.rows.includes(f.key) && !config.columns.includes(f.key)
  );
  const availableColFields = availableFields.filter(
    (f) => !config.columns.includes(f.key) && !config.rows.includes(f.key)
  );

  // Include calculated fields in available value fields
  const calculatedFieldsAsFields = (config.calculatedFields || []).map(cf => ({
    key: cf.id,
    label: cf.name,
    type: "number" as const
  }));

  const availableValueFields = [
    ...availableFields.filter((f) => f.type === "number"),
    ...calculatedFieldsAsFields
  ];

  const exportToCSV = () => {
    if (!pivotData) return;

    const rows: string[][] = [];

    // Header row 1 - Column groups
    const header1 = [
      config.rows.map((r) => {
        const field = availableFields.find((f) => f.key === r);
        return field?.label || r;
      }).join(" / "),
    ];
    pivotData.colKeys.forEach((colKey) => {
      if (config.values.length > 1) {
        header1.push(colKey);
        for (let i = 1; i < config.values.length; i++) {
          header1.push("");
        }
      } else {
        header1.push(colKey);
      }
    });
    rows.push(header1);

    // Header row 2 - Value labels (if multiple values)
    if (config.values.length > 1) {
      const header2 = [""];
      pivotData.colKeys.forEach(() => {
        config.values.forEach((value) => {
          header2.push(value.label || "");
        });
      });
      rows.push(header2);
    }

    // Data rows
    pivotData.rowKeys.forEach((rowKey) => {
      const row = [rowKey];
      pivotData.colKeys.forEach((colKey) => {
        config.values.forEach((value) => {
          const key = `${value.field}_${value.aggregation}`;
          const cellValue = Number(pivotData.data[rowKey]?.[colKey]?.[key] || 0);
          row.push(formatNumber(cellValue, config.numberFormat!));
        });
      });
      rows.push(row);
    });

    const csvContent = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `pivot-table-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const rgbToHex = (rgb: string): string => {
    const match = rgb.match(/rgb\((\d+)\s+(\d+)\s+(\d+)\s*\/\s*([\d.]+)\)/);
    if (!match) return "FFFFFF";

    const [, r, g, b, a] = match;
    const opacity = parseFloat(a);

    // Blend with white background
    const blendedR = Math.round(parseInt(r) * opacity + 255 * (1 - opacity));
    const blendedG = Math.round(parseInt(g) * opacity + 255 * (1 - opacity));
    const blendedB = Math.round(parseInt(b) * opacity + 255 * (1 - opacity));

    return [blendedR, blendedG, blendedB]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
  };

  const exportToExcel = () => {
    if (!pivotData) return;

    const workbook = XLSX.utils.book_new();
    const worksheetData: any[][] = [];

    // Header row 1 - Column groups
    const header1 = [
      config.rows.map((r) => {
        const field = availableFields.find((f) => f.key === r);
        return field?.label || r;
      }).join(" / "),
    ];
    pivotData.colKeys.forEach((colKey) => {
      header1.push(colKey);
      for (let i = 1; i < config.values.length; i++) {
        header1.push("");
      }
    });
    worksheetData.push(header1);

    // Header row 2 - Value labels (if multiple values)
    if (config.values.length > 1) {
      const header2 = [""];
      pivotData.colKeys.forEach(() => {
        config.values.forEach((value) => {
          header2.push(value.label || "");
        });
      });
      worksheetData.push(header2);
    }

    // Data rows
    pivotData.rowKeys.forEach((rowKey) => {
      const row: any[] = [rowKey];
      pivotData.colKeys.forEach((colKey) => {
        config.values.forEach((value) => {
          const key = `${value.field}_${value.aggregation}`;
          const cellValue = Number(pivotData.data[rowKey]?.[colKey]?.[key] || 0);
          row.push(cellValue);
        });
      });
      worksheetData.push(row);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Apply formatting
    // const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");

    // Merge cells for column headers
    const merges: XLSX.Range[] = [];
    if (config.values.length > 1) {
      let colIdx = 1;
      pivotData.colKeys.forEach(() => {
        merges.push({
          s: { r: 0, c: colIdx },
          e: { r: 0, c: colIdx + config.values.length - 1 },
        });
        colIdx += config.values.length;
      });
    }
    worksheet["!merges"] = merges;

    // Apply conditional formatting colors
    if (config.conditionalFormatting?.enabled) {
      const dataStartRow = config.values.length > 1 ? 2 : 1;

      pivotData.rowKeys.forEach((rowKey, rowIdx) => {
        let colIdx = 1;
        pivotData.colKeys.forEach((colKey) => {
          config.values.forEach((value) => {
            const key = `${value.field}_${value.aggregation}`;
            const cellValue = Number(pivotData.data[rowKey]?.[colKey]?.[key] || 0);
            const backgroundColor = getCellBackgroundColor(
              cellValue,
              pivotData.minValue,
              pivotData.maxValue,
              config.conditionalFormatting
            );

            const cellRef = XLSX.utils.encode_cell({ r: dataStartRow + rowIdx, c: colIdx });
            if (!worksheet[cellRef]) worksheet[cellRef] = { t: "n", v: cellValue };

            if (backgroundColor) {
              worksheet[cellRef].s = {
                fill: {
                  fgColor: { rgb: rgbToHex(backgroundColor) },
                },
                alignment: { horizontal: "right" },
              };
            }

            colIdx++;
          });
        });
      });
    }

    // Set column widths
    const colWidths = [{ wch: 20 }];
    for (let i = 0; i < pivotData.colKeys.length * config.values.length; i++) {
      colWidths.push({ wch: 12 });
    }
    worksheet["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Pivot Table");
    XLSX.writeFile(workbook, `pivot-table-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleCellClick = (rowKey: string, colKey: string, valueConfig: any) => {
    if (!pivotData?.rawData) return;

    const records = pivotData.rawData[rowKey]?.[colKey] || [];
    setDrillDownData({
      rowKey,
      colKey,
      fieldName: valueConfig.field,
      aggregation: valueConfig.aggregation,
      records,
    });
  };

  const applyTemplate = (templateConfig: Partial<PivotConfig>) => {
    updateConfig({
      ...config,
      ...templateConfig,
    });
  };

  return (
    <div className="space-y-4">
      {/* Configuration Panel */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Pivot Configuration</h3>
              {lastSaved && autoSaveEnabled && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUndo}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRedo}
                disabled={!canRedo}
                title="Redo (Ctrl+Y)"
              >
                <Redo className="h-4 w-4" />
              </Button>
              <Button
                variant={autoSaveEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                title={`Auto-save is ${autoSaveEnabled ? "enabled" : "disabled"}`}
              >
                <Save className="h-4 w-4 mr-2" />
                Auto-save {autoSaveEnabled ? "On" : "Off"}
              </Button>
              {lastSaved && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAutoSave}
                  title="Clear saved configuration"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplates(true)}
              >
                <Library className="h-4 w-4 mr-2" />
                Templates
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfigManager(true)}
              >
                <Save className="h-4 w-4 mr-2" />
                Save/Load
              </Button>
              {pivotData && (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-background">
                      <DropdownMenuItem onClick={exportToExcel}>
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Export as Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={exportToCSV}>
                        <FileText className="h-4 w-4 mr-2" />
                        Export as CSV
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateConfig({ ...config, showChart: !config.showChart })
                    }
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    {config.showChart ? "Hide" : "Show"} Chart
                  </Button>
                </>
              )}
              <Button
                variant={showDragDrop ? "secondary" : "outline"}
                size="sm"
                onClick={() => setShowDragDrop(!showDragDrop)}
              >
                <Layers className="h-4 w-4 mr-2" />
                {showDragDrop ? "Hide" : "Show"} Drag & Drop
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConfig(!showConfig)}
              >
                <Settings2 className="h-4 w-4 mr-2" />
                {showConfig ? "Hide" : "Show"} Config
              </Button>
            </div>
          </div>

          {showConfig && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Row Fields */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Row Fields
                </label>
                <Select onValueChange={addRow}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add row field..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRowFields.map((field) => (
                      <SelectItem key={field.key} value={field.key}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {config.rows.map((field) => {
                    const fieldInfo = availableFields.find((f) => f.key === field);
                    return (
                      <Badge key={field} variant="secondary">
                        {fieldInfo?.label || field}
                        <button
                          onClick={() => removeRow(field)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Column Fields */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Column Fields
                </label>
                <Select onValueChange={addColumn}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add column field..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableColFields.map((field) => (
                      <SelectItem key={field.key} value={field.key}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {config.columns.map((field) => {
                    const fieldInfo = availableFields.find((f) => f.key === field);
                    return (
                      <Badge key={field} variant="secondary">
                        {fieldInfo?.label || field}
                        <button
                          onClick={() => removeColumn(field)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Value Fields */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Value Fields
                </label>
                <div className="flex gap-2">
                  <Select
                    onValueChange={(value) => {
                      const [field, agg] = value.split(":");
                      addValue(field, agg as PivotAggregateFunction);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Add value..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableValueFields.map((field) => (
                        <div key={field.key}>
                          <SelectItem value={`${field.key}:sum`}>
                            Sum of {field.label}
                          </SelectItem>
                          <SelectItem value={`${field.key}:avg`}>
                            Avg of {field.label}
                          </SelectItem>
                          <SelectItem value={`${field.key}:count`}>
                            Count of {field.label}
                          </SelectItem>
                          <SelectItem value={`${field.key}:min`}>
                            Min of {field.label}
                          </SelectItem>
                          <SelectItem value={`${field.key}:max`}>
                            Max of {field.label}
                          </SelectItem>
                          {ADVANCED_AGGREGATION_OPTIONS.map((agg) => (
                            <SelectItem key={`${field.key}:${agg.value}`} value={`${field.key}:${agg.value}`}>
                              {agg.label} of {field.label}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {config.values.map((value, index) => (
                    <Badge key={index} variant="secondary">
                      {value.label}
                      <button
                        onClick={() => removeValue(index)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Advanced Options Toggle */}
          {showConfig && config.values.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full"
              >
                <Settings2 className="h-4 w-4 mr-2" />
                {showAdvanced ? "Hide" : "Show"} Advanced Options
              </Button>
            </div>
          )}

          {/* Advanced Options */}
          {showConfig && showAdvanced && config.values.length > 0 && (
            <div className="mt-4 pt-4 border-t space-y-6">
              {/* Filters */}
              <PivotFilters
                filters={config.filters || []}
                onFiltersChange={(filters) => updateConfig({ ...config, filters })}
                availableFields={availableFields}
              />

              {/* Sorting */}
              <PivotSorting
                sortConfig={config.sortConfig || []}
                onSortChange={(sortConfig) => updateConfig({ ...config, sortConfig })}
                availableFields={availableFields}
                valueFields={config.values}
              />

              {/* Number Formatting */}
              <div>
                <h4 className="text-sm font-medium mb-3">Number Formatting</h4>
                <PivotFormatting
                  format={config.numberFormat!}
                  onFormatChange={(numberFormat) =>
                    updateConfig({ ...config, numberFormat })
                  }
                />
              </div>

              {/* Calculated Fields */}
              <div>
                <h4 className="text-sm font-medium mb-3">Calculated Fields</h4>
                <PivotCalculatedFields
                  calculatedFields={config.calculatedFields || []}
                  onCalculatedFieldsChange={(calculatedFields) =>
                    updateConfig({ ...config, calculatedFields })
                  }
                  availableFields={availableFields}
                />
              </div>

              {/* Grouping/Bucketing */}
              <div>
                <h4 className="text-sm font-medium mb-3">Grouping & Bucketing</h4>
                <PivotGrouping
                  groupings={config.groupings || []}
                  onGroupingsChange={(groupings) =>
                    updateConfig({ ...config, groupings })
                  }
                  availableFields={availableFields}
                />
              </div>

              {/* Comparison Mode */}
              <div>
                <h4 className="text-sm font-medium mb-3">Comparison Mode</h4>
                <PivotComparison
                  config={config.comparison || { enabled: false, mode: "period", showDifference: true, showPercentage: true }}
                  onConfigChange={(comparison) =>
                    updateConfig({ ...config, comparison })
                  }
                  availableFields={availableFields}
                />
              </div>

              {/* Enhanced Conditional Formatting */}
              <div>
                <h4 className="text-sm font-medium mb-3">Enhanced Formatting Rules</h4>
                <PivotEnhancedFormatting
                  rules={config.enhancedFormatting || []}
                  onRulesChange={(enhancedFormatting) =>
                    updateConfig({ ...config, enhancedFormatting })
                  }
                  availableFields={availableFields}
                />
              </div>
            </div>
          )}

          {/* Display Options Section */}
          {showConfig && config.values.length > 0 && (
            <div className="mt-4 pt-4 border-t space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Show Totals</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateConfig({
                      ...config,
                      showTotals: !config.showTotals,
                    })
                  }
                >
                  {config.showTotals ? "Hide" : "Show"} Totals
                </Button>
              </div>
            </div>
          )}

          {/* Conditional Formatting Section */}
          {showConfig && config.values.length > 0 && (
            <div className="mt-4 pt-4 border-t space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Conditional Formatting</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateConfig({
                      ...config,
                      conditionalFormatting: {
                        ...config.conditionalFormatting!,
                        enabled: !config.conditionalFormatting?.enabled,
                      },
                    })
                  }
                >
                  {config.conditionalFormatting?.enabled ? "Disable" : "Enable"}
                </Button>
              </div>

              {config.conditionalFormatting?.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Color Scale
                    </label>
                    <Select
                      value={config.conditionalFormatting.colorScale}
                      onValueChange={(value) =>
                        updateConfig({
                          ...config,
                          conditionalFormatting: {
                            ...config.conditionalFormatting!,
                            colorScale: value as ConditionalFormatting["colorScale"],
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="red-green">Red → Yellow → Green</SelectItem>
                        <SelectItem value="blue-red">Blue → Purple → Red</SelectItem>
                        <SelectItem value="yellow-green">Yellow → Lime → Green</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Threshold Mode
                    </label>
                    <Select
                      value={config.conditionalFormatting.autoThresholds ? "auto" : "manual"}
                      onValueChange={(value) =>
                        updateConfig({
                          ...config,
                          conditionalFormatting: {
                            ...config.conditionalFormatting!,
                            autoThresholds: value === "auto",
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto (Based on range)</SelectItem>
                        <SelectItem value="manual">Manual Thresholds</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {!config.conditionalFormatting.autoThresholds && (
                    <>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Low Threshold
                        </label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border rounded-md"
                          value={config.conditionalFormatting.thresholds.low}
                          onChange={(e) =>
                            updateConfig({
                              ...config,
                              conditionalFormatting: {
                                ...config.conditionalFormatting!,
                                thresholds: {
                                  ...config.conditionalFormatting!.thresholds,
                                  low: parseFloat(e.target.value) || 0,
                                },
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          High Threshold
                        </label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border rounded-md"
                          value={config.conditionalFormatting.thresholds.high}
                          onChange={(e) =>
                            updateConfig({
                              ...config,
                              conditionalFormatting: {
                                ...config.conditionalFormatting!,
                                thresholds: {
                                  ...config.conditionalFormatting!.thresholds,
                                  high: parseFloat(e.target.value) || 0,
                                },
                              },
                            })
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Drag & Drop Field Configuration */}
      {showDragDrop && (
        <Card>
          <CardHeader>
            <CardTitle>Drag & Drop Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <PivotFieldDragDrop
              availableFields={availableFields}
              config={config}
              onConfigChange={updateConfig}
            />
          </CardContent>
        </Card>
      )}

      {/* Pivot Chart */}
      {pivotData && config.showChart && config.values.length > 0 && (
        <PivotChart data={pivotData} valueConfig={config.values[0]} />
      )}

      {/* Pivot Table */}
      {pivotData && pivotData.rowKeys.length > 0 ? (
        <div className="rounded-md border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold bg-muted sticky left-0 z-10">
                  {config.rows.map((r) => {
                    const field = availableFields.find((f) => f.key === r);
                    return field?.label || r;
                  }).join(" / ")}
                </TableHead>
                {pivotData.colKeys.map((colKey) => (
                  <TableHead
                    key={colKey}
                    colSpan={config.values.length}
                    className="text-center font-bold bg-muted"
                  >
                    {colKey}
                  </TableHead>
                ))}
                {config.showTotals && (
                  <TableHead
                    colSpan={config.values.length}
                    className="text-center font-bold bg-muted"
                  >
                    Total
                  </TableHead>
                )}
              </TableRow>
              {config.values.length > 1 && (
                <TableRow>
                  <TableHead className="bg-muted/50 sticky left-0 z-10"></TableHead>
                  {pivotData.colKeys.map((colKey) =>
                    config.values.map((value, idx) => (
                      <TableHead
                        key={`${colKey}-${idx}`}
                        className="text-center bg-muted/50 text-xs"
                      >
                        {value.label}
                      </TableHead>
                    ))
                  )}
                  {config.showTotals &&
                    config.values.map((value, idx) => (
                      <TableHead
                        key={`total-${idx}`}
                        className="text-center bg-muted/50 text-xs"
                      >
                        {value.label}
                      </TableHead>
                    ))}
                </TableRow>
              )}
            </TableHeader>
            <TableBody>
              {pivotData.rowKeys.map((rowKey) => (
                <TableRow key={rowKey}>
                  <TableCell className="font-medium sticky left-0 bg-background">
                    {rowKey}
                  </TableCell>
                  {pivotData.colKeys.map((colKey) =>
                    config.values.map((value, idx) => {
                      const key = `${value.field}_${value.aggregation}`;
                      const cellValue = Number(
                        pivotData.data[rowKey]?.[colKey]?.[key] || 0
                      );
                      const backgroundColor = getCellBackgroundColor(
                        cellValue,
                        pivotData.minValue,
                        pivotData.maxValue,
                        config.conditionalFormatting
                      );
                      return (
                        <TableCell
                          key={`${colKey}-${idx}`}
                          className="text-right cursor-pointer hover:opacity-80"
                          style={{
                            backgroundColor,
                          }}
                          onClick={() => handleCellClick(rowKey, colKey, value)}
                          title="Click to drill down"
                        >
                          {formatNumber(cellValue, config.numberFormat!)}
                        </TableCell>
                      );
                    })
                  )}
                  {config.showTotals &&
                    config.values.map((value, idx) => {
                      const key = `${value.field}_${value.aggregation}`;
                      const cellValue = Number(
                        pivotData.rowTotals?.[rowKey]?.[key] || 0
                      );
                      return (
                        <TableCell
                          key={`total-${idx}`}
                          className="text-right font-semibold bg-muted/30"
                        >
                          {formatNumber(cellValue, config.numberFormat!)}
                        </TableCell>
                      );
                    })}
                </TableRow>
              ))}
              {config.showTotals && (
                <TableRow className="font-bold bg-muted/50">
                  <TableCell className="sticky left-0 bg-muted/50">
                    Grand Total
                  </TableCell>
                  {pivotData.colKeys.map((colKey) =>
                    config.values.map((value, idx) => {
                      const key = `${value.field}_${value.aggregation}`;
                      const cellValue = Number(
                        pivotData.colTotals?.[colKey]?.[key] || 0
                      );
                      return (
                        <TableCell
                          key={`col-total-${colKey}-${idx}`}
                          className="text-right"
                        >
                          {formatNumber(cellValue, config.numberFormat!)}
                        </TableCell>
                      );
                    })
                  )}
                  {config.values.map((value, idx) => {
                    const key = `${value.field}_${value.aggregation}`;
                    const cellValue = Number(
                      pivotData.grandTotal?.[key] || 0
                    );
                    return (
                      <TableCell
                        key={`grand-total-${idx}`}
                        className="text-right"
                      >
                        {formatNumber(cellValue, config.numberFormat!)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-8">
              <p className="font-medium mb-2">Configure your pivot table</p>
              <p className="text-sm">
                Add at least one row field and one value field to generate the pivot
                table
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Drill-Down Modal */}
      <PivotDrillDown
        isOpen={!!drillDownData}
        onClose={() => setDrillDownData(null)}
        drillDownData={drillDownData}
        availableFields={availableFields}
      />

      {/* Templates Modal */}
      <PivotTemplates
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onApplyTemplate={applyTemplate}
        availableFields={availableFields}
      />

      {/* Config Manager Modal */}
      <PivotConfigManager
        isOpen={showConfigManager}
        onClose={() => setShowConfigManager(false)}
        currentConfig={config}
        onLoadConfig={(loadedConfig) => updateConfig(loadedConfig)}
      />
    </div>
  );
}
