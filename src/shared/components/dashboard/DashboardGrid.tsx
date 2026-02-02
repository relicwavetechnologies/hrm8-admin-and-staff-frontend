import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { DraggableWidget } from './DraggableWidget';
import { WidgetRenderer } from './WidgetRenderer';
import type { DashboardLayout, DashboardWidget } from '@/shared/lib/dashboard/types';

interface DashboardGridProps {
  layout: DashboardLayout;
  isEditMode: boolean;
  showLivePreview?: boolean;
  onUpdateWidget: (id: string, updates: Partial<DashboardWidget>) => void;
  onUpdateLayout?: (widgets: DashboardWidget[]) => void;
  onRemoveWidget: (id: string) => void;
}

export function DashboardGrid({
  layout,
  isEditMode,
  showLivePreview = true,
  onUpdateWidget,
  onUpdateLayout,
  onRemoveWidget
}: DashboardGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    
    const activeWidget = layout.widgets.find(w => w.id === active.id);
    const overWidget = layout.widgets.find(w => w.id === over.id);
    
    if (!activeWidget || !overWidget) return;
    
    // Swap positions
    const activePos = { ...activeWidget.gridArea };
    const overPos = { ...overWidget.gridArea };
    
    onUpdateWidget(activeWidget.id, { gridArea: overPos });
    onUpdateWidget(overWidget.id, { gridArea: activePos });
  };
  
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={layout.widgets.map(w => w.id)}
        strategy={rectSortingStrategy}
      >
        <div
          className="grid gap-4 relative"
          style={{
            gridTemplateColumns: 'repeat(12, 1fr)',
            gridAutoRows: 'minmax(200px, auto)',
            gridAutoFlow: 'dense'
          }}
        >
          {/* Enhanced grid overlay in edit mode */}
          {isEditMode && (
            <div className="absolute inset-0 pointer-events-none z-0">
              {/* Column lines with numbers */}
              <div className="grid grid-cols-12 h-full">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={`col-${i}`} className="border-r border-primary/30 relative">
                    <span className="absolute top-1 left-1 text-[10px] text-primary/50 font-mono bg-background/80 px-1 rounded">
                      {i + 1}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Row lines */}
              <div className="absolute inset-0" style={{ top: '200px' }}>
                {Array.from({ length: 20 }).map((_, i) => (
                  <div 
                    key={`row-${i}`} 
                    className="border-t border-primary/30 relative" 
                    style={{ marginTop: i > 0 ? '200px' : '0' }}
                  >
                    <span className="absolute left-1 -top-2 text-[10px] text-primary/50 font-mono bg-background/80 px-1 rounded">
                      {i + 2}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {layout.widgets
            .filter(w => w.isVisible)
            .map(widget => (
              <DraggableWidget
                key={widget.id}
                widget={widget}
                isEditMode={isEditMode}
                showLivePreview={showLivePreview}
                allWidgets={layout.widgets}
                onRemove={() => onRemoveWidget(widget.id)}
                onUpdate={(updates) => onUpdateWidget(widget.id, updates)}
                onUpdateLayout={onUpdateLayout}
              >
                <WidgetRenderer widget={widget} />
              </DraggableWidget>
            ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
