import type { CommissionRoleType, CommissionRoleAssignment, TransactionCommission } from '@/shared/types/commissionRole';
import type { CommissionRule, CommissionRuleCondition } from '@/shared/types/commissionRule';
import { formatCurrencyNumber } from './currencyUtils';

export interface CalculateTransactionCommissionInput {
  transactionType: TransactionCommission['transactionType'];
  baseAmount: number;
  roleAssignments: {
    roleId: string;
    roleType: CommissionRoleType;
    consultantId: string;
    consultantName: string;
    percentage: number;
  }[];
  employerId?: string;
  subscriptionTier?: string;
  serviceType?: string;
}

export interface CommissionCalculationResult {
  roleCommissions: Omit<CommissionRoleAssignment, 'id'>[];
  totalCommissionAmount: number;
  totalCommissionPercentage: number;
  warnings: string[];
}

/**
 * Calculate commissions for multiple roles in a transaction
 */
export function calculateTransactionCommission(
  input: CalculateTransactionCommissionInput
): CommissionCalculationResult {
  const { baseAmount, roleAssignments } = input;
  const warnings: string[] = [];
  
  // Calculate each role's commission
  const roleCommissions = roleAssignments.map(assignment => ({
    roleId: assignment.roleId,
    roleName: assignment.roleType.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' '),
    roleType: assignment.roleType,
    consultantId: assignment.consultantId,
    consultantName: assignment.consultantName,
    percentage: assignment.percentage,
    commissionAmount: (baseAmount * assignment.percentage) / 100,
    status: 'pending' as const,
  }));
  
  // Calculate totals
  const totalCommissionPercentage = roleAssignments.reduce(
    (sum, r) => sum + r.percentage, 
    0
  );
  const totalCommissionAmount = roleCommissions.reduce(
    (sum, r) => sum + r.commissionAmount, 
    0
  );
  
  // Validation warnings
  if (totalCommissionPercentage > 100) {
    warnings.push(`Total commission percentage (${totalCommissionPercentage}%) exceeds 100%`);
  }
  
  if (roleAssignments.length === 0) {
    warnings.push('No commission roles assigned');
  }
  
  // Check for duplicate roles assigned to same consultant
  const duplicates = roleAssignments.filter((r, i, arr) => 
    arr.findIndex(x => x.consultantId === r.consultantId && x.roleType === r.roleType) !== i
  );
  if (duplicates.length > 0) {
    warnings.push('Duplicate role assignments detected');
  }
  
  return {
    roleCommissions,
    totalCommissionAmount,
    totalCommissionPercentage,
    warnings
  };
}

/**
 * Apply commission rules automatically to a transaction
 */
export function applyCommissionRules(
  transaction: Partial<TransactionCommission>,
  rules: CommissionRule[]
): Omit<CommissionRoleAssignment, 'id' | 'consultantId' | 'consultantName'>[] {
  const matchingRules = rules
    .filter(rule => rule.isActive)
    .filter(rule => evaluateRuleConditions(rule.conditions, transaction))
    .sort((a, b) => b.priority - a.priority);
  
  if (matchingRules.length === 0) {
    return [];
  }
  
  // Use highest priority rule
  const rule = matchingRules[0];
  
  // Convert rule actions to role assignments (without consultant assignment)
  return rule.actions.map(action => ({
    roleId: `role_${action.roleType}`,
    roleName: action.roleType.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' '),
    roleType: action.roleType,
    percentage: action.percentage || 0,
    commissionAmount: ((transaction.baseAmount || 0) * (action.percentage || 0)) / 100,
    status: 'pending' as const,
  }));
}

/**
 * Evaluate if a transaction matches rule conditions
 */
function evaluateRuleConditions(
  conditions: CommissionRuleCondition[],
  transaction: Partial<TransactionCommission>
): boolean {
  return conditions.every(condition => {
    const value = transaction[condition.field as keyof TransactionCommission];
    
    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'greater-than':
        return Number(value) > Number(condition.value);
      case 'less-than':
        return Number(value) < Number(condition.value);
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(value);
      case 'not-in':
        return Array.isArray(condition.value) && !condition.value.includes(value);
      default:
        return false;
    }
  });
}

/**
 * Split a commission amount across multiple consultants
 */
export function splitCommissionAmount(
  totalAmount: number,
  splits: { consultantId: string; percentage: number }[]
): { consultantId: string; amount: number }[] {
  // Ensure splits add up to 100%
  const totalPercentage = splits.reduce((sum, s) => sum + s.percentage, 0);
  
  if (Math.abs(totalPercentage - 100) > 0.01) {
    throw new Error(`Commission split percentages must add up to 100% (current: ${totalPercentage}%)`);
  }

  return splits.map(split => ({
    consultantId: split.consultantId,
    amount: (totalAmount * split.percentage) / 100,
  }));
}

/**
 * Calculate recurring commission for subscription-based services
 */
export function calculateRecurringCommission(
  baseAmount: number,
  percentage: number,
  months: number
): {
  monthlyAmount: number;
  totalAmount: number;
  breakdown: { month: number; amount: number }[];
} {
  const monthlyAmount = (baseAmount * percentage) / 100;
  const totalAmount = monthlyAmount * months;
  
  const breakdown = Array.from({ length: months }, (_, i) => ({
    month: i + 1,
    amount: monthlyAmount,
  }));
  
  return {
    monthlyAmount,
    totalAmount,
    breakdown,
  };
}

/**
 * Format commission calculation for display
 */
export function formatCommissionBreakdown(
  roleAssignments: CommissionRoleAssignment[],
  currency: string = 'USD'
): string {
  if (roleAssignments.length === 0) {
    return 'No commission assignments';
  }
  
  const lines = roleAssignments.map(ra =>
    `${ra.roleName} (${ra.consultantName}): ${ra.percentage}% = ${currency} ${formatCurrencyNumber(ra.commissionAmount)}`
  );
  
  const total = roleAssignments.reduce((sum, ra) => sum + ra.commissionAmount, 0);
  const totalPercentage = roleAssignments.reduce((sum, ra) => sum + ra.percentage, 0);
  
  return `${lines.join('\n')}\n\nTotal: ${totalPercentage}% = ${currency} ${formatCurrencyNumber(total)}`;
}
