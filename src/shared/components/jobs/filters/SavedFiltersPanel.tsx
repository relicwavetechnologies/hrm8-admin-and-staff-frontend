import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Star, Trash2 } from "lucide-react";
import { getSavedFilters, deleteSavedFilter, SavedFilter } from "@/shared/lib/savedFiltersService";
import { useToast } from "@/shared/hooks/use-toast";

interface SavedFiltersPanelProps {
  onSelectFilter: (filter: SavedFilter) => void;
}

export function SavedFiltersPanel({ onSelectFilter }: SavedFiltersPanelProps) {
  const savedFilters = getSavedFilters();
  const { toast } = useToast();

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete filter "${name}"?`)) {
      deleteSavedFilter(id);
      toast({
        title: "Filter deleted",
        description: `"${name}" has been removed.`,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {savedFilters.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No saved filters yet
            </p>
          ) : (
            savedFilters.map(filter => (
              <div
                key={filter.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => onSelectFilter(filter)}
              >
                <div className="flex items-center gap-2">
                  {filter.isDefault && <Star className="h-4 w-4 text-orange fill-orange" />}
                  <span className="font-medium">{filter.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(filter.id, filter.name);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
