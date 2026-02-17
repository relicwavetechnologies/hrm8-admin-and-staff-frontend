import * as React from "react";
import { cn } from "@/shared/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";

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
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={showCloseButton}
        className={cn("w-full p-0", widthClasses[width])}
      >
        <div className="border-b px-6 py-4">
          <SheetHeader className="pr-8">
            <SheetTitle>{title}</SheetTitle>
            {description ? <SheetDescription>{description}</SheetDescription> : null}
          </SheetHeader>
        </div>

        <div className="max-h-[calc(100svh-5rem)] overflow-y-auto px-6 py-6">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
