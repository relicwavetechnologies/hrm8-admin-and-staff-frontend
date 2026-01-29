// Helper functions to simulate location-based filtering on aggregate data
// In a real application, this would query actual location-specific data

export interface LocationData {
  country: string;
  region: string;
}

// Simulate filtering by reducing totals based on typical geographic distribution
export const applyLocationFilterToMetric = (
  value: number,
  country: string,
  region: string
): number => {
  // If no filters, return full value
  if (country === "all" && region === "all") return value;

  // Typical geographic distribution percentages (simulate real data)
  const countryDistribution: Record<string, number> = {
    "United States": 0.35,
    "United Kingdom": 0.15,
    "Canada": 0.10,
    "Germany": 0.08,
    "France": 0.07,
    "India": 0.06,
    "Australia": 0.05,
    "Singapore": 0.04,
    "Netherlands": 0.03,
    "Spain": 0.02,
    "Italy": 0.02,
    "Brazil": 0.015,
    "Mexico": 0.01,
    "Japan": 0.005,
    "China": 0.005,
  };

  const regionDistribution: Record<string, number> = {
    "Americas": 0.56,
    "Europe": 0.30,
    "APAC": 0.10,
    "Middle East & Africa": 0.04,
  };

  // Apply country filter
  if (country !== "all") {
    const percentage = countryDistribution[country] || 0.05;
    return Math.round(value * percentage);
  }

  // Apply region filter
  if (region !== "all") {
    const percentage = regionDistribution[region] || 0.25;
    return Math.round(value * percentage);
  }

  return value;
};

// Apply location filtering to time series data
export const applyLocationFilterToTimeSeries = <T extends Record<string, any>>(
  data: T[],
  country: string,
  region: string,
  numericKeys: (keyof T)[]
): T[] => {
  if (country === "all" && region === "all") return data;

  return data.map(item => {
    const filtered = { ...item };
    numericKeys.forEach(key => {
      if (typeof item[key] === 'number') {
        const filteredValue = applyLocationFilterToMetric(
          item[key] as number,
          country,
          region
        );
        (filtered as any)[key] = filteredValue;
      }
    });
    return filtered;
  });
};

// Employee/client data with explicit locations
export const employeesByLocation = [
  { location: "New York, United States", count: 85, department: "Engineering" },
  { location: "San Francisco, United States", count: 60, department: "Engineering" },
  { location: "London, United Kingdom", count: 45, department: "Sales" },
  { location: "Berlin, Germany", count: 32, department: "Engineering" },
  { location: "Toronto, Canada", count: 28, department: "Marketing" },
  { location: "Paris, France", count: 25, department: "Sales" },
  { location: "Sydney, Australia", count: 20, department: "Operations" },
  { location: "Singapore, Singapore", count: 18, department: "Finance" },
  { location: "Mumbai, India", count: 22, department: "Engineering" },
  { location: "Amsterdam, Netherlands", count: 15, department: "Marketing" },
];

export const clientsByLocation = [
  { location: "United States", count: 37, industry: "Technology" },
  { location: "United Kingdom", count: 16, industry: "Finance" },
  { location: "Canada", count: 11, industry: "Healthcare" },
  { location: "Germany", count: 9, industry: "Manufacturing" },
  { location: "France", count: 8, industry: "Retail" },
  { location: "Australia", count: 6, industry: "Technology" },
  { location: "India", count: 7, industry: "Technology" },
  { location: "Singapore", count: 5, industry: "Finance" },
  { location: "Netherlands", count: 3, industry: "Healthcare" },
  { location: "Spain", count: 3, industry: "Retail" },
];

export const projectsByLocation = [
  { location: "United States", active: 18, completed: 25 },
  { location: "United Kingdom", active: 8, completed: 12 },
  { location: "Canada", active: 6, completed: 5 },
  { location: "Germany", active: 4, completed: 8 },
  { location: "France", active: 3, completed: 6 },
  { location: "Australia", active: 2, completed: 4 },
  { location: "India", active: 3, completed: 3 },
];

// Helper to get total by location filter
export const getTotalByLocationFilter = (
  data: Array<{ location: string; count?: number; active?: number }>,
  country: string,
  region: string,
  valueKey: 'count' | 'active' = 'count'
): number => {
  if (country === "all" && region === "all") {
    return data.reduce((sum, item) => sum + (item[valueKey] || 0), 0);
  }

  // Filter by country
  if (country !== "all") {
    return data
      .filter(item => item.location.includes(country))
      .reduce((sum, item) => sum + (item[valueKey] || 0), 0);
  }

  // Filter by region (simplified - would need proper region mapping)
  const regionCountries: Record<string, string[]> = {
    "Americas": ["United States", "Canada", "Brazil", "Mexico"],
    "Europe": ["United Kingdom", "Germany", "France", "Spain", "Netherlands", "Italy"],
    "APAC": ["Australia", "Singapore", "India", "China", "Japan"],
    "Middle East & Africa": [],
  };

  if (region !== "all" && regionCountries[region]) {
    return data
      .filter(item => 
        regionCountries[region].some(country => item.location.includes(country))
      )
      .reduce((sum, item) => sum + (item[valueKey] || 0), 0);
  }

  return data.reduce((sum, item) => sum + (item[valueKey] || 0), 0);
};
