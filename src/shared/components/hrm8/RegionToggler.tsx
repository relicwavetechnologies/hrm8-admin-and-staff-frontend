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
import { useHrm8Auth } from '@/contexts/Hrm8AuthContext';

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
        <Select value={selectedRegionId || 'all'} onValueChange={setSelectedRegion} disabled={isLoading}>
          <SelectTrigger className="h-8 text-[13px] border-0 bg-transparent hover:bg-sidebar-accent/50 flex-1 px-1 focus:ring-0 focus:ring-offset-0">
            {isLoading ? (
              <span className="text-muted-foreground">Loading...</span>
            ) : selectedRegionId === 'all' && isGlobalAdmin ? (
              <span className="font-medium truncate">All Regions</span>
            ) : selectedRegion ? (
              <span className="font-medium truncate">{selectedRegion.name}</span>
            ) : (
              <span className="text-muted-foreground">Select...</span>
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
      )}
    </div>
  );
}
