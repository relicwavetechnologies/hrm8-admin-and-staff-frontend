export interface ApplicationFilters {
  status?: string[];
  scoreRange?: [number, number];
  dateRange?: {
    start: string;
    end: string;
  };
  assignedTo?: string[];
  tags?: string[];
  search?: string;
  customFields?: Record<string, unknown>;
}

export interface FilterPreset {
  id: string;
  name: string;
  userId: string;
  filters: ApplicationFilters;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SearchQuery {
  text: string;
  fuzzy: boolean;
  fields: ('name' | 'email' | 'notes' | 'answers')[];
  minScore?: number;
}
