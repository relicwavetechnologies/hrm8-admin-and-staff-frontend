import { Job } from "@/shared/types/job";

export interface JobAnalytics {
  totalViews: number;
  totalApplications: number;
  conversionRate: number;
  timeToHire: number;
  costPerHire: number;
  qualityScore: number;
}

export interface ApplicationFunnel {
  views: number;
  applications: number;
  screenings: number;
  interviews: number;
  offers: number;
  hired: number;
}

export interface SourceEffectiveness {
  source: string;
  applications: number;
  quality: number;
  hires: number;
  costPerHire: number;
}

export interface GeographicData {
  country: string;
  applications: number;
  percentage: number;
}

export interface TimeSeriesData {
  date: string;
  views: number;
  applications: number;
}

// Mock data generators
export function getJobAnalytics(jobId: string): JobAnalytics {
  return {
    totalViews: Math.floor(Math.random() * 5000) + 1000,
    totalApplications: Math.floor(Math.random() * 500) + 50,
    conversionRate: Math.random() * 15 + 5,
    timeToHire: Math.floor(Math.random() * 30) + 15,
    costPerHire: Math.floor(Math.random() * 3000) + 1000,
    qualityScore: Math.random() * 30 + 70,
  };
}

export function getApplicationFunnel(jobId: string): ApplicationFunnel {
  const base = Math.floor(Math.random() * 3000) + 1000;
  return {
    views: base,
    applications: Math.floor(base * 0.15),
    screenings: Math.floor(base * 0.10),
    interviews: Math.floor(base * 0.05),
    offers: Math.floor(base * 0.02),
    hired: Math.floor(base * 0.01),
  };
}

export function getSourceEffectiveness(jobId: string): SourceEffectiveness[] {
  return [
    { source: "HRM8 Job Board", applications: 234, quality: 85, hires: 12, costPerHire: 1200 },
    { source: "LinkedIn", applications: 189, quality: 92, hires: 15, costPerHire: 1800 },
    { source: "Indeed", applications: 456, quality: 68, hires: 8, costPerHire: 950 },
    { source: "Glassdoor", applications: 123, quality: 78, hires: 5, costPerHire: 1100 },
    { source: "Company Website", applications: 89, quality: 88, hires: 7, costPerHire: 500 },
  ];
}

export function getGeographicData(jobId: string): GeographicData[] {
  return [
    { country: "United States", applications: 345, percentage: 45 },
    { country: "United Kingdom", applications: 198, percentage: 26 },
    { country: "Canada", applications: 123, percentage: 16 },
    { country: "Australia", applications: 67, percentage: 9 },
    { country: "Others", applications: 34, percentage: 4 },
  ];
}

export function getTimeSeriesData(jobId: string, days: number = 30): TimeSeriesData[] {
  const data: TimeSeriesData[] = [];
  const today = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      views: Math.floor(Math.random() * 200) + 50,
      applications: Math.floor(Math.random() * 30) + 5,
    });
  }
  
  return data;
}

export function getBenchmarkData(jobId: string) {
  return {
    companyAverage: {
      timeToHire: 28,
      applicationsPerJob: 150,
      conversionRate: 8.5,
    },
    industryAverage: {
      timeToHire: 35,
      applicationsPerJob: 180,
      conversionRate: 7.2,
    },
  };
}
