import { useEffect, useCallback, useRef } from 'react';
import { UseFormReturn, FieldValues } from 'react-hook-form';
import { useNotification } from './use-notification';

interface UseFormAutosaveOptions<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  storageKey: string;
  enabled?: boolean;
  debounceMs?: number;
  onRestore?: (data: TFieldValues) => void;
  excludeFields?: (keyof TFieldValues)[];
}

/**
 * Auto-saves form state to localStorage and restores on mount
 * Prevents data loss if user navigates away accidentally
 */
export function useFormAutosave<TFieldValues extends FieldValues>({
  form,
  storageKey,
  enabled = true,
  debounceMs = 1000,
  onRestore,
  excludeFields = [],
}: UseFormAutosaveOptions<TFieldValues>) {
  const notify = useNotification();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasRestoredRef = useRef(false);

  // Save to localStorage
  const saveToStorage = useCallback((data: TFieldValues) => {
    if (!enabled) return;

    try {
      // Filter out excluded fields
      const dataToSave = { ...data };
      excludeFields.forEach((field) => {
        delete dataToSave[field];
      });

      localStorage.setItem(
        storageKey,
        JSON.stringify({
          data: dataToSave,
          timestamp: new Date().toISOString(),
        })
      );
    } catch (error) {
      console.error('Failed to save form data:', error);
    }
  }, [storageKey, enabled, excludeFields]);

  // Restore from localStorage
  const restoreFromStorage = useCallback(() => {
    if (!enabled || hasRestoredRef.current) return null;

    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return null;

      const { data, timestamp } = JSON.parse(stored);

      // Check if data is stale (older than 24 hours)
      const age = Date.now() - new Date(timestamp).getTime();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      if (age > maxAge) {
        localStorage.removeItem(storageKey);
        return null;
      }

      hasRestoredRef.current = true;
      return { data, timestamp };
    } catch (error) {
      console.error('Failed to restore form data:', error);
      return null;
    }
  }, [storageKey, enabled]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Failed to clear saved data:', error);
    }
  }, [storageKey]);

  // Restore on mount
  useEffect(() => {
    const restored = restoreFromStorage();

    if (restored && restored.data) {
      // Ask user if they want to restore
      const shouldRestore = window.confirm(
        'You have unsaved changes from a previous session. Would you like to restore them?'
      );

      if (shouldRestore) {
        form.reset(restored.data);
        onRestore?.(restored.data);
        notify.info('Form data restored from previous session');
      } else {
        clearSavedData();
      }
    }
  }, []); // Only run on mount

  // Auto-save on form changes
  useEffect(() => {
    if (!enabled || !hasRestoredRef.current) return;

    const subscription = form.watch((data) => {
      // Debounce saves
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        saveToStorage(data as TFieldValues);
      }, debounceMs);
    });

    return () => {
      subscription.unsubscribe();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [form, enabled, saveToStorage, debounceMs]);

  return {
    clearSavedData,
    hasSavedData: () => {
      try {
        return localStorage.getItem(storageKey) !== null;
      } catch {
        return false;
      }
    },
  };
}
