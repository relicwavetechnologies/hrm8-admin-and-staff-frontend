import { BadgeProps } from "@/shared/components/ui/badge";

// Status-based badge variants
export const getStatusBadgeVariant = (status: string): BadgeProps['variant'] => {
  const statusMap: Record<string, BadgeProps['variant']> = {
    // Positive states (Green)
    'Active': 'success',
    'Open': 'success',
    'Available': 'success',
    'approved': 'success',
    'completed': 'success',
    'placed': 'success',
    
    // Warning/Pending states (Yellow/Orange)
    'pending': 'warning',
    'draft': 'warning',
    'In Progress': 'warning',
    'review': 'warning',
    
    // Negative/Inactive states (Red/Gray)
    'Inactive': 'outline',
    'Closed': 'outline',
    'unavailable': 'destructive',
    'rejected': 'destructive',
    'cancelled': 'destructive',
    
    // Assigned/Busy states (Primary)
    'Assigned': 'default',
    'Busy': 'default',
  };
  
  return statusMap[status] || 'outline';
};

// Industry/Category badge variants (Visual variety)
export const getIndustryBadgeVariant = (industry: string): BadgeProps['variant'] => {
  const industryMap: Record<string, BadgeProps['variant']> = {
    'Technology': 'default',
    'Finance': 'teal',
    'Healthcare': 'success',
    'Retail': 'purple',
    'Education': 'purple',
    'Manufacturing': 'neutral',
    'Media': 'coral',
    'Construction': 'orange',
    'Consulting': 'default',
    'Legal': 'purple',
  };
  
  return industryMap[industry] || 'neutral';
};

// Job type badge variants
export const getJobTypeBadgeVariant = (type: string): BadgeProps['variant'] => {
  const typeMap: Record<string, BadgeProps['variant']> = {
    'Full-time': 'default',
    'Part-time': 'purple',
    'Contract': 'orange',
    'Temporary': 'teal',
    'Internship': 'coral',
  };
  
  return typeMap[type] || 'neutral';
};

// Specialization badge variants
export const getSpecializationBadgeVariant = (spec: string): BadgeProps['variant'] => {
  const specMap: Record<string, BadgeProps['variant']> = {
    'IT': 'default',
    'Finance': 'teal',
    'HR': 'purple',
    'Operations': 'orange',
    'Marketing': 'coral',
    'Legal': 'purple',
    'Change Management': 'default',
    'Risk': 'destructive',
  };
  
  return specMap[spec] || 'neutral';
};

// Skill badge variants (consistent color per skill)
const skillColors: BadgeProps['variant'][] = ['default', 'purple', 'teal', 'coral', 'orange'];

export const getSkillBadgeVariant = (skill: string, index: number): BadgeProps['variant'] => {
  // Use skill string hash for consistent color per skill
  const hash = skill.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return skillColors[hash % skillColors.length];
};
