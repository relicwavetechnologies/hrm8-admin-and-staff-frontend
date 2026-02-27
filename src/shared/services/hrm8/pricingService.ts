import { apiClient } from '@/shared/lib/apiClient';

export type ProductCategory =
  | 'SUBSCRIPTION'
  | 'JOB_POSTING'
  | 'ASSESSMENT'
  | 'ADDON_SERVICE'
  | 'FEATURE_UNLOCK'
  | 'SUPPORT'
  | 'OTHER';

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
  category: ProductCategory;
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
  billing_currency?: string;
  pricing_peg?: string;
  effective_from?: string;
  is_approved?: boolean;
  version?: string;
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

export interface CountryPricingMap {
  id: string;
  country_code: string;
  country_name: string;
  pricing_peg: string;
  billing_currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class Hrm8PricingService {
  async getProducts() {
    return apiClient.get<{ products: Product[] }>('/api/hrm8/pricing/products');
  }

  async upsertProduct(data: Partial<Product> & { name: string; code: string; category: string }) {
    // Backend repository handles upsert logic based on ID presence
    return apiClient.post<{ product: Product }>('/api/hrm8/pricing/products', data);
  }

  async deleteProduct(id: string) {
    return apiClient.delete(`/api/hrm8/pricing/products/${id}`);
  }

  async getPriceBooks(params?: { regionId?: string }) {
    const query = new URLSearchParams();
    if (params?.regionId) query.append('regionId', params.regionId);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get<{ priceBooks: PriceBook[] }>(`/api/hrm8/pricing/price-books${suffix}`);
  }

  async createPriceBook(data: Partial<PriceBook> & { name: string }) {
    return apiClient.post<{ priceBook: PriceBook }>('/api/hrm8/pricing/price-books', data);
  }

  async updatePriceBook(id: string, data: Partial<PriceBook>) {
    return apiClient.put<{ priceBook: PriceBook }>(`/api/hrm8/pricing/price-books/${id}`, data);
  }

  async deletePriceBook(id: string) {
    return apiClient.delete(`/api/hrm8/pricing/price-books/${id}`);
  }

  async createPriceTier(priceBookId: string, data: {
    productId: string;
    name: string;
    minQuantity?: number;
    maxQuantity?: number | null;
    unitPrice: number;
    period?: string;
  }) {
    return apiClient.post<{ tier: PriceBookTier }>(`/api/hrm8/pricing/tiers/${priceBookId}`, data);
  }

  async updatePriceTier(id: string, data: {
    name?: string;
    minQuantity?: number;
    maxQuantity?: number | null;
    unitPrice?: number;
    period?: string;
  }) {
    return apiClient.put<{ tier: PriceBookTier }>(`/api/hrm8/pricing/tiers/${id}`, data);
  }

  async deletePriceTier(id: string) {
    return apiClient.delete(`/api/hrm8/pricing/tiers/${id}`);
  }

  async getPromoCodes() {
    return apiClient.get<{ promoCodes: PromoCode[] }>('/api/hrm8/pricing/promo-codes');
  }

  async createPromoCode(data: any) {
    return apiClient.post<{ promoCode: PromoCode }>('/api/hrm8/pricing/promo-codes', data);
  }

  async updatePromoCode(id: string, data: any) {
    return apiClient.put<{ promoCode: PromoCode }>(`/api/hrm8/pricing/promo-codes/${id}`, data);
  }

  async deletePromoCode(id: string) {
    return apiClient.delete(`/api/hrm8/pricing/promo-codes/${id}`);
  }

  async getCountryPricingMap() {
    return apiClient.get<{ countryPricingMap: CountryPricingMap[] }>('/api/hrm8/pricing/country-map');
  }

  async createCountryPricingMap(data: {
    countryCode: string;
    countryName: string;
    pricingPeg: string;
    billingCurrency: string;
    isActive?: boolean;
  }) {
    return apiClient.post<{ countryPricing: CountryPricingMap }>('/api/hrm8/pricing/country-map', data);
  }

  async updateCountryPricingMap(
    id: string,
    data: Partial<{
      countryCode: string;
      countryName: string;
      pricingPeg: string;
      billingCurrency: string;
      isActive: boolean;
    }>
  ) {
    return apiClient.put<{ countryPricing: CountryPricingMap }>(`/api/hrm8/pricing/country-map/${id}`, data);
  }

  async toggleCountryPricingMap(id: string, isActive: boolean) {
    return apiClient.put<{ countryPricing: CountryPricingMap }>(`/api/hrm8/pricing/country-map/${id}/toggle`, { isActive });
  }

  async validatePromoCode(code: string) {
    return apiClient.post<{
      valid: boolean;
      discount: number;
      discountType?: string;
      message?: string;
    }>('/api/hrm8/pricing/promo-codes/validate', { code });
  }

  async getCountryPricingMap() {
    return apiClient.get<{ countryPricingMap: CountryPricingMapEntry[] }>('/api/hrm8/pricing/country-map');
  }

  async createCountryPricingMap(data: CountryPricingMapCreate) {
    return apiClient.post<{ countryPricing: CountryPricingMapEntry }>('/api/hrm8/pricing/country-map', data);
  }

  async updateCountryPricingMap(id: string, data: Partial<CountryPricingMapCreate>) {
    return apiClient.put<{ countryPricing: CountryPricingMapEntry }>(`/api/hrm8/pricing/country-map/${id}`, data);
  }

  async toggleCountryPricingMap(id: string) {
    return apiClient.put<{ countryPricing: CountryPricingMapEntry }>(`/api/hrm8/pricing/country-map/${id}/toggle`);
  }
}

export interface CountryPricingMapEntry {
  id: string;
  country_code: string;
  country_name?: string;
  pricing_peg: string;
  billing_currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CountryPricingMapCreate {
  country_code: string;
  country_name?: string;
  pricing_peg: string;
  billing_currency: string;
}

export const hrm8PricingService = new Hrm8PricingService();
