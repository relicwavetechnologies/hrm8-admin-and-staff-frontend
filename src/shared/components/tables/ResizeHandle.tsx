import { GripVertical } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface ResizeHandleProps {
  onResizeStart: (e: React.MouseEvent) => void;
  isResizing?: boolean;
}

export function ResizeHandle({ onResizeStart, isResizing }: ResizeHandleProps) {
  return (
    <div
      className={cn(
        "absolute right-0 top-0 bottom-0 w-1 cursor-col-resize group hover:bg-primary/20 transition-colors",
        isResizing && "bg-primary/30"
      )}
      onMouseDown={onResizeStart}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}
