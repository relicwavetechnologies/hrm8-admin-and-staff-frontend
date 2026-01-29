import { FilterPreset } from '@/shared/types/filterPreset';

const FILTER_PRESETS_KEY = 'filter_presets';

export function getFilterPresets(): FilterPreset[] {
  const stored = localStorage.getItem(FILTER_PRESETS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function getFilterPreset(id: string): FilterPreset | undefined {
  const presets = getFilterPresets();
  return presets.find(preset => preset.id === id);
}

export function saveFilterPreset(preset: FilterPreset): void {
  const presets = getFilterPresets();
  const index = presets.findIndex(p => p.id === preset.id);
  
  if (index >= 0) {
    presets[index] = preset;
  } else {
    presets.push(preset);
  }
  
  localStorage.setItem(FILTER_PRESETS_KEY, JSON.stringify(presets));
}

export function deleteFilterPreset(id: string): void {
  const presets = getFilterPresets();
  const filtered = presets.filter(preset => preset.id !== id);
  localStorage.setItem(FILTER_PRESETS_KEY, JSON.stringify(filtered));
}

export function getDefaultPreset(): FilterPreset | undefined {
  const presets = getFilterPresets();
  return presets.find(preset => preset.isDefault);
}

export function setDefaultPreset(id: string): void {
  const presets = getFilterPresets();
  presets.forEach(preset => {
    preset.isDefault = preset.id === id;
  });
  localStorage.setItem(FILTER_PRESETS_KEY, JSON.stringify(presets));
}
