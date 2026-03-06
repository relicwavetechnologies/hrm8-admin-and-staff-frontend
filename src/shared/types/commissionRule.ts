import { CommissionRoleType } from './commissionRole';

export interface CommissionRuleCondition {
  field: 'transactionType' | 'baseAmount' | 'subscriptionTier' | 'serviceType' | 'employerType';
  operator: 'equals' | 'greater-than' | 'less-than' | 'in' | 'not-in';
  value: any;
}

export interface CommissionRuleAction {
  roleType: CommissionRoleType;
  percentage?: number;
  flatAmount?: number;
  applyToAll?: boolean; // Apply to all matching transactions
}

export interface CommissionRule {
  id: string;
  name: string;
  description?: string;
  priority: number; // Higher priority rules apply first
  
  // Conditions (AND logic)
  conditions: CommissionRuleCondition[];
  
  // Actions (what commissions to create)
  actions: CommissionRuleAction[];
  
  // Settings
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// Predefined rule templates
export const COMMISSION_RULE_TEMPLATES = {
  'ats-subscription-standard': {
    name: 'ATS Subscription - Standard Split',
    conditions: [
      { field: 'transactionType', operator: 'equals', value: 'ats-subscription' }
    ],
    actions: [
      { roleType: 'sales-agent', percentage: 30 },
      { roleType: 'account-manager', percentage: 10 }
    ]
  },
  'recruitment-service-standard': {
    name: 'Recruitment Service - Standard Split',
    conditions: [
      { field: 'transactionType', operator: 'equals', value: 'recruitment-service' }
    ],
    actions: [
      { roleType: 'sales-agent', percentage: 30 },
      { roleType: 'recruiter', percentage: 50 },
      { roleType: 'account-manager', percentage: 10 }
    ]
  },
  'rpo-service-standard': {
    name: 'RPO Service - Standard Split',
    conditions: [
      { field: 'transactionType', operator: 'equals', value: 'rpo-service' }
    ],
    actions: [
      { roleType: 'sales-agent', percentage: 20 },
      { roleType: 'recruiter', percentage: 40 },
      { roleType: 'account-manager', percentage: 15 }
    ]
  },
  'hrms-addon-standard': {
    name: 'HRMS Add-on - Standard Split',
    conditions: [
      { field: 'transactionType', operator: 'equals', value: 'hrms-addon' }
    ],
    actions: [
      { roleType: 'sales-agent', percentage: 25 },
      { roleType: 'account-manager', percentage: 15 }
    ]
  }
} as const;
