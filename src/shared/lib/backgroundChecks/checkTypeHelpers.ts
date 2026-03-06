import { Users, ShieldAlert, UserCheck, GraduationCap } from 'lucide-react';
import type { BackgroundCheckType } from '@/shared/types/backgroundCheck';

export interface CheckTypeInfo {
  icon: typeof Users;
  label: string;
  color: string;
  bgColor: string;
  description: string;
}

export const CHECK_TYPE_INFO: Record<BackgroundCheckType, CheckTypeInfo> = {
  'reference': {
    icon: Users,
    label: 'Reference Check',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'Verify work history and performance through professional references',
  },
  'criminal': {
    icon: ShieldAlert,
    label: 'Criminal Record Check',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    description: 'Screen for criminal history and legal records',
  },
  'identity': {
    icon: UserCheck,
    label: 'Identity Verification',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'Confirm identity through document verification',
  },
  'education': {
    icon: GraduationCap,
    label: 'Qualification Verification',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'Verify educational credentials and professional qualifications',
  },
  'employment': {
    icon: Users,
    label: 'Employment Verification',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    description: 'Confirm previous employment history',
  },
  'credit': {
    icon: ShieldAlert,
    label: 'Credit Check',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    description: 'Review credit history and financial background',
  },
  'drug-screen': {
    icon: ShieldAlert,
    label: 'Drug Screening',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    description: 'Test for substance use',
  },
  'professional-license': {
    icon: GraduationCap,
    label: 'License Verification',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    description: 'Verify professional licenses and certifications',
  },
};

export function getCheckTypeInfo(type: BackgroundCheckType): CheckTypeInfo {
  return CHECK_TYPE_INFO[type] || CHECK_TYPE_INFO.reference;
}

export function getCheckTypeIcon(type: BackgroundCheckType) {
  return getCheckTypeInfo(type).icon;
}

export function getCheckTypeLabel(type: BackgroundCheckType): string {
  return getCheckTypeInfo(type).label;
}

export function formatCheckType(type: string): string {
  return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'not-started': 'text-gray-500',
    'pending-consent': 'text-yellow-600',
    'in-progress': 'text-blue-600',
    'completed': 'text-green-600',
    'issues-found': 'text-red-600',
    'cancelled': 'text-gray-400',
  };
  return colors[status] || 'text-gray-500';
}

export function getOverallResultColor(result?: string): string {
  const colors: Record<string, string> = {
    'clear': 'text-green-600',
    'conditional': 'text-yellow-600',
    'not-clear': 'text-red-600',
  };
  return result ? colors[result] || 'text-gray-500' : 'text-gray-500';
}

export function getCheckProgress(check: any): number {
  if (check.status === 'completed') return 100;
  if (check.status === 'cancelled') return 0;
  
  let progress = 0;
  
  // Consent given: 25%
  if (check.consentGiven) {
    progress += 25;
  }
  
  // Each check type in progress: split remaining 75%
  const inProgressResults = check.results?.filter((r: any) => 
    r.status !== 'pending' && r.status !== 'not-started'
  ) || [];
  
  if (check.checkTypes.length > 0) {
    const progressPerCheck = 75 / check.checkTypes.length;
    progress += inProgressResults.length * progressPerCheck;
  }
  
  return Math.min(Math.round(progress), 100);
}
