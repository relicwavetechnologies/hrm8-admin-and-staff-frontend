export function applyLocationFilterToMetric(
  metric: number,
  country: string,
  region: string
): number {
  if (country !== 'all' && country) {
    // Reduce metric based on country selection
    return Math.round(metric * 0.6);
  }
  if (region !== 'all' && region) {
    // Reduce metric based on region selection
    return Math.round(metric * 0.7);
  }
  return metric;
}

export function applyLocationFilterToTimeSeries(
  data: any[],
  country: string,
  region: string
): any[] {
  if (country !== 'all' && country) {
    return data.map(item => ({
      ...item,
      total: Math.round(item.total * 0.6),
      completed: Math.round(item.completed * 0.6),
      inProgress: Math.round(item.inProgress * 0.6),
      invited: Math.round(item.invited * 0.6),
    }));
  }
  if (region !== 'all' && region) {
    return data.map(item => ({
      ...item,
      total: Math.round(item.total * 0.7),
      completed: Math.round(item.completed * 0.7),
      inProgress: Math.round(item.inProgress * 0.7),
      invited: Math.round(item.invited * 0.7),
    }));
  }
  return data;
}

export function getTotalByLocationFilter(
  baseTotal: number,
  country: string,
  region: string
): number {
  return applyLocationFilterToMetric(baseTotal, country, region);
}
