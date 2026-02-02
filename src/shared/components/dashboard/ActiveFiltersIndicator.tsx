import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { X, MapPin, Globe } from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

interface ActiveFiltersIndicatorProps {
  selectedCountry: string;
  selectedRegion: string;
  dateRange?: DateRange;
  onClearCountry?: () => void;
  onClearRegion?: () => void;
  onClearDateRange?: () => void;
}

export function ActiveFiltersIndicator({
  selectedCountry,
  selectedRegion,
  dateRange,
  onClearCountry,
  onClearRegion,
  onClearDateRange,
}: ActiveFiltersIndicatorProps) {
  const hasActiveFilters = selectedCountry !== "all" || selectedRegion !== "all" || dateRange?.from;

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap bg-muted/50 px-4 py-2 rounded-lg border border-border/50 transition-[background,border-color,box-shadow,color] duration-500">
      <span className="text-sm text-muted-foreground font-medium">Active filters:</span>
      
      {selectedCountry !== "all" && (
        <Badge variant="secondary" className="gap-2 pr-1 transition-[background,border-color,color] duration-500">
          <MapPin className="h-3 w-3" />
          <span>Country: {selectedCountry}</span>
          {onClearCountry && (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={onClearCountry}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </Badge>
      )}

      {selectedRegion !== "all" && (
        <Badge variant="secondary" className="gap-2 pr-1 transition-[background,border-color,color] duration-500">
          <Globe className="h-3 w-3" />
          <span>Region: {selectedRegion}</span>
          {onClearRegion && (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={onClearRegion}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </Badge>
      )}

      {dateRange?.from && (
        <Badge variant="secondary" className="gap-2 pr-1 transition-[background,border-color,color] duration-500">
          <span>
            Date: {format(dateRange.from, "MMM d, yyyy")}
            {dateRange.to && ` - ${format(dateRange.to, "MMM d, yyyy")}`}
          </span>
          {onClearDateRange && (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={onClearDateRange}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </Badge>
      )}
    </div>
  );
}
