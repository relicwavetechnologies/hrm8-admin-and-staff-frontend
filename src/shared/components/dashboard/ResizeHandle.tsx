import { useState } from 'react';
import { cn } from '@/shared/lib/utils';

interface ResizeHandleProps {
  direction: 'right' | 'bottom' | 'corner';
  onResize: (delta: { width: number; height: number }) => void;
  onResizeEnd: () => void;
}

export function ResizeHandle({ direction, onResize, onResizeEnd }: ResizeHandleProps) {
  const [isResizing, setIsResizing] = useState(false);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const startX = e.clientX;
    const startY = e.clientY;
    let lastDeltaX = 0;
    let lastDeltaY = 0;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      // Convert pixels to grid columns/rows
      const columnWidth = window.innerWidth / 12;
      const rowHeight = 200;
      
      let widthChange = 0;
      let heightChange = 0;
      
      // Only calculate change for relevant direction
      if (direction === 'right' || direction === 'corner') {
        widthChange = Math.round(deltaX / columnWidth);
      }
      
      if (direction === 'bottom' || direction === 'corner') {
        heightChange = Math.round(deltaY / rowHeight);
      }
      
      // Only trigger if changed
      if (widthChange !== lastDeltaX || heightChange !== lastDeltaY) {
        lastDeltaX = widthChange;
        lastDeltaY = heightChange;
        onResize({ width: widthChange, height: heightChange });
      }
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      onResizeEnd();
    };
    
    setIsResizing(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleStyles = {
    right: "absolute top-0 right-0 h-full w-2 cursor-ew-resize hover:bg-primary/20 z-20",
    bottom: "absolute bottom-0 left-0 w-full h-2 cursor-ns-resize hover:bg-primary/20 z-20",
    corner: "absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize hover:bg-primary/40 rounded-tl-sm z-20"
  };
  
  return (
    <div
      className={cn(
        handleStyles[direction],
        "transition-colors",
        isResizing && "bg-primary/40"
      )}
      onMouseDown={handleMouseDown}
    >
      {direction === 'corner' && (
        <div className="absolute bottom-0.5 right-0.5 w-2 h-2 border-r-2 border-b-2 border-primary/60" />
      )}
    </div>
  );
}
