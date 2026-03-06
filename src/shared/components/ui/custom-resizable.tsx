import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { GripVertical } from "lucide-react";

interface CustomResizablePanelProps {
  children: ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  maxWidthPercent?: number;
  isOpen: boolean;
  onToggle?: () => void;
}

export function CustomResizablePanel({
  children,
  defaultWidth = 400,
  minWidth = 300,
  maxWidth = 800,
  maxWidthPercent,
  isOpen,
}: CustomResizablePanelProps) {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [computedMaxWidth, setComputedMaxWidth] = useState(maxWidth);
  const panelRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  // Calculate max width based on percentage if provided
  useEffect(() => {
    if (maxWidthPercent && typeof window !== "undefined") {
      const updateMaxWidth = () => {
        const parentWidth = window.innerWidth;
        setComputedMaxWidth(Math.floor(parentWidth * (maxWidthPercent / 100)));
      };

      updateMaxWidth();
      window.addEventListener("resize", updateMaxWidth);
      return () => window.removeEventListener("resize", updateMaxWidth);
    }
  }, [maxWidthPercent]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
  }, [width]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = startXRef.current - e.clientX;
      const newWidth = Math.min(
        Math.max(startWidthRef.current + delta, minWidth),
        computedMaxWidth
      );
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, minWidth, computedMaxWidth]);

  useEffect(() => {
    if (isResizing) {
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
  }, [isResizing]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="relative flex h-full"
      style={{ width: `${width}px`, flexShrink: 0 }}
    >
      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        className="group absolute left-0 top-0 z-20 flex h-full w-1.5 cursor-col-resize items-center justify-center bg-border transition-all hover:w-2 hover:bg-primary/50"
      >
        <div className="flex h-12 w-5 items-center justify-center rounded-r-md border border-l-0 bg-background shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
