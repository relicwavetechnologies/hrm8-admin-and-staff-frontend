/**
 * Location utility functions for standardized location formatting
 */

/**
 * Parse location string into components
 * @param location - e.g., "San Francisco, CA" or "Remote"
 * @returns { city, state, isRemote }
 */
export function parseLocation(location: string) {
  if (location.toLowerCase() === 'remote') {
    return { city: null, state: null, isRemote: true };
  }

  const parts = location.split(',').map(p => p.trim());
  return {
    city: parts[0] || null,
    state: parts[1] || null,
    isRemote: false
  };
}

/**
 * Format location for display
 * @param city - City name
 * @param state - State abbreviation or province
 * @param country - Country name (optional)
 * @returns Formatted location string
 */
export function formatLocation(city?: string, state?: string): string {
  if (!city && !state) return '—';

  const location = state ? `${city}, ${state}` : city;
  return location || '—';
}

/**
 * Create location string from components
 * @param city - City name
 * @param state - State abbreviation or province
 * @returns Location string in "City, State" format
 */
export function createLocationString(city?: string, state?: string): string {
  if (!city) return '';
  return state ? `${city}, ${state}` : city;
}

/**
 * Infer country from US state abbreviation or location string
 * @param location - Location string (e.g., "San Francisco, CA")
 * @returns Country name or undefined
 */
export function inferCountryFromLocation(location: string): string | undefined {
  const usStates = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  if (location.toLowerCase() === 'remote') return undefined;

  const parts = location.split(',').map(p => p.trim());
  const state = parts[1];

  if (state && usStates.includes(state)) {
    return 'United States';
  }

  // Check for UK cities
  if (location.includes('UK') || location.includes('United Kingdom')) {
    return 'United Kingdom';
  }

  // Check for Australian states
  const australianStates = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];
  if (state && australianStates.includes(state)) {
    return 'Australia';
  }

  // Check for Canadian provinces
  const canadianProvinces = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'];
  if (state && canadianProvinces.includes(state)) {
    return 'Canada';
  }

  return undefined;
}
