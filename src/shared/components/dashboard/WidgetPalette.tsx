import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/shared/components/ui/sheet';
import { WIDGET_REGISTRY } from '@/shared/lib/dashboard/widgetRegistry';
import type { WidgetType } from '@/shared/lib/dashboard/widgetRegistry';
import type { DashboardType } from '@/shared/lib/dashboard/dashboardTypes';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Plus } from 'lucide-react';

interface WidgetPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddWidget: (widgetType: WidgetType) => void;
  dashboardType: DashboardType;
}

export function WidgetPalette({ open, onOpenChange, onAddWidget, dashboardType }: WidgetPaletteProps) {
  const categories = {
    stat: 'Statistics',
    chart: 'Charts & Analytics',
    activity: 'Activity Feeds'
  };
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Widget</SheetTitle>
          <SheetDescription>
            Choose a widget to add to your dashboard
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {Object.entries(categories).map(([category, label]) => {
            const categoryWidgets = Object.values(WIDGET_REGISTRY).filter(
              widget => widget.category === category && widget.allowedDashboards.includes(dashboardType)
            );
            
            if (categoryWidgets.length === 0) return null;
            
            return (
              <div key={category}>
                <h3 className="text-sm font-semibold mb-3">{label}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {categoryWidgets.map(widget => {
                    const Icon = widget.icon;
                    
                    return (
                      <div
                        key={widget.id}
                        className="border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer group bg-card"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Icon className="h-5 w-5" />
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {widget.defaultSize.w}×{widget.defaultSize.h}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-sm mb-1">{widget.name}</h4>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {widget.description}
                        </p>
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => onAddWidget(widget.id)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
