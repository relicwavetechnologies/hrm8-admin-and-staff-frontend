import type { CertificateTemplate } from '@/shared/types/performance';

export const mockCertificateTemplates: CertificateTemplate[] = [
  {
    id: 'template-1',
    name: 'Modern Professional',
    type: 'course',
    layout: 'landscape',
    colors: {
      primary: '#2563eb',
      secondary: '#1e40af',
      accent: '#60a5fa'
    },
    backgroundPattern: 'gradient'
  },
  {
    id: 'template-2',
    name: 'Classic Elegant',
    type: 'certification',
    layout: 'landscape',
    colors: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#34d399'
    },
    backgroundPattern: 'border'
  },
  {
    id: 'template-3',
    name: 'Tech Minimalist',
    type: 'skill-mastery',
    layout: 'landscape',
    colors: {
      primary: '#7c3aed',
      secondary: '#6d28d9',
      accent: '#a78bfa'
    },
    backgroundPattern: 'geometric'
  },
  {
    id: 'template-4',
    name: 'Corporate Gold',
    type: 'program-completion',
    layout: 'landscape',
    colors: {
      primary: '#ea580c',
      secondary: '#c2410c',
      accent: '#fb923c'
    },
    backgroundPattern: 'waves'
  },
  {
    id: 'template-5',
    name: 'Achievement Badge',
    type: 'course',
    layout: 'portrait',
    colors: {
      primary: '#dc2626',
      secondary: '#b91c1c',
      accent: '#f87171'
    },
    backgroundPattern: 'circles'
  },
];
