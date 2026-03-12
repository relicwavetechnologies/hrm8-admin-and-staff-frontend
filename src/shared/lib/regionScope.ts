export function isAllRegionsSelected(selectedRegionId?: string | null): boolean {
  return !selectedRegionId || selectedRegionId === 'all';
}

export function getScopedRegionId(selectedRegionId?: string | null): string | undefined {
  return isAllRegionsSelected(selectedRegionId) ? undefined : selectedRegionId ?? undefined;
}
