import { apiClient } from '@/shared/lib/apiClient';

export interface SubscriptionTier {
  planType: string;
  name: string;
  price: number;
  currency: string;
}

export interface CompanyCurrency {
  pricingPeg: string;
  billingCurrency: string;
  isLocked: boolean;
  lockedAt: Date | null;
}

class PricingService {
  async getUpgradePreview(planType: string): Promise<{
    upgradeAmount: number;
    currency: string;
    daysRemaining: number;
    currentSubscriptionId: string;
    currentPlanType: string;
  } | null> {
    const res = await apiClient.get<{
      upgradeAmount: number;
      currency: string;
      daysRemaining: number;
      currentSubscriptionId: string;
      currentPlanType: string;
    } | null>(`/api/subscriptions/upgrade-preview?planType=${encodeURIComponent(planType)}`);
    if (!res.success || res.data == null) return null;
    const data = res.data;
    return typeof data?.upgradeAmount === 'number' ? data : null;
  }

  async getSubscriptionTiers(): Promise<SubscriptionTier[]> {
    const res = await apiClient.get<{ tiers: SubscriptionTier[] }>('/api/pricing/subscription-tiers');
    if (!res.success || !res.data) {
      throw new Error(res.error || 'Failed to fetch subscription tiers');
    }
    return res.data.tiers;
  }

  async getCompanyCurrency(): Promise<CompanyCurrency> {
    const res = await apiClient.get<CompanyCurrency>('/api/pricing/company-currency');
    if (!res.success || !res.data) {
      throw new Error(res.error || 'Failed to fetch company currency');
    }
    return res.data;
  }

  formatPrice(amount: number, currency: string): string {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }
}

export const pricingService = new PricingService();
