/**
 * Region Toggler Component
 * Allows switching between regions in the global region store
 */

import { useEffect } from 'react';
import { Globe, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/shared/components/ui/select';
import { useRegionStore } from '@/shared/stores/useRegionStore';
import { regionService } from '@/shared/lib/hrm8/regionService';
import { cn } from '@/shared/lib/utils';

interface RegionTogglerProps {
  isExpanded?: boolean;
}

export function RegionToggler({ isExpanded = true }: RegionTogglerProps) {
  const { selectedRegionId, regions, setRegions, setSelectedRegion, isLoading, setIsLoading } = useRegionStore();

  // Load regions on component mount
  useEffect(() => {
    const loadRegions = async () => {
      if (regions.length === 0) {
        try {
          setIsLoading(true);
          const response = await regionService.getAll();
          const fetchedRegions = response.data?.regions || [];

          // Map Region (service) to RegionConfig (store) if needed
          // For now, they share enough properties for basic display
          setRegions(fetchedRegions as any);

          // Auto-select first region if none is selected
          if (!selectedRegionId && fetchedRegions.length > 0) {
            setSelectedRegion(fetchedRegions[0].id);
          }
        } catch (error) {
          console.error('Failed to load regions:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadRegions();
  }, []);

  // Auto-select first region if none is selected
  useEffect(() => {
    if (!selectedRegionId && regions.length > 0) {
      setSelectedRegion(regions[0].id);
    }
  }, [selectedRegionId, regions, setSelectedRegion]);

  const selectedRegion = regions.find((r) => r.id === selectedRegionId);

  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 border-t border-sidebar-border/50 bg-sidebar-accent/5 rounded-lg mb-2 mx-1",
      !isExpanded && "justify-center px-0 mx-0"
    )}>
      {isLoading ? (
        <Loader2 className="h-5 w-5 flex-shrink-0 text-muted-foreground animate-spin" />
      ) : (
        <Globe className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
      )}
      {isExpanded && (
        <Select value={selectedRegionId || ''} onValueChange={setSelectedRegion} disabled={isLoading || regions.length === 0}>
          <SelectTrigger className="h-8 text-[13px] border-0 bg-transparent hover:bg-sidebar-accent/50 flex-1 px-1 focus:ring-0 focus:ring-offset-0">
            {isLoading ? (
              <span className="text-muted-foreground">Loading...</span>
            ) : selectedRegion ? (
              <span className="font-medium truncate">{selectedRegion.name}</span>
            ) : (
              <span className="text-muted-foreground">Select...</span>
            )}
          </SelectTrigger>
          <SelectContent>
            {regions.length === 0 ? (
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                No regions available
              </div>
            ) : (
              regions.map((region) => (
                <SelectItem key={region.id} value={region.id}>
                  {region.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
