export interface SavedFilter {
  id: string;
  name: string;
  filters: FilterCriteria;
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FilterCriteria {
  status?: string[];
  employmentType?: string[];
  department?: string[];
  location?: string[];
  experienceLevel?: string[];
  salaryRange?: { min?: number; max?: number };
  dateRange?: { start?: Date; end?: Date };
  applicantRange?: { min?: number; max?: number };
  assignedTo?: string[];
  searchQuery?: string;
}

const savedFilters: SavedFilter[] = [
  {
    id: "1",
    name: "My Open Jobs",
    filters: { status: ["open"], assignedTo: ["current-user"] },
    isDefault: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: "2",
    name: "Urgent Hiring",
    filters: { 
      status: ["open"], 
      dateRange: { 
        end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
      } 
    },
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  },
  {
    id: "3",
    name: "Senior Tech Roles",
    filters: { 
      department: ["Engineering", "Product"],
      experienceLevel: ["senior", "lead"],
      salaryRange: { min: 100000 }
    },
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
];

export function getSavedFilters(): SavedFilter[] {
  return [...savedFilters];
}

export function getSavedFilter(id: string): SavedFilter | undefined {
  return savedFilters.find(f => f.id === id);
}

export function createSavedFilter(name: string, filters: FilterCriteria): SavedFilter {
  const newFilter: SavedFilter = {
    id: Date.now().toString(),
    name,
    filters,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  savedFilters.push(newFilter);
  return newFilter;
}

export function updateSavedFilter(id: string, updates: Partial<SavedFilter>): SavedFilter | null {
  const index = savedFilters.findIndex(f => f.id === id);
  if (index === -1) return null;
  
  savedFilters[index] = {
    ...savedFilters[index],
    ...updates,
    updatedAt: new Date(),
  };
  
  return savedFilters[index];
}

export function deleteSavedFilter(id: string): boolean {
  const index = savedFilters.findIndex(f => f.id === id);
  if (index === -1) return false;
  
  savedFilters.splice(index, 1);
  return true;
}
