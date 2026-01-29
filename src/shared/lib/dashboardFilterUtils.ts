import { isWithinInterval } from "date-fns";
import type { DateRange } from "react-day-picker";
import { getRegionForCountry, getCountriesInRegion } from "./countryRegions";

export const filterByDateRange = <T extends Record<string, any>>(
  data: T[],
  dateRange: DateRange | undefined,
  monthKey: keyof T
): T[] => {
  if (!dateRange?.from) return data;

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return data.filter((item) => {
    const monthValue = item[monthKey] as string;
    const monthIndex = monthNames.indexOf(monthValue);
    if (monthIndex === -1) return true; // Keep items with invalid months
    
    const itemDate = new Date(2024, monthIndex, 1);
    return isWithinInterval(itemDate, {
      start: dateRange.from!,
      end: dateRange.to || dateRange.from!,
    });
  });
};

export const filterByProperty = <T extends Record<string, any>>(
  data: T[],
  filterValue: string,
  propertyKey: keyof T
): T[] => {
  if (filterValue === "all") return data;
  return data.filter(item => item[propertyKey] === filterValue);
};

export const filterByLocation = <T extends Record<string, any>>(
  data: T[],
  country: string,
  region: string,
  locationKey: keyof T
): T[] => {
  // If no filters applied, return all data
  if (country === "all" && region === "all") return data;

  return data.filter((item) => {
    const itemLocation = item[locationKey] as string;
    if (!itemLocation) return true; // Keep items without location
    
    // Extract country from location (handles formats like "New York, United States")
    const locationParts = itemLocation.split(',').map(p => p.trim());
    const itemCountry = locationParts[locationParts.length - 1];
    
    // Check country filter
    if (country !== "all" && itemCountry !== country) {
      return false;
    }
    
    // Check region filter
    if (region !== "all") {
      const itemRegion = getRegionForCountry(itemCountry);
      if (itemRegion !== region) {
        return false;
      }
    }
    
    return true;
  });
};

export const filterByCountry = <T extends Record<string, any>>(
  data: T[],
  country: string,
  countryKey: keyof T
): T[] => {
  if (country === "all") return data;
  return data.filter(item => {
    const itemCountry = item[countryKey] as string;
    return itemCountry === country;
  });
};

export const filterByRegion = <T extends Record<string, any>>(
  data: T[],
  region: string,
  countryKey: keyof T
): T[] => {
  if (region === "all") return data;
  
  const countriesInRegion = getCountriesInRegion(region as any);
  return data.filter(item => {
    const itemCountry = item[countryKey] as string;
    return countriesInRegion.includes(itemCountry);
  });
};

export const applyAllFilters = <T extends Record<string, any>>(
  data: T[],
  filters: {
    dateRange?: DateRange;
    country?: string;
    region?: string;
    dateKey?: keyof T;
    locationKey?: keyof T;
    countryKey?: keyof T;
  }
): T[] => {
  let filteredData = data;

  // Apply date filter
  if (filters.dateRange?.from && filters.dateKey) {
    filteredData = filterByDateRange(filteredData, filters.dateRange, filters.dateKey);
  }

  // Apply location filters
  if (filters.locationKey && (filters.country !== "all" || filters.region !== "all")) {
    filteredData = filterByLocation(
      filteredData,
      filters.country || "all",
      filters.region || "all",
      filters.locationKey
    );
  } else if (filters.countryKey) {
    // Apply country filter
    if (filters.country && filters.country !== "all") {
      filteredData = filterByCountry(filteredData, filters.country, filters.countryKey);
    }
    
    // Apply region filter
    if (filters.region && filters.region !== "all") {
      filteredData = filterByRegion(filteredData, filters.region, filters.countryKey);
    }
  }

  return filteredData;
};
