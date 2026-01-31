import type { CommissionStructure, CommissionTier } from '@/shared/types/commission';

export interface CommissionCalculationInput {
  baseAmount: number;
  structure: CommissionStructure;
  rate?: number;
  tiers?: CommissionTier[];
  customLogic?: (amount: number) => number;
}

export interface CommissionCalculationResult {
  baseAmount: number;
  commissionRate: number;
  commissionAmount: number;
  breakdown?: {
    tier: string;
    amount: number;
    rate: number;
    commission: number;
  }[];
}

export function calculateCommission(
  input: CommissionCalculationInput
): CommissionCalculationResult {
  const { baseAmount, structure, rate, tiers, customLogic } = input;

  switch (structure) {
    case 'percentage':
      return calculatePercentageCommission(baseAmount, rate || 0);

    case 'flat':
      return calculateFlatCommission(baseAmount, rate || 0);

    case 'tiered':
      return calculateTieredCommission(baseAmount, tiers || []);

    case 'custom':
      if (customLogic) {
        const commissionAmount = customLogic(baseAmount);
        return {
          baseAmount,
          commissionRate: (commissionAmount / baseAmount) * 100,
          commissionAmount,
        };
      }
      // Fall back to percentage if no custom logic
      return calculatePercentageCommission(baseAmount, rate || 0);

    default:
      return {
        baseAmount,
        commissionRate: 0,
        commissionAmount: 0,
      };
  }
}

function calculatePercentageCommission(
  amount: number,
  rate: number
): CommissionCalculationResult {
  const commissionAmount = (amount * rate) / 100;

  return {
    baseAmount: amount,
    commissionRate: rate,
    commissionAmount,
  };
}

function calculateFlatCommission(
  amount: number,
  flatAmount: number
): CommissionCalculationResult {
  return {
    baseAmount: amount,
    commissionRate: (flatAmount / amount) * 100,
    commissionAmount: flatAmount,
  };
}

function calculateTieredCommission(
  amount: number,
  tiers: CommissionTier[]
): CommissionCalculationResult {
  if (!tiers || tiers.length === 0) {
    return {
      baseAmount: amount,
      commissionRate: 0,
      commissionAmount: 0,
    };
  }

  // Sort tiers by 'from' amount
  const sortedTiers = [...tiers].sort((a, b) => a.from - b.from);

  let remainingAmount = amount;
  let totalCommission = 0;
  const breakdown: CommissionCalculationResult['breakdown'] = [];

  for (const tier of sortedTiers) {
    if (remainingAmount <= 0) break;

    const tierStart = tier.from;
    const tierEnd = tier.to || Infinity;

    // Amount that falls in this tier
    const amountInTier = Math.min(
      remainingAmount,
      tierEnd - tierStart
    );

    if (amountInTier > 0) {
      const tierCommission = (amountInTier * tier.rate) / 100;
      const tierBonus = tier.flatBonus || 0;
      const totalTierCommission = tierCommission + tierBonus;

      totalCommission += totalTierCommission;

      breakdown.push({
        tier: tier.to ? `$${tierStart.toLocaleString()} - $${tierEnd.toLocaleString()}` : `$${tierStart.toLocaleString()}+`,
        amount: amountInTier,
        rate: tier.rate,
        commission: totalTierCommission,
      });

      remainingAmount -= amountInTier;
    }
  }

  return {
    baseAmount: amount,
    commissionRate: (totalCommission / amount) * 100,
    commissionAmount: totalCommission,
    breakdown,
  };
}

export function estimateCommission(
  placementFee: number,
  _consultantId: string,
  structure: CommissionStructure = 'percentage',
  rate: number = 15
): number {
  const result = calculateCommission({
    baseAmount: placementFee,
    structure,
    rate,
  });

  return result.commissionAmount;
}

export function splitCommission(
  totalCommission: number,
  consultants: { id: string; splitPercentage: number }[]
): { consultantId: string; amount: number }[] {
  // Ensure splits add up to 100%
  const totalPercentage = consultants.reduce((sum, c) => sum + c.splitPercentage, 0);

  if (totalPercentage !== 100) {
    throw new Error('Commission split percentages must add up to 100%');
  }

  return consultants.map(c => ({
    consultantId: c.id,
    amount: (totalCommission * c.splitPercentage) / 100,
  }));
}

export function formatCommissionBreakdown(result: CommissionCalculationResult): string {
  if (!result.breakdown || result.breakdown.length === 0) {
    return `${result.commissionRate.toFixed(2)}% of $${result.baseAmount.toLocaleString()} = $${result.commissionAmount.toLocaleString()}`;
  }

  const lines = result.breakdown.map(b =>
    `${b.tier}: ${b.rate}% of $${b.amount.toLocaleString()} = $${b.commission.toLocaleString()}`
  );

  return `Total: $${result.commissionAmount.toLocaleString()}\n\nBreakdown:\n${lines.join('\n')}`;
}
