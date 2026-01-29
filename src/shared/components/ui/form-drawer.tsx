import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

interface FormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  width?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  showCloseButton?: boolean;
}

const widthClasses = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl lg:max-w-4xl",
  xl: "sm:max-w-4xl lg:max-w-6xl",
  "2xl": "sm:max-w-5xl lg:max-w-7xl",
  full: "sm:max-w-full",
};

export function FormDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  width = "lg",
  showCloseButton = true,
}: FormDrawerProps) {
  // Reset scroll position when drawer opens
  React.useEffect(() => {
    if (open) {
      // Small delay to ensure ScrollArea is mounted
      const timeoutId = setTimeout(() => {
        const viewport = document.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
        if (viewport) {
          viewport.scrollTop = 0;
          viewport.scrollLeft = 0;
        }
      }, 50);
      
      return () => clearTimeout(timeoutId);
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn("w-full p-0 flex flex-col", widthClasses[width])}
      >
        <div className="sticky top-0 z-10 bg-background border-b px-8 py-4 lg:px-12">
          <SheetHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <SheetTitle>{title}</SheetTitle>
                {description && (
                  <SheetDescription className="mt-1">{description}</SheetDescription>
                )}
              </div>
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 -mr-2"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              )}
            </div>
          </SheetHeader>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-8 lg:px-12 lg:py-8">{children}</div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
