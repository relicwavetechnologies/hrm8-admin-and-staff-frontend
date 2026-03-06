import { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/shared/lib/utils';
import type { DashboardWidget } from '@/shared/lib/dashboard/types';
import { ResizeHandle } from './ResizeHandle';
import { WidgetPlaceholder } from './WidgetPlaceholder';
import { WIDGET_REGISTRY } from '@/shared/lib/dashboard/widgetRegistry';
import { useToast } from '@/shared/hooks/use-toast';
import { getCollidingWidgets, reflowLayout } from '@/shared/lib/dashboard/layoutUtils';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { GripVertical, X } from 'lucide-react';

interface DraggableWidgetProps {
  widget: DashboardWidget;
  isEditMode: boolean;
  showLivePreview?: boolean;
  isAffected?: boolean;
  allWidgets?: DashboardWidget[];
  onRemove: () => void;
  onUpdate?: (updates: Partial<DashboardWidget>) => void;
  onUpdateLayout?: (widgets: DashboardWidget[]) => void;
  children: React.ReactNode;
}

export function DraggableWidget({
  widget,
  isEditMode,
  showLivePreview = true,
  isAffected = false,
  allWidgets = [],
  onRemove,
  onUpdate,
  onUpdateLayout,
  children
}: DraggableWidgetProps) {
  const { toast } = useToast();
  const [tempSize, setTempSize] = useState(widget.gridArea);
  const [isColliding, setIsColliding] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: widget.id, 
    disabled: !isEditMode,
    data: { widget }
  });
  
  useEffect(() => {
    setTempSize(widget.gridArea);
  }, [widget.gridArea]);
  
  // Get widget definition for size constraints
  const widgetDef = Object.values(WIDGET_REGISTRY).find(
    w => w.component === widget.component
  );

  const handleResize = (delta: { width: number; height: number }) => {
    const newWidth = Math.max(
      widgetDef?.minSize.w || 2,
      Math.min(
        widgetDef?.maxSize?.w || 12,
        widget.gridArea.w + delta.width
      )
    );
    
    const newHeight = Math.max(
      widgetDef?.minSize.h || 1,
      Math.min(
        widgetDef?.maxSize?.h || 6,
        widget.gridArea.h + delta.height
      )
    );
    
    const newArea = {
      ...widget.gridArea,
      w: newWidth,
      h: newHeight
    };
    
    // Check for collisions
    if (allWidgets.length > 0) {
      const colliding = getCollidingWidgets(newArea, allWidgets, widget.id);
      setIsColliding(colliding.length > 0);
    }
    
    setTempSize(newArea);
  };

  const handleResizeEnd = () => {
    if (tempSize.w === widget.gridArea.w && tempSize.h === widget.gridArea.h) {
      return;
    }
    
    // Check for collisions and reflow if necessary
    if (allWidgets.length > 0 && onUpdateLayout) {
      const collisions = getCollidingWidgets(tempSize, allWidgets, widget.id);
      
      if (collisions.length > 0) {
        const reflowResult = reflowLayout(widget, tempSize, allWidgets);
        
        if (reflowResult.success) {
          onUpdateLayout(reflowResult.widgets);
          
          if (reflowResult.movedWidgets.length > 0) {
            toast({
              title: "Layout adjusted",
              description: `Moved ${reflowResult.movedWidgets.length} widget(s) to prevent overlap`,
            });
          }
        }
      } else if (onUpdate) {
        onUpdate({ gridArea: tempSize });
      }
    } else if (onUpdate) {
      onUpdate({ gridArea: tempSize });
    }
    
    setIsColliding(false);
  };
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    gridColumn: `${tempSize.x + 1} / span ${tempSize.w}`,
    gridRow: `${tempSize.y + 1} / span ${tempSize.h}`
  };
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative transition-all duration-200 group",
        isEditMode && "ring-2 ring-primary/30 rounded-lg",
        isAffected && "ring-warning ring-4 animate-pulse",
        isColliding && "ring-destructive ring-4"
      )}
    >
      {isEditMode ? (
        <>
          {showLivePreview ? (
            <div className="h-full relative">
              {/* Actual widget content */}
              {children}
              
              {/* Overlay with edit controls */}
              <div className="absolute inset-0 bg-primary/5 border-2 border-dashed border-primary/40 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Drag Handle */}
              <div
                {...attributes}
                {...listeners}
                className="absolute top-2 left-2 cursor-move hover:text-primary transition-colors opacity-0 group-hover:opacity-100 bg-background/90 rounded p-1 shadow-sm pointer-events-auto z-30"
              >
                <GripVertical className="h-5 w-5" />
              </div>
              
              {/* Remove Button */}
              {!widget.isLocked && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRemove}
                  className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 pointer-events-auto z-30 bg-background/90 hover:bg-destructive/10 hover:text-destructive shadow-sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              
              {/* Size indicator badge */}
              <Badge 
                variant="secondary" 
                className="absolute bottom-2 right-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20"
              >
                {tempSize.w} × {tempSize.h}
              </Badge>
              
              {/* Affected widget indicator */}
              {isAffected && (
                <Badge 
                  variant="outline" 
                  className="absolute top-2 left-1/2 -translate-x-1/2 text-xs bg-warning/10 border-warning text-warning z-20"
                >
                  Will move
                </Badge>
              )}
            </div>
          ) : (
            <WidgetPlaceholder 
              widget={widget}
              tempSize={tempSize}
              onRemove={!widget.isLocked ? onRemove : undefined}
              dragHandleProps={{ ...attributes, ...listeners }}
            />
          )}
          
          {/* Resize Handles */}
          <ResizeHandle 
            direction="right" 
            onResize={handleResize}
            onResizeEnd={handleResizeEnd}
          />
          <ResizeHandle 
            direction="bottom" 
            onResize={handleResize}
            onResizeEnd={handleResizeEnd}
          />
          <ResizeHandle 
            direction="corner" 
            onResize={handleResize}
            onResizeEnd={handleResizeEnd}
          />
        </>
      ) : (
        <div className="h-full">
          {children}
        </div>
      )}
    </div>
  );
}
