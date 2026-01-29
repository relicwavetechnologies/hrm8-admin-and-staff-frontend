export type AdvancedAggregateFunction =
  | "median"
  | "mode"
  | "stddev"
  | "variance"
  | "percentile"
  | "distinct"
  | "first"
  | "last";

export function calculateAdvancedAggregate(
  values: number[],
  type: AdvancedAggregateFunction,
  percentile?: number
): number {
  if (values.length === 0) return 0;

  const validValues = values.filter((v) => typeof v === "number" && !isNaN(v));
  if (validValues.length === 0) return 0;

  switch (type) {
    case "median": {
      const sorted = [...validValues].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
    }

    case "mode": {
      const frequency = new Map<number, number>();
      validValues.forEach((v) => frequency.set(v, (frequency.get(v) || 0) + 1));
      let maxFreq = 0;
      let mode = validValues[0];
      frequency.forEach((freq, value) => {
        if (freq > maxFreq) {
          maxFreq = freq;
          mode = value;
        }
      });
      return mode;
    }

    case "stddev": {
      const mean = validValues.reduce((sum, v) => sum + v, 0) / validValues.length;
      const squaredDiffs = validValues.map((v) => Math.pow(v - mean, 2));
      const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / validValues.length;
      return Math.sqrt(variance);
    }

    case "variance": {
      const mean = validValues.reduce((sum, v) => sum + v, 0) / validValues.length;
      const squaredDiffs = validValues.map((v) => Math.pow(v - mean, 2));
      return squaredDiffs.reduce((sum, v) => sum + v, 0) / validValues.length;
    }

    case "percentile": {
      const sorted = [...validValues].sort((a, b) => a - b);
      const p = (percentile || 50) / 100;
      const index = p * (sorted.length - 1);
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      const weight = index - lower;
      return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    }

    case "distinct": {
      return new Set(validValues).size;
    }

    case "first": {
      return validValues[0];
    }

    case "last": {
      return validValues[validValues.length - 1];
    }

    default:
      return 0;
  }
}

export const ADVANCED_AGGREGATION_OPTIONS = [
  { value: "median", label: "Median" },
  { value: "mode", label: "Mode" },
  { value: "stddev", label: "Standard Deviation" },
  { value: "variance", label: "Variance" },
  { value: "percentile", label: "Percentile (50th)" },
  { value: "distinct", label: "Distinct Count" },
  { value: "first", label: "First Value" },
  { value: "last", label: "Last Value" },
];
