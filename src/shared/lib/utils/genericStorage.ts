/**
 * Generic localStorage Storage Utility
 * 
 * Provides a reusable pattern for managing localStorage with TypeScript type safety.
 * Reduces code duplication across storage files.
 * 
 * @example
 * ```typescript
 * const benefitsStorage = createStorage<BenefitPlan>({
 *   key: 'benefit_plans',
 *   version: 1,
 *   initialData: mockBenefitPlans
 * });
 * 
 * // Usage
 * const plans = benefitsStorage.getAll();
 * const plan = benefitsStorage.getById('123');
 * benefitsStorage.save({ ...newPlan });
 * benefitsStorage.update('123', { name: 'Updated' });
 * benefitsStorage.delete('123');
 * ```
 */

interface StorageConfig<T> {
  key: string;
  version?: number;
  initialData?: T[];
  versionKey?: string;
}

interface EntityWithId {
  id: string;
}



/**
 * Creates a typed storage manager for a specific entity type
 */
export function createStorage<T extends EntityWithId>(config: StorageConfig<T>) {
  const {
    key,
    version = 1,
    initialData = [],
    versionKey = `${key}_version`,
  } = config;

  /**
   * Initialize localStorage with default data if needed
   */
  function initialize(): void {
    const storedVersion = localStorage.getItem(versionKey);
    const currentVersion = version.toString();

    // Reset if version mismatch
    if (storedVersion !== currentVersion) {
      console.log(`Storage "${key}" version mismatch - resetting to v${version}`);
      localStorage.setItem(key, JSON.stringify(initialData));
      localStorage.setItem(versionKey, currentVersion);
      return;
    }

    // Initialize if empty
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(initialData));
      localStorage.setItem(versionKey, currentVersion);
    }
  }

  /**
   * Get all items from storage
   */
  function getAll(): T[] {
    initialize();
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Get a single item by ID
   */
  function getById(id: string): T | undefined {
    return getAll().find(item => item.id === id);
  }

  /**
   * Filter items based on a predicate
   */
  function filter(predicate: (item: T) => boolean): T[] {
    return getAll().filter(predicate);
  }

  /**
   * Save all items to storage
   */
  function saveAll(items: T[]): void {
    localStorage.setItem(key, JSON.stringify(items));
  }

  /**
   * Create a new item (generates ID and timestamps if needed)
   */
  function create(data: Omit<T, 'id'> | T): T {
    const items = getAll();
    const newItem = {
      ...data,
      id: 'id' in data ? (data as T).id : crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as T;

    items.push(newItem);
    saveAll(items);
    return newItem;
  }

  /**
   * Update an existing item by ID
   */
  function update(id: string, updates: Partial<T>): T | null {
    const items = getAll();
    const index = items.findIndex(item => item.id === id);

    if (index === -1) return null;

    items[index] = {
      ...items[index],
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    } as T;

    saveAll(items);
    return items[index];
  }

  /**
   * Upsert (update if exists, create if not)
   */
  function upsert(item: T): T {
    const existing = getById(item.id);
    if (existing) {
      return update(item.id, item) || item;
    } else {
      return create(item);
    }
  }

  /**
   * Delete an item by ID
   */
  function remove(id: string): boolean {
    const items = getAll();
    const filtered = items.filter(item => item.id !== id);

    if (filtered.length === items.length) return false; // Not found

    saveAll(filtered);
    return true;
  }

  /**
   * Delete multiple items by IDs
   */
  function removeMany(ids: string[]): number {
    const items = getAll();
    const idsSet = new Set(ids);
    const filtered = items.filter(item => !idsSet.has(item.id));
    const deletedCount = items.length - filtered.length;

    if (deletedCount > 0) {
      saveAll(filtered);
    }

    return deletedCount;
  }

  /**
   * Clear all data from storage
   */
  function clear(): void {
    saveAll([]);
  }

  /**
   * Reset to initial data
   */
  function reset(): void {
    localStorage.setItem(key, JSON.stringify(initialData));
    localStorage.setItem(versionKey, version.toString());
  }

  /**
   * Get count of items
   */
  function count(): number {
    return getAll().length;
  }

  /**
   * Check if an item exists
   */
  function exists(id: string): boolean {
    return getById(id) !== undefined;
  }

  return {
    getAll,
    getById,
    filter,
    create,
    update,
    upsert,
    remove,
    removeMany,
    clear,
    reset,
    count,
    exists,
    saveAll, // For advanced use cases
    initialize, // For manual initialization
  };
}

/**
 * Multi-collection storage manager
 * Useful when you need to manage multiple related collections
 */
export function createMultiStorage<T extends Record<string, EntityWithId>>(
  configs: { [K in keyof T]: StorageConfig<T[K]> }
) {
  const storages = {} as { [K in keyof T]: ReturnType<typeof createStorage<T[K]>> };

  for (const key in configs) {
    storages[key] = createStorage(configs[key]);
  }

  return storages;
}

/**
 * Example: Create storage for benefits with multiple collections
 * 
 * const benefitsStorage = createMultiStorage({
 *   plans: { key: 'benefit_plans', initialData: mockPlans },
 *   enrollments: { key: 'benefit_enrollments', initialData: mockEnrollments }
 * });
 * 
 * const plans = benefitsStorage.plans.getAll();
 * const enrollments = benefitsStorage.enrollments.getAll();
 */

































