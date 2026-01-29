import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Settings2, GripVertical } from "lucide-react";
import { Column } from "./DataTable";

interface ColumnCustomizationProps<T> {
  columns: Column<T>[];
  visibleColumns: string[];
  columnOrder: string[];
  onVisibilityChange: (columnKey: string, visible: boolean) => void;
  onOrderChange: (newOrder: string[]) => void;
  onReset: () => void;
}

interface SortableColumnItemProps {
  column: Column<any>;
  isVisible: boolean;
  onVisibilityChange: (visible: boolean) => void;
}

function SortableColumnItem({ column, isVisible, onVisibilityChange }: SortableColumnItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-card border rounded-lg hover:bg-accent/50 transition-colors"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <Checkbox
        id={`column-${column.key}`}
        checked={isVisible}
        onCheckedChange={(checked) => onVisibilityChange(checked as boolean)}
      />
      <label
        htmlFor={`column-${column.key}`}
        className="flex-1 text-sm font-medium cursor-pointer"
      >
        {column.label}
      </label>
    </div>
  );
}

export function ColumnCustomization<T>({
  columns,
  visibleColumns,
  columnOrder,
  onVisibilityChange,
  onOrderChange,
  onReset,
}: ColumnCustomizationProps<T>) {
  const [open, setOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = columnOrder.indexOf(active.id as string);
      const newIndex = columnOrder.indexOf(over.id as string);
      const newOrder = arrayMove(columnOrder, oldIndex, newIndex);
      onOrderChange(newOrder);
    }
  };

  // Order columns according to columnOrder
  const orderedColumns = columnOrder
    .map(key => columns.find(col => col.key === key))
    .filter(Boolean) as Column<T>[];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="h-4 w-4 mr-2" />
          Columns
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Customize Columns</SheetTitle>
          <SheetDescription>
            Show/hide and reorder table columns. Your preferences will be saved automatically.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={columnOrder}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {orderedColumns.map((column) => (
                  <SortableColumnItem
                    key={column.key}
                    column={column}
                    isVisible={visibleColumns.includes(column.key)}
                    onVisibilityChange={(visible) =>
                      onVisibilityChange(column.key, visible)
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="w-full"
            >
              Reset to Default
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
