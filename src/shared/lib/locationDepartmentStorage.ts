import { Department, Location } from "@/shared/types/entities";
import { mockEmployers } from "@/shared/data/mockTableData";

// In-memory storage for locations and departments
const employers = [...mockEmployers];

// ============= DEPARTMENTS =============

export function getEmployerDepartments(employerId: string): Department[] {
  const employer = employers.find(e => e.id === employerId);
  return employer?.departments || [];
}

export function createDepartment(employerId: string, dept: Omit<Department, 'id' | 'createdAt'>): Department {
  const newDept: Department = {
    ...dept,
    id: `dept-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
  };

  const employer = employers.find(e => e.id === employerId);
  if (employer) {
    employer.departments = [...(employer.departments || []), newDept];
  }

  return newDept;
}

export function updateDepartment(
  employerId: string,
  deptId: string,
  updates: Partial<Department>
): Department | null {
  const employer = employers.find(e => e.id === employerId);
  if (!employer || !employer.departments) return null;

  const index = employer.departments.findIndex(d => d.id === deptId);
  if (index === -1) return null;

  employer.departments[index] = {
    ...employer.departments[index],
    ...updates,
  };

  return employer.departments[index];
}

export function deleteDepartment(employerId: string, deptId: string): boolean {
  const employer = employers.find(e => e.id === employerId);
  if (!employer || !employer.departments) return false;

  const initialLength = employer.departments.length;
  employer.departments = employer.departments.filter(d => d.id !== deptId);
  return employer.departments.length < initialLength;
}

// ============= LOCATIONS =============

export function getEmployerLocations(employerId: string): Location[] {
  const employer = employers.find(e => e.id === employerId);
  return employer?.locations || [];
}

export function createLocation(employerId: string, location: Omit<Location, 'id' | 'createdAt'>): Location {
  const newLocation: Location = {
    ...location,
    id: `loc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
  };

  const employer = employers.find(e => e.id === employerId);
  if (employer) {
    // If this is set as primary, unset all other primary locations
    if (newLocation.isPrimary && employer.locations) {
      employer.locations = employer.locations.map(loc => ({ ...loc, isPrimary: false }));
    }
    employer.locations = [...(employer.locations || []), newLocation];
  }

  return newLocation;
}

export function updateLocation(
  employerId: string,
  locationId: string,
  updates: Partial<Location>
): Location | null {
  const employer = employers.find(e => e.id === employerId);
  if (!employer || !employer.locations) return null;

  const index = employer.locations.findIndex(l => l.id === locationId);
  if (index === -1) return null;

  // If setting this as primary, unset all others
  if (updates.isPrimary) {
    employer.locations = employer.locations.map(loc => ({ ...loc, isPrimary: false }));
  }

  employer.locations[index] = {
    ...employer.locations[index],
    ...updates,
  };

  return employer.locations[index];
}

export function deleteLocation(employerId: string, locationId: string): boolean {
  const employer = employers.find(e => e.id === employerId);
  if (!employer || !employer.locations) return false;

  const location = employer.locations.find(l => l.id === locationId);

  // Cannot delete primary location
  if (location?.isPrimary) {
    return false;
  }

  const initialLength = employer.locations.length;
  employer.locations = employer.locations.filter(l => l.id !== locationId);
  return employer.locations.length < initialLength;
}

export function setPrimaryLocation(employerId: string, locationId: string): boolean {
  const employer = employers.find(e => e.id === employerId);
  if (!employer || !employer.locations) return false;

  // Unset all primary locations
  employer.locations = employer.locations.map(loc => ({
    ...loc,
    isPrimary: loc.id === locationId,
  }));

  return true;
}
