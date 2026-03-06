/**
 * Client-side feature flags – defaults are `true` (on) for testing.
 * Set VITE_FF_*=false in .env to disable individually.
 */

const bool = (key: string, fallback = true): boolean => {
  const raw = (import.meta.env as Record<string, string | undefined>)[key];
  if (raw === undefined) return fallback;
  return raw === '1' || raw.toLowerCase() === 'true';
};

export const FeatureFlags = {
  FF_MANAGED_CHECKOUT_V2: bool('VITE_FF_MANAGED_CHECKOUT_V2'),
  FF_COMPANY_360: bool('VITE_FF_COMPANY_360'),
  FF_COUNTRY_MAP_UI: bool('VITE_FF_COUNTRY_MAP_UI'),
  FF_STRIPE_LABEL_CLEANUP: bool('VITE_FF_STRIPE_LABEL_CLEANUP'),
  FF_INTENT_SNAPSHOT_STRICT: bool('VITE_FF_INTENT_SNAPSHOT_STRICT'),
} as const;

export type FeatureFlagKey = keyof typeof FeatureFlags;

export const isFeatureEnabled = (key: FeatureFlagKey): boolean => FeatureFlags[key];
