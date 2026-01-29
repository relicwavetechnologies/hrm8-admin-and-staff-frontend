import { subMonths, format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

export interface TrendDataPoint {
    name: string;
    value: number;
    secondary?: number;
    date?: Date;
}

export interface TrendConfig {
    baseValue: number;
    currentValue: number;
    dataPoints?: number;
    growthRate?: number; // Percentage growth per period
    volatility?: number; // 0-1, how much random variation
    seasonality?: boolean; // Add seasonal patterns
    trend?: 'up' | 'down' | 'stable';
}

/**
 * Generates realistic trend data for stat cards
 * Creates time-series data with growth, volatility, and optional seasonality
 */
export function generateRealisticTrend(config: TrendConfig): TrendDataPoint[] {
    const {
        baseValue,
        currentValue,
        dataPoints = 12,
        growthRate = 0,
        volatility = 0.05,
        seasonality = false,
        trend = 'stable'
    } = config;

    const data: TrendDataPoint[] = [];
    const now = new Date();

    // Calculate the actual growth rate from base to current
    const actualGrowthRate = ((currentValue - baseValue) / baseValue) / dataPoints;

    for (let i = 0; i < dataPoints; i++) {
        const date = subMonths(now, dataPoints - 1 - i);
        const progress = i / (dataPoints - 1);

        // Base progression from baseValue to currentValue
        let value = baseValue + (currentValue - baseValue) * progress;

        // Add growth curve (exponential for 'up', inverse for 'down')
        if (trend === 'up') {
            value = baseValue + (currentValue - baseValue) * Math.pow(progress, 0.8);
        } else if (trend === 'down') {
            value = currentValue + (baseValue - currentValue) * Math.pow(1 - progress, 0.8);
        }

        // Add seasonality (higher in certain months)
        if (seasonality) {
            const month = date.getMonth();
            // Q4 (Oct, Nov, Dec) typically higher, Q1 (Jan, Feb, Mar) lower
            const seasonalFactor = 1 + (Math.sin((month - 2) * Math.PI / 6) * 0.1);
            value *= seasonalFactor;
        }

        // Add realistic volatility (random fluctuation)
        const randomFactor = 1 + (Math.random() - 0.5) * volatility * 2;
        value *= randomFactor;

        // Secondary value (comparison, e.g., previous period)
        const secondary = value * (0.85 + Math.random() * 0.1);

        data.push({
            name: format(date, 'MMM'),
            value: Math.round(value),
            secondary: Math.round(secondary),
            date
        });
    }

    // Ensure the last value matches currentValue (with small variance)
    if (data.length > 0) {
        data[data.length - 1].value = Math.round(currentValue * (0.98 + Math.random() * 0.04));
    }

    return data;
}

/**
 * Generates daily trend data for more granular charts
 */
export function generateDailyTrend(config: TrendConfig & { days?: number }): TrendDataPoint[] {
    const {
        baseValue,
        currentValue,
        days = 30,
        volatility = 0.03,
        trend = 'stable'
    } = config;

    const data: TrendDataPoint[] = [];
    const now = new Date();
    const startDate = subMonths(now, 1);
    const dates = eachDayOfInterval({ start: startDate, end: now }).slice(0, days);

    dates.forEach((date, i) => {
        const progress = i / (days - 1);

        let value = baseValue + (currentValue - baseValue) * progress;

        if (trend === 'up') {
            value = baseValue + (currentValue - baseValue) * Math.pow(progress, 0.9);
        } else if (trend === 'down') {
            value = currentValue + (baseValue - currentValue) * Math.pow(1 - progress, 0.9);
        }

        // Add day-of-week patterns (weekends typically lower)
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            value *= 0.7; // Weekend dip
        }

        // Add volatility
        const randomFactor = 1 + (Math.random() - 0.5) * volatility * 2;
        value *= randomFactor;

        data.push({
            name: format(date, 'd'),
            value: Math.round(value),
            date
        });
    });

    return data;
}

/**
 * Generates percentage-based trend (e.g., uptime, satisfaction)
 */
export function generatePercentageTrend(config: {
    baseValue: number; // 0-100
    currentValue: number; // 0-100
    dataPoints?: number;
    volatility?: number;
    targetRange?: [number, number]; // Min/max acceptable range
}): TrendDataPoint[] {
    const {
        baseValue,
        currentValue,
        dataPoints = 12,
        volatility = 0.01,
        targetRange = [95, 100]
    } = config;

    const data: TrendDataPoint[] = [];
    const now = new Date();

    for (let i = 0; i < dataPoints; i++) {
        const date = subMonths(now, dataPoints - 1 - i);
        const progress = i / (dataPoints - 1);

        let value = baseValue + (currentValue - baseValue) * progress;

        // Keep within target range with small fluctuations
        const randomFactor = 1 + (Math.random() - 0.5) * volatility * 2;
        value *= randomFactor;

        // Clamp to 0-100
        value = Math.max(0, Math.min(100, value));

        data.push({
            name: format(date, 'MMM'),
            value: parseFloat(value.toFixed(2)),
            date
        });
    }

    return data;
}

/**
 * Calculate growth percentage between first and last data points
 */
export function calculateGrowth(data: TrendDataPoint[]): number {
    if (data.length < 2) return 0;

    const first = data[0].value;
    const last = data[data.length - 1].value;

    return parseFloat((((last - first) / first) * 100).toFixed(1));
}

/**
 * Get trend direction from data
 */
export function getTrendDirection(data: TrendDataPoint[]): 'up' | 'down' | 'stable' {
    if (data.length < 2) return 'stable';

    const growth = calculateGrowth(data);

    if (growth > 2) return 'up';
    if (growth < -2) return 'down';
    return 'stable';
}
