import { useState, useEffect, useCallback, useRef } from 'react';

interface ColumnWidths {
  [key: string]: number;
}

interface UseColumnResizeOptions {
  tableId: string;
  defaultWidths?: ColumnWidths;
  minWidth?: number;
  maxWidth?: number;
}

export function useColumnResize({
  tableId,
  defaultWidths = {},
  minWidth = 100,
  maxWidth = 800,
}: UseColumnResizeOptions) {
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem(`table-widths-${tableId}`);
    if (stored) {
      try {
        return { ...defaultWidths, ...JSON.parse(stored) };
      } catch {
        return defaultWidths;
      }
    }
    return defaultWidths;
  });

  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  // Persist to localStorage whenever widths change
  useEffect(() => {
    localStorage.setItem(`table-widths-${tableId}`, JSON.stringify(columnWidths));
  }, [columnWidths, tableId]);

  const handleResizeStart = useCallback((columnKey: string, startX: number, currentWidth: number) => {
    setResizingColumn(columnKey);
    startXRef.current = startX;
    startWidthRef.current = currentWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!resizingColumn) return;

      const deltaX = e.clientX - startXRef.current;
      const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidthRef.current + deltaX));

      setColumnWidths((prev) => ({
        ...prev,
        [resizingColumn]: newWidth,
      }));
    },
    [resizingColumn, minWidth, maxWidth]
  );

  const handleResizeEnd = useCallback(() => {
    setResizingColumn(null);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  // Attach global mouse move and mouse up listeners when resizing
  useEffect(() => {
    if (resizingColumn) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);

      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [resizingColumn, handleResizeMove, handleResizeEnd]);

  const getColumnWidth = useCallback(
    (columnKey: string): number | undefined => {
      return columnWidths[columnKey];
    },
    [columnWidths]
  );

  const resetWidths = useCallback(() => {
    setColumnWidths(defaultWidths);
    localStorage.removeItem(`table-widths-${tableId}`);
  }, [defaultWidths, tableId]);

  return {
    columnWidths,
    getColumnWidth,
    handleResizeStart,
    resetWidths,
    isResizing: !!resizingColumn,
  };
}
