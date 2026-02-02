import { apiClient } from '@/shared/lib/apiClient';

export interface ProductTier {
  id: string;
  name: string;
  minQuantity: number;
  maxQuantity?: number;
  unitPrice: number;
  period: string;
}

export interface Product {
  id: string;
  name: string;
  code: string;
  description?: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tiers?: ProductTier[];
}

export interface PriceBookTier {
  id: string;
  name: string;
  minQuantity: number;
  maxQuantity?: number;
  unitPrice: number;
  period: string;
  product?: Product;
}

export interface PriceBook {
  id: string;
  name: string;
  description?: string;
  isGlobal: boolean;
  regionId?: string | null;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tiers: PriceBookTier[];
  region?: {
    id: string;
    name: string;
    code: string;
  } | null;
}

class Hrm8PricingService {
  async getProducts() {
    return apiClient.get<{ products: Product[] }>('/api/hrm8/pricing/products');
  }

  async getPriceBooks(params?: { regionId?: string }) {
    const query = new URLSearchParams();
    if (params?.regionId) query.append('regionId', params.regionId);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get<{ priceBooks: PriceBook[] }>(`/api/hrm8/pricing/books${suffix}`);
  }
}

export const hrm8PricingService = new Hrm8PricingService();

