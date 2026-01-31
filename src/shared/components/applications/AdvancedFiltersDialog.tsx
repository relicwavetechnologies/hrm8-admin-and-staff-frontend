import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Slider } from '@/shared/components/ui/slider';
import { Calendar } from '@/shared/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Badge } from '@/shared/components/ui/badge';
import { CalendarIcon, X, Save } from 'lucide-react';
import { format } from 'date-fns';
import { ApplicationFilters, FilterPreset } from '@/shared/types/filterPreset';
import { getFilterPresets, saveFilterPreset, deleteFilterPreset } from '@/shared/lib/filterPresetStorage';
import { toast } from 'sonner';

interface AdvancedFiltersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: ApplicationFilters) => void;
  currentFilters?: ApplicationFilters;
}

export function AdvancedFiltersDialog({ 
  open, 
  onOpenChange, 
  onApplyFilters,
  currentFilters = {}
}: AdvancedFiltersDialogProps) {
  const [filters, setFilters] = useState<ApplicationFilters>(currentFilters);
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [presetName, setPresetName] = useState('');
  const [showSavePreset, setShowSavePreset] = useState(false);

  useEffect(() => {
    setPresets(getFilterPresets());
  }, []);

  const handleApply = () => {
    onApplyFilters(filters);
    onOpenChange(false);
    toast.success('Filters applied');
  };

  const handleReset = () => {
    setFilters({});
    onApplyFilters({});
    toast.success('Filters cleared');
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      toast.error('Please enter a preset name');
      return;
    }

    const preset: FilterPreset = {
      id: Date.now().toString(),
      name: presetName,
      userId: 'current-user',
      filters,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveFilterPreset(preset);
    setPresets(getFilterPresets());
    setPresetName('');
    setShowSavePreset(false);
    toast.success(`Preset "${presetName}" saved`);
  };

  const handleLoadPreset = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setFilters(preset.filters);
      toast.success(`Loaded preset "${preset.name}"`);
    }
  };

  const handleDeletePreset = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    deleteFilterPreset(presetId);
    setPresets(getFilterPresets());
    toast.success(`Deleted preset "${preset?.name}"`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Advanced Filters</DialogTitle>
          <DialogDescription>
            Create complex filters to find exactly what you're looking for
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Saved Presets */}
          {presets.length > 0 && (
            <div className="space-y-2">
              <Label>Saved Filter Presets</Label>
              <div className="flex flex-wrap gap-2">
                {presets.map((preset) => (
                  <Badge
                    key={preset.id}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80 gap-2"
                  >
                    <span onClick={() => handleLoadPreset(preset.id)}>{preset.name}</span>
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => handleDeletePreset(preset.id)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={filters.status?.[0] || 'all'}
              onValueChange={(value) => 
                setFilters({ ...filters, status: value === 'all' ? undefined : [value] })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="screening">Screening</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Score Range */}
          <div className="space-y-2">
            <Label>
              Score Range: {filters.scoreRange?.[0] || 0} - {filters.scoreRange?.[1] || 100}
            </Label>
            <Slider
              min={0}
              max={100}
              step={5}
              value={filters.scoreRange || [0, 100]}
              onValueChange={(value) => 
                setFilters({ ...filters, scoreRange: value as [number, number] })
              }
              className="w-full"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange?.start ? format(new Date(filters.dateRange.start), 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange?.start ? new Date(filters.dateRange.start) : undefined}
                    onSelect={(date) => 
                      setFilters({
                        ...filters,
                        dateRange: {
                          ...filters.dateRange,
                          start: date?.toISOString() || '',
                          end: filters.dateRange?.end || '',
                        }
                      })
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange?.end ? format(new Date(filters.dateRange.end), 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange?.end ? new Date(filters.dateRange.end) : undefined}
                    onSelect={(date) => 
                      setFilters({
                        ...filters,
                        dateRange: {
                          start: filters.dateRange?.start || '',
                          end: date?.toISOString() || '',
                        }
                      })
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags (comma-separated)</Label>
            <Input
              placeholder="remote, senior, frontend"
              value={filters.tags?.join(', ') || ''}
              onChange={(e) => 
                setFilters({
                  ...filters,
                  tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                })
              }
            />
          </div>

          {/* Search */}
          <div className="space-y-2">
            <Label>Search Keywords</Label>
            <Input
              placeholder="Search in name, email, notes..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          {/* Save Preset */}
          {showSavePreset ? (
            <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
              <Label>Save as Preset</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter preset name"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                />
                <Button onClick={handleSavePreset} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowSavePreset(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setShowSavePreset(true)} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save Current Filters as Preset
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            Clear All
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply}>
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
