/**
 * Comprehensive Timezone Utilities
 * Provides all IANA timezones with proper formatting and grouping
 */

import { fromZonedTime, toZonedTime, format } from 'date-fns-tz';

export interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
  region: string;
  country?: string;
}

/**
 * Get all IANA timezones grouped by region
 */
export function getAllTimezones(): TimezoneOption[] {
  // Use Intl.supportedValuesOf for modern browsers to get ALL available timezones
  let timezones: string[] = [];

  try {
    if (typeof Intl !== 'undefined' && (Intl as any).supportedValuesOf) {
      // Get all 418+ supported timezones from the browser
      timezones = (Intl as any).supportedValuesOf('timeZone');
      console.log(`[timezones] Loaded ${timezones.length} timezones from Intl.supportedValuesOf`);
    } else {
      // Fallback: comprehensive list of major timezones
      console.warn('Intl.supportedValuesOf not available, using fallback list');
      timezones = getComprehensiveTimezoneList();
    }
  } catch (error) {
    console.warn('Intl.supportedValuesOf error, using fallback list:', error);
    timezones = getComprehensiveTimezoneList();
  }

  const now = new Date();
  const timezoneOptions: TimezoneOption[] = timezones.map(tz => {
    try {
      const formatter = new Intl.DateTimeFormat('en', {
        timeZone: tz,
        timeZoneName: 'longOffset',
      });

      const parts = formatter.formatToParts(now);
      const offsetPart = parts.find(p => p.type === 'timeZoneName');
      const offset = offsetPart?.value || '';

      // Extract region and label
      const parts2 = tz.split('/');
      const region = parts2[0] || 'Other';
      const label = parts2.slice(1).join(' - ').replace(/_/g, ' ') || parts2[0];

      return {
        value: tz,
        label: `${label} (${getTimezoneAbbr(tz)})`,
        offset: formatOffset(offset),
        region,
      };
    } catch (error) {
      return {
        value: tz,
        label: tz.replace(/_/g, ' '),
        offset: '',
        region: tz.split('/')[0] || 'Other',
      };
    }
  });

  // Sort by region then label
  return timezoneOptions.sort((a, b) => {
    if (a.region !== b.region) {
      return a.region.localeCompare(b.region);
    }
    return a.label.localeCompare(b.label);
  });
}

/**
 * Get comprehensive timezone list (fallback)
 */
function getComprehensiveTimezoneList(): string[] {
  return [
    // Americas
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Phoenix',
    'America/Anchorage',
    'America/Honolulu',
    'America/Toronto',
    'America/Vancouver',
    'America/Mexico_City',
    'America/Sao_Paulo',
    'America/Buenos_Aires',
    'America/Lima',
    'America/Bogota',
    'America/Santiago',
    'America/Montevideo',

    // Europe
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Rome',
    'Europe/Madrid',
    'Europe/Amsterdam',
    'Europe/Stockholm',
    'Europe/Copenhagen',
    'Europe/Vienna',
    'Europe/Zurich',
    'Europe/Athens',
    'Europe/Warsaw',
    'Europe/Prague',
    'Europe/Budapest',
    'Europe/Dublin',
    'Europe/Lisbon',
    'Europe/Helsinki',
    'Europe/Oslo',
    'Europe/Stockholm',
    'Europe/Moscow',
    'Europe/Istanbul',

    // Asia
    'Asia/Dubai',
    'Asia/Karachi',
    'Asia/Dhaka',
    'Asia/Kolkata',
    'Asia/Colombo',
    'Asia/Kathmandu',
    'Asia/Dhaka',
    'Asia/Yangon',
    'Asia/Bangkok',
    'Asia/Ho_Chi_Minh',
    'Asia/Singapore',
    'Asia/Kuala_Lumpur',
    'Asia/Jakarta',
    'Asia/Manila',
    'Asia/Shanghai',
    'Asia/Hong_Kong',
    'Asia/Taipei',
    'Asia/Tokyo',
    'Asia/Seoul',
    'Asia/Almaty',
    'Asia/Tashkent',
    'Asia/Baku',
    'Asia/Tehran',
    'Asia/Baghdad',
    'Asia/Riyadh',
    'Asia/Jerusalem',

    // Pacific
    'Australia/Sydney',
    'Australia/Melbourne',
    'Australia/Brisbane',
    'Australia/Perth',
    'Australia/Adelaide',
    'Australia/Darwin',
    'Australia/Hobart',
    'Pacific/Auckland',
    'Pacific/Fiji',
    'Pacific/Honolulu',
    'Pacific/Guam',

    // Africa
    'Africa/Cairo',
    'Africa/Johannesburg',
    'Africa/Lagos',
    'Africa/Nairobi',
    'Africa/Casablanca',

    // UTC
    'UTC',
  ];
}

/**
 * Get timezone abbreviation
 */
function getTimezoneAbbr(timezone: string): string {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      timeZoneName: 'short',
    });

    const parts = formatter.formatToParts(now);
    const tzNamePart = parts.find(p => p.type === 'timeZoneName');
    return tzNamePart?.value || timezone.split('/').pop()?.slice(0, 3).toUpperCase() || 'UTC';
  } catch {
    return 'UTC';
  }
}

/**
 * Format offset string
 */
function formatOffset(offset: string): string {
  if (!offset) return '';

  // Extract GMT offset
  const match = offset.match(/GMT([+-]\d{1,2}):?(\d{2})?/);
  if (match) {
    const sign = match[1].charAt(0);
    const hours = parseInt(match[1].slice(1)) || 0;
    const minutes = parseInt(match[2] || '0');

    if (hours === 0 && minutes === 0) {
      return 'UTC';
    }

    return `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  return offset;
}

/**
 * Get timezones grouped by region
 */
export function getTimezonesByRegion(): Record<string, TimezoneOption[]> {
  const allTimezones = getAllTimezones();
  const grouped: Record<string, TimezoneOption[]> = {};

  allTimezones.forEach(tz => {
    if (!grouped[tz.region]) {
      grouped[tz.region] = [];
    }
    grouped[tz.region].push(tz);
  });

  return grouped;
}

/**
 * Convert date to specific timezone
 */
export function convertToTimezone(date: Date, timezone: string): Date {
  return toZonedTime(date, timezone);
}

/**
 * Convert from timezone to UTC
 */
export function convertFromTimezone(date: Date, timezone: string): Date {
  return fromZonedTime(date, timezone);
}

/**
 * Format date in specific timezone
 */
export function formatInTimezone(
  date: Date,
  formatStr: string,
  timezone: string
): string {
  return format(toZonedTime(date, timezone), formatStr, { timeZone: timezone });
}

/**
 * Get current time in timezone
 */
export function getCurrentTimeInTimezone(timezone: string): string {
  const now = new Date();
  return formatInTimezone(now, 'yyyy-MM-dd HH:mm:ss', timezone);
}

/**
 * Get timezone offset in minutes
 */
export function getTimezoneOffset(timezone: string): number {
  const now = new Date();
  const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  return (tzDate.getTime() - utcDate.getTime()) / (1000 * 60);
}

