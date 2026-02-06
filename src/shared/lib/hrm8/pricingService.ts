import { apiClient } from '../api';

export interface ProductTier {
  id: string;
  name: string;
  min_quantity: number;
  max_quantity?: number;
  unit_price: number;
  period: string;
}

export interface Product {
  id: string;
  name: string;
  code: string;
  description?: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  tiers?: ProductTier[];
}

export interface PriceBookTier {
  id: string;
  name: string;
  min_quantity: number;
  max_quantity?: number;
  unit_price: number;
  period: string;
  product?: Product;
}

export interface PriceBook {
  id: string;
  name: string;
  description?: string;
  is_global: boolean;
  region_id?: string | null;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  tiers: PriceBookTier[];
  region?: {
    id: string;
    name: string;
    code: string;
  } | null;
}

export interface PromoCode {
  id: string;
  code: string;
  description?: string;
  discount_type: 'PERCENT' | 'FIXED';
  discount_value: number;
  start_date: string;
  end_date?: string | null;
  max_uses?: number | null;
  used_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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

  async upsertProduct(data: Partial<Product> & { name: string; code: string; category: string }) {
    if (data.id) {
      return apiClient.put<{ product: Product }>(`/api/hrm8/pricing/products/${data.id}`, data);
    }
    return apiClient.post<{ product: Product }>('/api/hrm8/pricing/products', data);
  }

  async upsertPriceBook(data: Partial<PriceBook> & { name: string }) {
    if (data.id) {
      return apiClient.put<{ priceBook: PriceBook }>(`/api/hrm8/pricing/price-books/${data.id}`, data);
    }
    return apiClient.post<{ priceBook: PriceBook }>('/api/hrm8/pricing/price-books', data);
  }

  async upsertPriceTier(data: {
    id?: string;
    price_book_id: string;
    product_id: string;
    name: string;
    min_quantity?: number;
    max_quantity?: number | null;
    unit_price: number;
    period?: string;
  }) {
    if (data.id) {
      return apiClient.put<{ tier: PriceBookTier }>(`/api/hrm8/pricing/price-tiers/${data.id}`, data);
    }
    return apiClient.post<{ tier: PriceBookTier }>('/api/hrm8/pricing/price-tiers', data);
  }

  async getPromoCodes() {
    return apiClient.get<{ promoCodes: PromoCode[] }>('/api/hrm8/pricing/promo-codes');
  }

  async createPromoCode(data: Omit<PromoCode, 'id' | 'used_count' | 'created_at' | 'updated_at'>) {
    return apiClient.post<{ promoCode: PromoCode }>('/api/hrm8/pricing/promo-codes', data);
  }

  async updatePromoCode(id: string, data: Partial<PromoCode>) {
    return apiClient.put<{ promoCode: PromoCode }>(`/api/hrm8/pricing/promo-codes/${id}`, data);
  }
}

export const hrm8PricingService = new Hrm8PricingService();
