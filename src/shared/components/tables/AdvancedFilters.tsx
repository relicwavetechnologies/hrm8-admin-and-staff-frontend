import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Calendar } from "@/shared/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/shared/components/ui/command";
import { Badge } from "@/shared/components/ui/badge";
import { CalendarIcon, Check, Filter, Save, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/shared/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Checkbox } from "@/shared/components/ui/checkbox";

export interface MultiSelectOption {
  label: string;
  value: string;
}

export interface DateRangeFilter {
  key: string;
  label: string;
  from?: Date;
  to?: Date;
}

export interface MultiSelectFilter {
  key: string;
  label: string;
  options: MultiSelectOption[];
  selected: string[];
}

export interface FilterPreset {
  id: string;
  name: string;
  dateRanges: DateRangeFilter[];
  multiSelects: { [key: string]: string[] };
  savedAt: string;
}

interface AdvancedFiltersProps {
  dateRangeFilters?: DateRangeFilter[];
  onDateRangeChange?: (key: string, from: Date | undefined, to: Date | undefined) => void;
  multiSelectFilters?: MultiSelectFilter[];
  onMultiSelectChange?: (key: string, selected: string[]) => void;
  onResetFilters?: () => void;
  presets?: FilterPreset[];
  onSavePreset?: (preset: Omit<FilterPreset, 'id' | 'savedAt'>) => void;
  onLoadPreset?: (preset: FilterPreset) => void;
  onDeletePreset?: (presetId: string) => void;
}

export function AdvancedFilters({
  dateRangeFilters = [],
  onDateRangeChange,
  multiSelectFilters = [],
  onMultiSelectChange,
  onResetFilters,
  presets = [],
  onSavePreset,
  onLoadPreset,
  onDeletePreset,
}: AdvancedFiltersProps) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [openMultiSelects, setOpenMultiSelects] = useState<{ [key: string]: boolean }>({});

  const handleSavePreset = () => {
    if (!presetName.trim() || !onSavePreset) return;

    const dateRanges = dateRangeFilters.map(df => ({
      key: df.key,
      label: df.label,
      from: df.from,
      to: df.to,
    }));

    const multiSelects: { [key: string]: string[] } = {};
    multiSelectFilters.forEach(mf => {
      multiSelects[mf.key] = mf.selected;
    });

    onSavePreset({
      name: presetName,
      dateRanges,
      multiSelects,
    });

    setPresetName("");
    setSaveDialogOpen(false);
  };

  const hasActiveFilters = 
    dateRangeFilters.some(df => df.from || df.to) ||
    multiSelectFilters.some(mf => mf.selected.length > 0);

  const activeFilterCount = 
    dateRangeFilters.filter(df => df.from || df.to).length +
    multiSelectFilters.reduce((sum, mf) => sum + mf.selected.length, 0);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Date Range Filters */}
      {dateRangeFilters.map((dateFilter) => (
        <Popover key={dateFilter.key}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 border-dashed",
                (dateFilter.from || dateFilter.to) && "border-primary"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFilter.label}
              {dateFilter.from && (
                <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
                  {format(dateFilter.from, "PP")}
                  {dateFilter.to && ` - ${format(dateFilter.to, "PP")}`}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
            <div className="p-3 space-y-2 bg-background">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">From Date</Label>
                <Calendar
                  mode="single"
                  selected={dateFilter.from}
                  onSelect={(date) => onDateRangeChange?.(dateFilter.key, date, dateFilter.to)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">To Date</Label>
                <Calendar
                  mode="single"
                  selected={dateFilter.to}
                  onSelect={(date) => onDateRangeChange?.(dateFilter.key, dateFilter.from, date)}
                  className="pointer-events-auto"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDateRangeChange?.(dateFilter.key, undefined, undefined)}
                  className="flex-1"
                >
                  Clear
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      ))}

      {/* Multi-Select Filters */}
      {multiSelectFilters.map((multiFilter) => (
        <Popover 
          key={multiFilter.key}
          open={openMultiSelects[multiFilter.key]}
          onOpenChange={(open) => setOpenMultiSelects(prev => ({ ...prev, [multiFilter.key]: open }))}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 border-dashed",
                multiFilter.selected.length > 0 && "border-primary"
              )}
            >
              <Filter className="mr-2 h-4 w-4" />
              {multiFilter.label}
              {multiFilter.selected.length > 0 && (
                <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
                  {multiFilter.selected.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0 bg-background z-50" align="start">
            <Command className="bg-background">
              <CommandInput placeholder={`Search ${multiFilter.label.toLowerCase()}...`} />
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup className="max-h-[300px] overflow-auto">
                {multiFilter.options.map((option) => {
                  const isSelected = multiFilter.selected.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => {
                        const newSelected = isSelected
                          ? multiFilter.selected.filter(v => v !== option.value)
                          : [...multiFilter.selected, option.value];
                        onMultiSelectChange?.(multiFilter.key, newSelected);
                      }}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <Checkbox
                          checked={isSelected}
                          className="pointer-events-none"
                        />
                        <span>{option.label}</span>
                      </div>
                      {isSelected && <Check className="ml-auto h-4 w-4" />}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              <div className="border-t p-2 bg-background">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onMultiSelectChange?.(multiFilter.key, [])}
                  className="w-full"
                >
                  Clear
                </Button>
              </div>
            </Command>
          </PopoverContent>
        </Popover>
      ))}

      {/* Saved Presets */}
      {presets.length > 0 && (
        <Select onValueChange={(presetId) => {
          const preset = presets.find(p => p.id === presetId);
          if (preset) onLoadPreset?.(preset);
        }}>
          <SelectTrigger className="w-[180px] h-8">
            <SelectValue placeholder="Load preset..." />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            {presets.map((preset) => (
              <SelectItem key={preset.id} value={preset.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{preset.name}</span>
                  {onDeletePreset && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePreset(preset.id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Save Preset */}
      {hasActiveFilters && onSavePreset && (
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Save className="mr-2 h-4 w-4" />
              Save Preset
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-background z-50">
            <DialogHeader>
              <DialogTitle>Save Filter Preset</DialogTitle>
              <DialogDescription>
                Save your current filter settings for quick access later.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="preset-name">Preset Name</Label>
                <Input
                  id="preset-name"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="e.g., Active Cases This Month"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold mb-1">Current Filters:</p>
                <ul className="list-disc list-inside space-y-1">
                  {dateRangeFilters.filter(df => df.from || df.to).map(df => (
                    <li key={df.key}>
                      {df.label}: {df.from && format(df.from, "PP")}
                      {df.to && ` - ${format(df.to, "PP")}`}
                    </li>
                  ))}
                  {multiSelectFilters.filter(mf => mf.selected.length > 0).map(mf => (
                    <li key={mf.key}>
                      {mf.label}: {mf.selected.length} selected
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSavePreset} disabled={!presetName.trim()}>
                Save Preset
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Reset Filters */}
      {hasActiveFilters && onResetFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetFilters}
          className="h-8"
        >
          <X className="mr-2 h-4 w-4" />
          Reset
          <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
            {activeFilterCount}
          </Badge>
        </Button>
      )}
    </div>
  );
}
