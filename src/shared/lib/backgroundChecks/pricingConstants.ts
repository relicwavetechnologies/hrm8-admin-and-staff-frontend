import type { BackgroundCheckType } from '@/shared/types/backgroundCheck';

export interface CheckTypePricing {
  type: BackgroundCheckType;
  name: string;
  description: string;
  provider: string;
  cost: number;
  estimatedTime: string;
  icon: string;
}

export const BACKGROUND_CHECK_PRICING: Record<BackgroundCheckType, CheckTypePricing> = {
  'reference': {
    type: 'reference',
    name: 'Reference Check',
    description: 'Automated reference checking with customizable questionnaires',
    provider: 'HRM8 Native',
    cost: 69,
    estimatedTime: '2-5 business days',
    icon: '✅'
  },
  'criminal': {
    type: 'criminal',
    name: 'Criminal Record Check',
    description: 'Comprehensive criminal background check',
    provider: 'Checkr',
    cost: 49,
    estimatedTime: '1-3 business days',
    icon: '🧾'
  },
  'education': {
    type: 'education',
    name: 'Qualification Verification',
    description: 'Verify educational credentials and certifications',
    provider: 'Sterling',
    cost: 59,
    estimatedTime: '3-7 business days',
    icon: '🎓'
  },
  'identity': {
    type: 'identity',
    name: 'Identity Verification',
    description: 'Verify identity documents and personal information',
    provider: 'HireRight',
    cost: 39,
    estimatedTime: '1-2 business days',
    icon: '🪪'
  },
  'employment': {
    type: 'employment',
    name: 'Employment Verification',
    description: 'Verify employment history and dates',
    provider: 'Sterling',
    cost: 45,
    estimatedTime: '3-5 business days',
    icon: '💼'
  },
  'credit': {
    type: 'credit',
    name: 'Credit Check',
    description: 'Financial history and credit report',
    provider: 'Checkr',
    cost: 35,
    estimatedTime: '1-2 business days',
    icon: '💳'
  },
  'drug-screen': {
    type: 'drug-screen',
    name: 'Drug Screening',
    description: 'Pre-employment drug testing',
    provider: 'HireRight',
    cost: 55,
    estimatedTime: '2-4 business days',
    icon: '🔬'
  },
  'professional-license': {
    type: 'professional-license',
    name: 'Professional License Verification',
    description: 'Verify professional licenses and certifications',
    provider: 'Sterling',
    cost: 42,
    estimatedTime: '3-5 business days',
    icon: '📜'
  }
};

export function calculateTotalCost(checkTypes: BackgroundCheckType[]): number {
  return checkTypes.reduce((total, type) => {
    return total + (BACKGROUND_CHECK_PRICING[type]?.cost || 0);
  }, 0);
}

export function getCostBreakdown(checkTypes: BackgroundCheckType[]) {
  return checkTypes.map(type => ({
    checkType: type,
    ...BACKGROUND_CHECK_PRICING[type]
  }));
}
