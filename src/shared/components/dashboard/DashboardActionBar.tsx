import { DateRangePicker } from "@/shared/components/ui/date-range-picker-v2";
import { Button } from "@/shared/components/ui/button";
import { Download, Filter as FilterIcon, RotateCcw } from "lucide-react";
import type { DateRange } from "react-day-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { REGION_COUNTRY_MAP } from "@/shared/lib/countryRegions";

interface DashboardActionBarProps {
  dateRange?: DateRange;
  onDateRangeChange: (range: DateRange | undefined) => void;
  selectedCountry: string;
  selectedRegion: string;
  onCountryChange: (country: string) => void;
  onRegionChange: (region: string) => void;
  onExport: () => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "India",
  "Singapore",
  "Netherlands",
  "Spain",
  "Italy",
  "Brazil",
  "Mexico",
  "Japan",
  "China",
].sort();

const REGIONS = Object.keys(REGION_COUNTRY_MAP);

export function DashboardActionBar({
  dateRange,
  onDateRangeChange,
  selectedCountry,
  selectedRegion,
  onCountryChange,
  onRegionChange,
  onExport,
  onResetFilters,
  hasActiveFilters,
}: DashboardActionBarProps) {
  const activeFilterCount = [
    dateRange?.from,
    selectedCountry !== "all",
    selectedRegion !== "all",
  ].filter(Boolean).length;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <DateRangePicker
        value={dateRange}
        onChange={onDateRangeChange}
        placeholder="Select period"
        align="end"
        size="sm"
      />

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <FilterIcon className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs font-semibold rounded-full bg-primary text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Location Filters</DialogTitle>
            <DialogDescription>
              Filter dashboard data by country or region
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Country</Label>
              <Select value={selectedCountry} onValueChange={onCountryChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Region</Label>
              <Select value={selectedRegion} onValueChange={onRegionChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {REGIONS.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetFilters}
          title="Clear all filters"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      )}

      <Button variant="secondary" size="sm" onClick={onExport}>
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
    </div>
  );
}
