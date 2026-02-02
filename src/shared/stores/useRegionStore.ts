/**
 * Global Region Store
 * Manages the selected region state across the entire HRM8 admin dashboard
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RegionConfig } from '@/shared/types/systemSettings';

interface RegionStore {
  // State
  selectedRegionId: string | null;
  regions: RegionConfig[];
  isLoading: boolean;

  // Actions
  setSelectedRegion: (regionId: string) => void;
  setRegions: (regions: RegionConfig[]) => void;
  setIsLoading: (loading: boolean) => void;
  reset: () => void;
}

const INITIAL_STATE = {
  selectedRegionId: null,
  regions: [],
  isLoading: false,
};

export const useRegionStore = create<RegionStore>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      setSelectedRegion: (regionId: string) =>
        set({ selectedRegionId: regionId }),

      setRegions: (regions: RegionConfig[]) =>
        set({ regions }),

      setIsLoading: (loading: boolean) =>
        set({ isLoading: loading }),

      reset: () => set(INITIAL_STATE),
    }),
    {
      name: 'region-store',
      partialize: (state) => ({
        selectedRegionId: state.selectedRegionId,
        regions: state.regions,
      }),
    }
  )
);
