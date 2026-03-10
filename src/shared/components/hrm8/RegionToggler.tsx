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
  SelectValue,
} from '@/shared/components/ui/select';
import { useRegionStore } from '@/shared/stores/useRegionStore';
import { regionService } from '@/shared/lib/hrm8/regionService';
import { cn } from '@/shared/lib/utils';
import { useHrm8Auth } from '@/contexts/Hrm8AuthContext';
import { isAllRegionsSelected } from '@/shared/lib/regionScope';

interface RegionTogglerProps {
  isExpanded?: boolean;
}

export function RegionToggler({ isExpanded = true }: RegionTogglerProps) {
  const { hrm8User } = useHrm8Auth();
  const { selectedRegionId, regions, setRegions, setSelectedRegion, isLoading, setIsLoading } = useRegionStore();
  const isGlobalAdmin = hrm8User?.role === 'GLOBAL_ADMIN';

  // Load regions on component mount
  useEffect(() => {
    const loadRegions = async () => {
      try {
        setIsLoading(true);
        const response = await regionService.getAll(
          isGlobalAdmin ? undefined : { licenseeId: hrm8User?.licenseeId }
        );
        const fetchedRegions = response.data?.regions || [];

        // Map Region (service) to RegionConfig (store) if needed
        // For now, they share enough properties for basic display
        setRegions(fetchedRegions as any);

        const hasSelected = fetchedRegions.some((r) => r.id === selectedRegionId);
        if (isAllRegionsSelected(selectedRegionId)) {
          return;
        }

        if (!hasSelected && fetchedRegions.length > 0) {
          setSelectedRegion(fetchedRegions[0].id);
        }
      } catch (error) {
        console.error('Failed to load regions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRegions();
  }, [hrm8User?.id, hrm8User?.role, hrm8User?.licenseeId]);


  const selectedRegion = regions.find((r) => r.id === selectedRegionId);
  const triggerLabel =
    selectedRegionId === 'all' && isGlobalAdmin
      ? 'All Regions'
      : selectedRegion?.name || 'Select region';

  return (
    <div className={cn("mx-1 mb-2", !isExpanded && "mx-0")}>
      <Select value={selectedRegionId || 'all'} onValueChange={setSelectedRegion} disabled={isLoading}>
        <SelectTrigger
          className={cn(
            "h-11 w-full rounded-md text-[13px] shadow-none transition-colors hover:bg-sidebar-accent [&>svg]:text-muted-foreground",
            !isExpanded && "h-9 w-9 justify-center p-0 hover:bg-sidebar-accent"
          )}
          aria-label="Select region"
        >
          {isExpanded ? (
            <div className="flex min-w-0 items-center gap-2.5">
              {isLoading ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
              ) : (
                <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <SelectValue>
                <span className="truncate font-medium">{isLoading ? 'Loading...' : triggerLabel}</span>
              </SelectValue>
            </div>
          ) : isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Globe className="h-4 w-4 text-muted-foreground" />
          )}
        </SelectTrigger>
        <SelectContent>
          {(isGlobalAdmin || hrm8User?.role === 'REGIONAL_LICENSEE') && (
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5" />
                <span>All Regions</span>
              </div>
            </SelectItem>
          )}
          {regions.map((region) => (
            <SelectItem key={region.id} value={region.id}>
              {region.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
