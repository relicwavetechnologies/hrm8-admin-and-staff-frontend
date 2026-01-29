import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { GripVertical, X, Calculator } from "lucide-react";
import { PivotAggregateFunction, PivotConfig } from "./PivotTable";
import { cn } from "@/shared/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

interface Field {
  key: string;
  label: string;
  type?: "number" | "string" | "date";
}

interface DraggableFieldProps {
  field: Field;
  isDragging?: boolean;
  onRemove?: () => void;
  aggregation?: PivotAggregateFunction;
  onAggregationChange?: (agg: PivotAggregateFunction) => void;
  showAggregation?: boolean;
}

function DraggableField({
  field,
  isDragging,
  onRemove,
  aggregation,
  onAggregationChange,
  showAggregation,
}: DraggableFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: field.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 bg-secondary/50 rounded-md hover:bg-secondary transition-colors"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <Badge variant="outline" className="flex-1">
        {field.label}
      </Badge>
      {showAggregation && aggregation && onAggregationChange && (
        <Select value={aggregation} onValueChange={onAggregationChange}>
          <SelectTrigger className="h-7 w-20 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sum">Sum</SelectItem>
            <SelectItem value="avg">Avg</SelectItem>
            <SelectItem value="count">Count</SelectItem>
            <SelectItem value="min">Min</SelectItem>
            <SelectItem value="max">Max</SelectItem>
          </SelectContent>
        </Select>
      )}
      {onRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onRemove}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

interface DroppableZoneProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  fields: Field[];
  values?: { field: string; aggregation: PivotAggregateFunction }[];
  onRemove: (field: string) => void;
  onAggregationChange?: (field: string, agg: PivotAggregateFunction) => void;
  showAggregation?: boolean;
  emptyMessage?: string;
}

function DroppableZone({
  id,
  title,
  icon,
  fields,
  values,
  onRemove,
  onAggregationChange,
  showAggregation,
  emptyMessage = "Drag fields here",
}: DroppableZoneProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={setNodeRef}
          className={cn(
            "min-h-[80px] space-y-2 p-2 border-2 border-dashed rounded-md bg-muted/20 transition-colors",
            isOver && "border-primary bg-primary/10"
          )}
        >
          {fields.length === 0 && !values?.length ? (
            <div className="flex items-center justify-center h-full min-h-[80px] text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            <SortableContext
              items={fields.map((f) => f.key)}
              strategy={verticalListSortingStrategy}
            >
              {showAggregation && values
                ? values.map((value, index) => {
                    const field = fields.find((f) => f.key === value.field);
                    if (!field) return null;
                    return (
                      <DraggableField
                        key={`${field.key}-${index}`}
                        field={field}
                        onRemove={() => onRemove(field.key)}
                        aggregation={value.aggregation}
                        onAggregationChange={(agg) =>
                          onAggregationChange?.(field.key, agg)
                        }
                        showAggregation
                      />
                    );
                  })
                : fields.map((field) => (
                    <DraggableField
                      key={field.key}
                      field={field}
                      onRemove={() => onRemove(field.key)}
                    />
                  ))}
            </SortableContext>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface PivotFieldDragDropProps {
  availableFields: Field[];
  config: PivotConfig;
  onConfigChange: (config: PivotConfig) => void;
}

export function PivotFieldDragDrop({
  availableFields,
  config,
  onConfigChange,
}: PivotFieldDragDropProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const usedFieldKeys = [
    ...config.rows,
    ...config.columns,
    ...config.values.map((v) => v.field),
  ];

  const availableFieldsFiltered = availableFields.filter(
    (f) => !usedFieldKeys.includes(f.key)
  );

  const rowFields = config.rows
    .map((key) => availableFields.find((f) => f.key === key))
    .filter(Boolean) as Field[];

  const columnFields = config.columns
    .map((key) => availableFields.find((f) => f.key === key))
    .filter(Boolean) as Field[];

  const valueFields = config.values
    .map((v) => availableFields.find((f) => f.key === v.field))
    .filter(Boolean) as Field[];

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeField = active.id as string;
    const overContainer = over.id as string;

    // Remove from current location
    const newRows = config.rows.filter((r) => r !== activeField);
    const newColumns = config.columns.filter((c) => c !== activeField);
    const newValues = config.values.filter((v) => v.field !== activeField);

    // Add to new location
    if (overContainer === "rows" || over.data.current?.sortable?.containerId === "rows") {
      if (!newRows.includes(activeField)) {
        newRows.push(activeField);
      }
    } else if (overContainer === "columns" || over.data.current?.sortable?.containerId === "columns") {
      if (!newColumns.includes(activeField)) {
        newColumns.push(activeField);
      }
    } else if (overContainer === "values" || over.data.current?.sortable?.containerId === "values") {
      const field = availableFields.find((f) => f.key === activeField);
      const existingValue = config.values.find((v) => v.field === activeField);
      if (!newValues.find((v) => v.field === activeField)) {
        newValues.push({
          field: activeField,
          aggregation: existingValue?.aggregation || (field?.type === "number" ? "sum" : "count"),
          label: existingValue?.label || `sum(${field?.label || activeField})`,
        });
      }
    }

    onConfigChange({
      ...config,
      rows: newRows,
      columns: newColumns,
      values: newValues,
    });
  };

  const handleRemoveRow = (field: string) => {
    onConfigChange({
      ...config,
      rows: config.rows.filter((r) => r !== field),
    });
  };

  const handleRemoveColumn = (field: string) => {
    onConfigChange({
      ...config,
      columns: config.columns.filter((c) => c !== field),
    });
  };

  const handleRemoveValue = (field: string) => {
    onConfigChange({
      ...config,
      values: config.values.filter((v) => v.field !== field),
    });
  };

  const handleAggregationChange = (field: string, aggregation: PivotAggregateFunction) => {
    const fieldInfo = availableFields.find((f) => f.key === field);
    onConfigChange({
      ...config,
      values: config.values.map((v) =>
        v.field === field
          ? {
              ...v,
              aggregation,
              label: `${aggregation}(${fieldInfo?.label || field})`,
            }
          : v
      ),
    });
  };

  const activeField = availableFields.find((f) => f.key === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Available Fields */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Available Fields</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {availableFieldsFiltered.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  All fields are in use
                </div>
              ) : (
                <SortableContext
                  items={availableFieldsFiltered.map((f) => f.key)}
                  strategy={verticalListSortingStrategy}
                >
                  {availableFieldsFiltered.map((field) => (
                    <DraggableField key={field.key} field={field} />
                  ))}
                </SortableContext>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Configuration Zones */}
        <div className="space-y-4">
          <DroppableZone
            id="rows"
            title="Rows"
            fields={rowFields}
            onRemove={handleRemoveRow}
            emptyMessage="Drag row fields here"
          />

          <DroppableZone
            id="columns"
            title="Columns"
            fields={columnFields}
            onRemove={handleRemoveColumn}
            emptyMessage="Drag column fields here"
          />

          <DroppableZone
            id="values"
            title="Values"
            icon={<Calculator className="h-4 w-4" />}
            fields={valueFields}
            values={config.values}
            onRemove={handleRemoveValue}
            onAggregationChange={handleAggregationChange}
            showAggregation
            emptyMessage="Drag value fields here"
          />
        </div>
      </div>

      <DragOverlay>
        {activeField ? (
          <div className="p-2 bg-secondary rounded-md shadow-lg">
            <Badge variant="outline">{activeField.label}</Badge>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
