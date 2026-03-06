// Copied from Mosaic Next utils
export const formatValue = (value: number): string => Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumSignificantDigits: 3,
  notation: 'compact',
}).format(value)

export const formatThousands = (value: number): string => Intl.NumberFormat('en-US', {
  maximumSignificantDigits: 3,
  notation: 'compact',
}).format(value)

export const getCssVariable = (variable: string): string => {
  if (typeof window === 'undefined') {
    return '';
  }
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
};

// Convert raw HSL values (e.g., "248 100% 72%") to proper hsl() format
export const rawHslToHsl = (rawValue: string): string => {
  if (!rawValue || rawValue.trim() === '') {
    return 'transparent';
  }
  // If already in hsl() format, return as-is
  if (rawValue.startsWith('hsl')) {
    return rawValue;
  }
  // Parse raw HSL value and convert to proper format with commas
  const match = rawValue.trim().match(/^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?%)\s+(\d+(?:\.\d+)?%)$/);
  if (match) {
    return `hsl(${match[1]}, ${match[2]}, ${match[3]})`;
  }
  // Return original value if not parseable
  return rawValue;
};

const adjustHexOpacity = (hexColor: string, opacity: number): string => {
  // Remove the '#' if it exists
  hexColor = hexColor.replace('#', '');

  // Convert hex to RGB
  const r = parseInt(hexColor.substring(0, 2), 16);
  const g = parseInt(hexColor.substring(2, 4), 16);
  const b = parseInt(hexColor.substring(4, 6), 16);

  // Return RGBA string
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const adjustHSLOpacity = (hslColor: string, opacity: number): string => {
  // Handle raw HSL values (e.g., "248 100% 72%")
  if (!hslColor.includes('hsl(')) {
    const values = hslColor.trim().split(/\s+/);
    if (values.length === 3) {
      return `hsla(${values[0]}, ${values[1]}, ${values[2]}, ${opacity})`;
    }
  }

  // Extract HSL values from hsl(...) or hsla(...) format
  const match = hslColor.match(/hsla?\((.*?)\)/);
  if (match) {
    const values = match[1].split(/[\s,]+/).filter(v => v && v !== '/');
    if (values.length >= 3) {
      // Ensure we have exactly 3 values (h, s, l) with proper formatting
      return `hsla(${values[0]}, ${values[1]}, ${values[2]}, ${opacity})`;
    }
  }

  // Fallback: simple replacement (for comma-separated HSL)
  return hslColor.replace('hsl(', 'hsla(').replace(')', `, ${opacity})`);
};

const adjustOKLCHOpacity = (oklchColor: string, opacity: number): string => {
  // Add alpha value to OKLCH color
  return oklchColor.replace(/oklch\((.*?)\)/, (_match, p1) => `oklch(${p1} / ${opacity})`);
};

export const adjustColorOpacity = (color: string, opacity: number): string => {
  if (!color || color.trim() === '') {
    return 'transparent';
  }

  if (color.startsWith('#')) {
    return adjustHexOpacity(color, opacity);
  } else if (color.startsWith('hsl')) {
    return adjustHSLOpacity(color, opacity);
  } else if (color.startsWith('oklch')) {
    return adjustOKLCHOpacity(color, opacity);
  } else {
    // Check if it's a raw HSL value (e.g., "248 100% 72%" from CSS variables)
    const rawHslMatch = color.trim().match(/^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?%)\s+(\d+(?:\.\d+)?%)$/);
    if (rawHslMatch) {
      return `hsla(${rawHslMatch[1]}, ${rawHslMatch[2]}, ${rawHslMatch[3]}, ${opacity})`;
    }
    // Return transparent as fallback
    return 'transparent';
  }
};

export const oklchToRGBA = (oklchColor: string): string => {
  // Create a temporary div to use for color conversion
  const tempDiv = document.createElement('div');
  tempDiv.style.color = oklchColor;
  document.body.appendChild(tempDiv);

  // Get the computed style and convert to RGB
  const computedColor = window.getComputedStyle(tempDiv).color;
  document.body.removeChild(tempDiv);

  return computedColor;
};
