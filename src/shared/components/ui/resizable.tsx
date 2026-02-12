import { GripVertical } from "lucide-react";
import { Group, Panel, Separator } from "react-resizable-panels";

import { cn } from "@/shared/lib/utils";

type ResizableDirection = "horizontal" | "vertical";
type ResizablePanelGroupProps = React.ComponentProps<typeof Group> & {
  direction: ResizableDirection;
};

const ResizablePanelGroup = ({ className, direction, ...props }: ResizablePanelGroupProps) => (
  <Group
    className={cn("flex h-full w-full data-[panel-group-direction=vertical]:flex-col", className)}
    orientation={direction}
    {...(props as Omit<React.ComponentProps<typeof Group>, "orientation">)}
  />
);

const ResizablePanel = Panel;

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof Separator> & {
  withHandle?: boolean;
}) => (
  <Separator
    className={cn(
      "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1.5 after:-translate-x-1/2 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1.5 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&[data-panel-group-direction=vertical]>div]:rotate-90 hover:bg-primary/20 transition-colors cursor-col-resize data-[panel-group-direction=vertical]:cursor-row-resize",
      className,
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-6 w-4 items-center justify-center rounded-md border bg-background shadow-sm hover:bg-accent transition-colors">
        <GripVertical className="h-3 w-3 text-muted-foreground" />
      </div>
    )}
  </Separator>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
