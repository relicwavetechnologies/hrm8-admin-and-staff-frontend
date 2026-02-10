// Import Chart.js - Copied from Mosaic Next
import { Chart, Tooltip } from 'chart.js'
import { adjustColorOpacity, getCssVariable } from '@/shared/lib/chart-utils'

Chart.register(Tooltip)

// Define Chart.js default settings
Chart.defaults.font.family = '"Inter", sans-serif'
Chart.defaults.font.weight = 500
Chart.defaults.plugins.tooltip.borderWidth = 1
Chart.defaults.plugins.tooltip.displayColors = false
Chart.defaults.plugins.tooltip.mode = 'nearest'
Chart.defaults.plugins.tooltip.intersect = false
Chart.defaults.plugins.tooltip.position = 'nearest'
Chart.defaults.plugins.tooltip.caretSize = 0
Chart.defaults.plugins.tooltip.caretPadding = 20
Chart.defaults.plugins.tooltip.cornerRadius = 8
Chart.defaults.plugins.tooltip.padding = 8

interface ChartArea {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface ColorStop {
  stop: number;
  color: string;
}

// Function that generates a gradient for line charts
export const chartAreaGradient = (
  ctx: CanvasRenderingContext2D | null,
  chartArea: ChartArea | null,
  colorStops: ColorStop[] | null
): CanvasGradient | string | null => {
  if (!ctx || !chartArea || !colorStops || colorStops.length === 0) {
    return 'transparent';
  }
  const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
  colorStops.forEach(({ stop, color }) => {
    gradient.addColorStop(stop, color);
  });
  return gradient;
};

// Lazy-initialized chart colors to ensure DOM is ready
export const chartColors = {
  get textColor() {
    return {
      light: getCssVariable('--gray-400') || 'hsl(240 5% 65%)',
      dark: getCssVariable('--gray-500') || 'hsl(240 5% 64%)'
    };
  },
  get gridColor() {
    return {
      light: getCssVariable('--gray-100') || 'hsl(240 5% 96%)',
      dark: adjustColorOpacity(getCssVariable('--gray-700') || 'hsl(240 4% 46%)', 0.6)
    };
  },
  get backdropColor() {
    return {
      light: 'hsl(0 0% 100%)',
      dark: getCssVariable('--gray-800') || 'hsl(240 4% 16%)'
    };
  },
  get tooltipTitleColor() {
    return {
      light: getCssVariable('--gray-800') || 'hsl(240 4% 16%)',
      dark: getCssVariable('--gray-100') || 'hsl(240 5% 96%)'
    };
  },
  get tooltipBodyColor() {
    return {
      light: getCssVariable('--gray-500') || 'hsl(240 5% 64%)',
      dark: getCssVariable('--gray-400') || 'hsl(240 5% 65%)'
    };
  },
  get tooltipBgColor() {
    return {
      light: 'hsl(0 0% 100%)',
      dark: getCssVariable('--gray-700') || 'hsl(240 4% 46%)'
    };
  },
  get tooltipBorderColor() {
    return {
      light: getCssVariable('--gray-200') || 'hsl(240 6% 90%)',
      dark: getCssVariable('--gray-600') || 'hsl(240 4% 54%)'
    };
  },
};
