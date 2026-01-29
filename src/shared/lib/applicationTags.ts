import type { Application } from '@/shared/types/application';
import { getApplications, updateApplication } from './mockApplicationStorage';

// Predefined tag categories
export const PREDEFINED_TAGS = [
  'High Potential',
  'Culture Fit',
  'Technical Expert',
  'Leadership Material',
  'Quick Learner',
  'Team Player',
  'Remote Ready',
  'Immediate Start',
  'Salary Negotiable',
  'Requires Visa',
  'Internal Referral',
  'Diverse Candidate',
] as const;

export type PredefinedTag = typeof PREDEFINED_TAGS[number];

// Get all unique tags across all applications
export function getAllTags(): string[] {
  const applications = getApplications();
  const tagSet = new Set<string>();
  
  applications.forEach(app => {
    app.tags?.forEach(tag => tagSet.add(tag));
  });
  
  return Array.from(tagSet).sort();
}

// Add tag to application
export function addTagToApplication(applicationId: string, tag: string): void {
  const applications = getApplications();
  const app = applications.find(a => a.id === applicationId);
  
  if (app) {
    const currentTags = app.tags || [];
    if (!currentTags.includes(tag)) {
      updateApplication(applicationId, {
        tags: [...currentTags, tag],
      });
    }
  }
}

// Remove tag from application
export function removeTagFromApplication(applicationId: string, tag: string): void {
  const applications = getApplications();
  const app = applications.find(a => a.id === applicationId);
  
  if (app && app.tags) {
    updateApplication(applicationId, {
      tags: app.tags.filter(t => t !== tag),
    });
  }
}

// Bulk add tags to multiple applications
export function bulkAddTags(applicationIds: string[], tags: string[]): void {
  applicationIds.forEach(id => {
    const applications = getApplications();
    const app = applications.find(a => a.id === id);
    
    if (app) {
      const currentTags = app.tags || [];
      const newTags = [...new Set([...currentTags, ...tags])];
      updateApplication(id, { tags: newTags });
    }
  });
}

// Bulk remove tags from multiple applications
export function bulkRemoveTags(applicationIds: string[], tags: string[]): void {
  applicationIds.forEach(id => {
    const applications = getApplications();
    const app = applications.find(a => a.id === id);
    
    if (app && app.tags) {
      updateApplication(id, {
        tags: app.tags.filter(t => !tags.includes(t)),
      });
    }
  });
}

// Filter applications by tags
export function filterApplicationsByTags(applications: Application[], tags: string[]): Application[] {
  if (tags.length === 0) return applications;
  
  return applications.filter(app => {
    if (!app.tags || app.tags.length === 0) return false;
    return tags.some(tag => app.tags!.includes(tag));
  });
}

// Get tag color based on tag name
export function getTagColor(tag: string): string {
  const colorMap: Record<string, string> = {
    'High Potential': 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
    'Culture Fit': 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
    'Technical Expert': 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    'Leadership Material': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
    'Quick Learner': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
    'Team Player': 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
    'Remote Ready': 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
    'Immediate Start': 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
    'Salary Negotiable': 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    'Requires Visa': 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
    'Internal Referral': 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
    'Diverse Candidate': 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  };
  
  return colorMap[tag] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
}
