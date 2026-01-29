import { useState, useEffect } from 'react';

const STORAGE_KEY = 'sidebar-state';
const HRM8_STORAGE_KEY = 'hrm8-sidebar-state';
const CONSULTANT_STORAGE_KEY = 'consultant-sidebar-state';
const CANDIDATE_STORAGE_KEY = 'candidate-sidebar-state';

const CONSULTANT360_STORAGE_KEY = 'consultant360-sidebar-state';
const SALES_AGENT_STORAGE_KEY = 'sales-agent-sidebar-state';

export function useSidebarState(userType?: 'hrm8' | 'consultant' | 'candidate' | 'consultant360' | 'sales-agent') {
  const getStorageKey = () => {
    switch (userType) {
      case 'hrm8': return HRM8_STORAGE_KEY;
      case 'consultant': return CONSULTANT_STORAGE_KEY;
      case 'candidate': return CANDIDATE_STORAGE_KEY;
      case 'consultant360': return CONSULTANT360_STORAGE_KEY;
      case 'sales-agent': return SALES_AGENT_STORAGE_KEY;
      default: return STORAGE_KEY;
    }
  };

  const storageKey = getStorageKey();

  const [open, setOpen] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(open));
  }, [open, storageKey]);

  return { open, setOpen };
}
