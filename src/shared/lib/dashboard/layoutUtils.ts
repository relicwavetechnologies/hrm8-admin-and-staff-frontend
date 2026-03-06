import type { DashboardWidget } from './types';

export function findEmptySpace(
  widgets: DashboardWidget[],
  requiredWidth: number,
  requiredHeight: number
): { x: number; y: number; w: number; h: number } {
  const grid: boolean[][] = Array(100).fill(0).map(() => Array(12).fill(false));
  
  // Mark occupied cells
  widgets.forEach(w => {
    for (let y = w.gridArea.y; y < w.gridArea.y + w.gridArea.h; y++) {
      for (let x = w.gridArea.x; x < w.gridArea.x + w.gridArea.w; x++) {
        if (grid[y] && grid[y][x] !== undefined) {
          grid[y][x] = true;
        }
      }
    }
  });
  
  // Find first available space
  for (let y = 0; y < grid.length - requiredHeight; y++) {
    for (let x = 0; x <= 12 - requiredWidth; x++) {
      let canFit = true;
      
      for (let dy = 0; dy < requiredHeight && canFit; dy++) {
        for (let dx = 0; dx < requiredWidth && canFit; dx++) {
          if (grid[y + dy][x + dx]) {
            canFit = false;
          }
        }
      }
      
      if (canFit) {
        return { x, y, w: requiredWidth, h: requiredHeight };
      }
    }
  }
  
  // No space found, add to bottom
  const maxY = Math.max(...widgets.map(w => w.gridArea.y + w.gridArea.h), 0);
  return { x: 0, y: maxY, w: requiredWidth, h: requiredHeight };
}

export function hasCollision(
  widget: DashboardWidget,
  otherWidgets: DashboardWidget[]
): boolean {
  return otherWidgets.some(other => {
    if (other.id === widget.id) return false;
    
    return !(
      widget.gridArea.x + widget.gridArea.w <= other.gridArea.x ||
      widget.gridArea.x >= other.gridArea.x + other.gridArea.w ||
      widget.gridArea.y + widget.gridArea.h <= other.gridArea.y ||
      widget.gridArea.y >= other.gridArea.y + other.gridArea.h
    );
  });
}

/**
 * Get all widgets that would collide with a given area
 */
export function getCollidingWidgets(
  targetArea: { x: number; y: number; w: number; h: number },
  allWidgets: DashboardWidget[],
  excludeId?: string
): DashboardWidget[] {
  return allWidgets.filter(widget => {
    if (widget.id === excludeId) return false;
    
    const hasOverlap = !(
      targetArea.x + targetArea.w <= widget.gridArea.x ||
      targetArea.x >= widget.gridArea.x + widget.gridArea.w ||
      targetArea.y + targetArea.h <= widget.gridArea.y ||
      targetArea.y >= widget.gridArea.y + widget.gridArea.h
    );
    
    return hasOverlap;
  });
}

interface ReflowResult {
  widgets: DashboardWidget[];
  success: boolean;
  movedWidgets: string[];
}

/**
 * Automatically reflow layout when a widget is resized
 */
export function reflowLayout(
  resizedWidget: DashboardWidget,
  newArea: { x: number; y: number; w: number; h: number },
  allWidgets: DashboardWidget[]
): ReflowResult {
  const movedWidgets: string[] = [];
  let updatedWidgets = [...allWidgets];
  
  // Update the resized widget
  updatedWidgets = updatedWidgets.map(w =>
    w.id === resizedWidget.id
      ? { ...w, gridArea: newArea }
      : w
  );
  
  // Get widgets that collide with the new size
  const collisions = getCollidingWidgets(newArea, updatedWidgets, resizedWidget.id);
  
  if (collisions.length === 0) {
    return { widgets: updatedWidgets, success: true, movedWidgets: [] };
  }
  
  // Push colliding widgets down
  collisions.forEach(collidingWidget => {
    if (collidingWidget.isLocked) return;
    
    const pushDownDistance = (newArea.y + newArea.h) - collidingWidget.gridArea.y;
    
    if (pushDownDistance > 0) {
      updatedWidgets = updatedWidgets.map(w =>
        w.id === collidingWidget.id
          ? {
              ...w,
              gridArea: {
                ...w.gridArea,
                y: w.gridArea.y + pushDownDistance
              }
            }
          : w
      );
      movedWidgets.push(collidingWidget.id);
    }
  });
  
  // Cascade push for newly colliding widgets
  let iterations = 0;
  const maxIterations = 10;
  
  while (iterations < maxIterations) {
    let hasNewCollisions = false;
    
    updatedWidgets.forEach(widget => {
      const collisions = getCollidingWidgets(
        widget.gridArea,
        updatedWidgets,
        widget.id
      );
      
      if (collisions.length > 0 && !widget.isLocked) {
        collisions.forEach(other => {
          if (!other.isLocked) {
            const pushDistance = (widget.gridArea.y + widget.gridArea.h) - other.gridArea.y;
            
            if (pushDistance > 0) {
              updatedWidgets = updatedWidgets.map(w =>
                w.id === other.id
                  ? {
                      ...w,
                      gridArea: {
                        ...w.gridArea,
                        y: w.gridArea.y + pushDistance
                      }
                    }
                  : w
              );
              
              if (!movedWidgets.includes(other.id)) {
                movedWidgets.push(other.id);
              }
              hasNewCollisions = true;
            }
          }
        });
      }
    });
    
    if (!hasNewCollisions) break;
    iterations++;
  }
  
  // Compact layout
  updatedWidgets = compactLayout(updatedWidgets);
  
  return {
    widgets: updatedWidgets,
    success: true,
    movedWidgets
  };
}

/**
 * Compact the layout by moving widgets up to fill gaps
 */
export function compactLayout(widgets: DashboardWidget[]): DashboardWidget[] {
  const sorted = [...widgets].sort((a, b) => a.gridArea.y - b.gridArea.y);
  
  return sorted.map(widget => {
    if (widget.isLocked) return widget;
    
    let newY = widget.gridArea.y;
    
    for (let testY = 0; testY < widget.gridArea.y; testY++) {
      const testArea = { ...widget.gridArea, y: testY };
      const collisions = getCollidingWidgets(testArea, sorted, widget.id);
      
      if (collisions.length === 0) {
        newY = testY;
        break;
      }
    }
    
    return {
      ...widget,
      gridArea: { ...widget.gridArea, y: newY }
    };
  });
}
