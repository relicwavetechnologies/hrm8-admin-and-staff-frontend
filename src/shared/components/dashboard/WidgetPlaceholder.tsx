import { GripVertical, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { WIDGET_REGISTRY } from '@/shared/lib/dashboard/widgetRegistry';
import type { DashboardWidget } from '@/shared/lib/dashboard/types';

interface WidgetPlaceholderProps {
  widget: DashboardWidget;
  tempSize: { w: number; h: number };
  onRemove?: () => void;
  dragHandleProps?: any;
}

export function WidgetPlaceholder({ 
  widget, 
  tempSize,
  onRemove,
  dragHandleProps
}: WidgetPlaceholderProps) {
  // Get widget definition for icon
  const widgetDef = Object.values(WIDGET_REGISTRY).find(
    w => w.component === widget.component
  );
  const IconComponent = widgetDef?.icon;
  
  return (
    <div className="h-full w-full border-2 border-dashed border-primary/40 bg-primary/5 rounded-lg p-4 flex flex-col items-center justify-center gap-3 relative group">
      {/* Drag Handle */}
      <div
        {...dragHandleProps}
        className="absolute top-2 left-2 cursor-move hover:text-primary transition-colors opacity-60 group-hover:opacity-100"
      >
        <GripVertical className="h-5 w-5" />
      </div>
      
      {/* Remove Button */}
      {onRemove && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive hover:bg-destructive/10"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      
      {/* Widget Icon */}
      {IconComponent && (
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <IconComponent className="h-6 w-6 text-primary" />
        </div>
      )}
      
      {/* Widget Title */}
      <h4 className="font-semibold text-sm text-center px-8">{widget.title}</h4>
      
      {/* Size Badge */}
      <Badge variant="secondary" className="text-xs">
        {tempSize.w} × {tempSize.h}
      </Badge>
      
      {/* Lock indicator */}
      {widget.isLocked && (
        <Badge variant="outline" className="text-xs absolute bottom-2 left-2">
          Locked
        </Badge>
      )}
    </div>
  );
}
