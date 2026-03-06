// Copied from Mosaic Next dashboard cards and adapted for HRM8
'use client'

import { cn } from "@/shared/lib/utils";
import LineChart01 from '@/shared/components/ui/charts/line-chart-01';
import { chartAreaGradient } from '@/shared/components/ui/charts/chartjs-config';
import { adjustColorOpacity, getCssVariable, rawHslToHsl } from '@/shared/lib/chart-utils';
import type { ChartData } from 'chart.js';

interface DashboardStatCardProps {
  title: string;
  label: string;
  value: string | number;
  trend?: {
    value: string;
    positive: boolean;
  };
  chartData?: ChartData;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function DashboardStatCard({
  title,
  label,
  value,
  trend,
  chartData,
  icon,
  onClick,
  className
}: DashboardStatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col col-span-full sm:col-span-6 xl:col-span-3 bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden",
        onClick && "cursor-pointer hover:shadow-md transition-shadow",
        className
      )}
      onClick={onClick}
    >
      <div className="px-5 pt-5">
        <header className="flex justify-between items-start mb-2">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">{title}</h2>
          {icon && (
            <div className="shrink-0 ml-2">
              {icon}
            </div>
          )}
        </header>
        <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">{label}</div>
        <div className="flex items-start">
          <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mr-2">{value}</div>
          {trend && (
            <div className={cn(
              "text-sm font-medium px-1.5 rounded-full",
              trend.positive
                ? "text-green-700 bg-green-500/20"
                : "text-red-700 bg-red-500/20"
            )}>
              {trend.positive ? '+' : ''}{trend.value}
            </div>
          )}
        </div>
      </div>
      {/* Chart built with Chart.js 3 */}
      {chartData && (
        <div className="grow max-sm:max-h-[128px] xl:max-h-[128px]">
          <LineChart01 data={chartData} width={389} height={128} />
        </div>
      )}
    </div>
  );
}

// Helper function to create chart data for dashboard cards
export function createDashboardChartData(
  dataPoints: number[],
  comparePoints?: number[],
  color: string = '--gray-400'
): ChartData {
  // Get the color value upfront
  const colorValue = getCssVariable(color) || '220 9% 69%'; // gray-400 fallback
  const colorHsl = rawHslToHsl(colorValue);

  const labels = Array.from({ length: dataPoints.length }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (dataPoints.length - 1 - i));
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  });

  const datasets: any[] = [
    {
      data: dataPoints,
      fill: true,
      backgroundColor: function (context: any) {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        const gradientOrColor = chartAreaGradient(ctx, chartArea, [
          { stop: 0, color: adjustColorOpacity(colorValue, 0) },
          { stop: 1, color: adjustColorOpacity(colorValue, 0.2) }
        ]);
        return gradientOrColor || 'transparent';
      },
      borderColor: colorHsl,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 3,
      pointBackgroundColor: colorHsl,
      pointHoverBackgroundColor: colorHsl,
      pointBorderWidth: 0,
      pointHoverBorderWidth: 0,
      clip: 20,
      tension: 0.2,
    },
  ];

  // Add comparison line if provided
  if (comparePoints) {
    datasets.push({
      data: comparePoints,
      borderColor: adjustColorOpacity(getCssVariable('--gray-500') || '220 9% 46%', 0.25),
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 3,
      pointBackgroundColor: adjustColorOpacity(getCssVariable('--gray-500') || '220 9% 46%', 0.25),
      pointHoverBackgroundColor: adjustColorOpacity(getCssVariable('--gray-500') || '220 9% 46%', 0.25),
      pointBorderWidth: 0,
      pointHoverBorderWidth: 0,
      clip: 20,
      tension: 0.2,
    });
  }

  return {
    labels,
    datasets,
  };
}
