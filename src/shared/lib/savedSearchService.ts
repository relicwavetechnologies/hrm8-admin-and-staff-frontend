export interface SearchCondition {
  id: string;
  field: 'name' | 'email' | 'phone' | 'skills' | 'position' | 'location' | 'experienceLevel' | 'status' | 'source' | 'tags';
  operator: 'contains' | 'equals' | 'not_equals' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: string | string[] | number;
  logicalOperator?: 'AND' | 'OR';
}

export interface SearchGroup {
  id: string;
  conditions: SearchCondition[];
  logicalOperator: 'AND' | 'OR';
}

export interface SavedSearch {
  id: string;
  name: string;
  description?: string;
  groups: SearchGroup[];
  globalOperator: 'AND' | 'OR';
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastUsed?: Date;
  useCount: number;
}

export interface SearchHistory {
  id: string;
  searchQuery: string;
  filters: any;
  timestamp: Date;
  resultCount: number;
}

const STORAGE_KEY = 'hrm8_saved_searches';
const HISTORY_KEY = 'hrm8_search_history';

// Initialize with example searches
const defaultSearches: SavedSearch[] = [
  {
    id: '1',
    name: 'Senior Developers in Tech Hubs',
    description: 'Senior-level developers in major tech cities',
    groups: [
      {
        id: 'group-1',
        conditions: [
          {
            id: 'cond-1',
            field: 'experienceLevel',
            operator: 'in',
            value: ['senior', 'executive'],
            logicalOperator: 'AND',
          },
          {
            id: 'cond-2',
            field: 'skills',
            operator: 'contains',
            value: 'Developer',
          },
        ],
        logicalOperator: 'AND',
      },
    ],
    globalOperator: 'AND',
    isDefault: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    useCount: 15,
  },
  {
    id: '2',
    name: 'Active Remote Candidates',
    description: 'Active candidates open to remote work',
    groups: [
      {
        id: 'group-1',
        conditions: [
          {
            id: 'cond-1',
            field: 'status',
            operator: 'equals',
            value: 'active',
            logicalOperator: 'AND',
          },
        ],
        logicalOperator: 'AND',
      },
    ],
    globalOperator: 'AND',
    isDefault: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    useCount: 42,
  },
];

function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSearches));
  }
  if (!localStorage.getItem(HISTORY_KEY)) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify([]));
  }
}

export function getSavedSearches(): SavedSearch[] {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  return JSON.parse(data).map((s: any) => ({
    ...s,
    createdAt: new Date(s.createdAt),
    updatedAt: new Date(s.updatedAt),
    lastUsed: s.lastUsed ? new Date(s.lastUsed) : undefined,
  }));
}

export function getSavedSearch(id: string): SavedSearch | undefined {
  const searches = getSavedSearches();
  return searches.find(s => s.id === id);
}

export function createSavedSearch(
  name: string,
  groups: SearchGroup[],
  globalOperator: 'AND' | 'OR' = 'AND',
  description?: string
): SavedSearch {
  initializeStorage();
  const searches = getSavedSearches();
  
  const newSearch: SavedSearch = {
    id: `search-${Date.now()}`,
    name,
    description,
    groups,
    globalOperator,
    createdAt: new Date(),
    updatedAt: new Date(),
    useCount: 0,
  };
  
  searches.push(newSearch);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
  return newSearch;
}

export function updateSavedSearch(id: string, updates: Partial<SavedSearch>): SavedSearch | null {
  const searches = getSavedSearches();
  const index = searches.findIndex(s => s.id === id);
  if (index === -1) return null;
  
  searches[index] = {
    ...searches[index],
    ...updates,
    updatedAt: new Date(),
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
  return searches[index];
}

export function deleteSavedSearch(id: string): boolean {
  const searches = getSavedSearches();
  const filtered = searches.filter(s => s.id !== id);
  if (filtered.length === searches.length) return false;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

export function recordSearchUsage(id: string): void {
  const searches = getSavedSearches();
  const search = searches.find(s => s.id === id);
  if (!search) return;
  
  search.useCount += 1;
  search.lastUsed = new Date();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
}

// Search History
export function getSearchHistory(limit: number = 20): SearchHistory[] {
  initializeStorage();
  const data = localStorage.getItem(HISTORY_KEY);
  if (!data) return [];
  return JSON.parse(data)
    .map((h: any) => ({
      ...h,
      timestamp: new Date(h.timestamp),
    }))
    .slice(0, limit);
}

export function addSearchHistory(searchQuery: string, filters: any, resultCount: number): void {
  initializeStorage();
  const history = getSearchHistory(100);
  
  const newEntry: SearchHistory = {
    id: `history-${Date.now()}`,
    searchQuery,
    filters,
    timestamp: new Date(),
    resultCount,
  };
  
  history.unshift(newEntry);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
}

export function clearSearchHistory(): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify([]));
}
