/**
 * Territory types for geographic account assignment
 */

export interface Territory {
  id: string;
  name: string;
  region: string; // North America, EMEA, APAC, LATAM
  countries: string[];
  states?: string[]; // For US/Canada territories
  description?: string;
  salesRepId?: string;
  salesRepName?: string;
  createdAt: Date;
}

export interface TerritoryAssignment {
  id: string;
  employerId: string;
  territoryId: string;
  territoryName: string;
  assignedBy: string;
  assignedByName: string;
  assignedAt: Date;
  effectiveDate: Date;
  notes?: string;
}
