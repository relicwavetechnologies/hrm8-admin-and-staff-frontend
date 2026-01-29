import { useState, useEffect } from 'react';

const STORAGE_KEY = 'sidebar-sections-state';

type SectionKey = 'ats' | 'sales' | 'operations' | 'hrManagement' | 'management' | 'integrations' | 'system';

type SectionsState = Record<SectionKey, boolean>;

const defaultSections: SectionsState = {
  ats: true,
  sales: true,
  operations: true,
  hrManagement: true,
  management: true,
  integrations: true,
  system: true,
};

export function useSidebarSections() {
  const [sections, setSections] = useState<SectionsState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...defaultSections, ...JSON.parse(stored) } : defaultSections;
    } catch {
      return defaultSections;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
  }, [sections]);

  const toggleSection = (key: SectionKey) => {
    setSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return { sections, toggleSection };
}
