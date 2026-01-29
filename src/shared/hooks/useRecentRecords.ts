import { useState, useEffect } from 'react';

const STORAGE_KEY = 'recent-records';
const MAX_RECENT = 5;

export interface RecentRecord {
  id: string;
  type: 'candidate' | 'job' | 'employer';
  name: string;
  url: string;
  timestamp: number;
}

export function useRecentRecords() {
  const [records, setRecords] = useState<RecentRecord[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  const addRecentRecord = (record: Omit<RecentRecord, 'timestamp'>) => {
    setRecords((prev) => {
      // Remove duplicate if exists (by id)
      const filtered = prev.filter((r) => r.id !== record.id);
      
      // Add new record at the beginning with timestamp
      const updated = [
        { ...record, timestamp: Date.now() },
        ...filtered
      ].slice(0, MAX_RECENT);
      
      return updated;
    });
  };

  const clearRecentRecords = () => {
    setRecords([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { 
    records, 
    addRecentRecord, 
    clearRecentRecords 
  };
}
