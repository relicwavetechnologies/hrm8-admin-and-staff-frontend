/**
 * Available Currencies Service
 * Returns currencies that have active price books mapped in the system.
 * Used on first-login currency setup so staff only see currencies with pricing.
 */

import { apiClient } from './apiClient';

export async function getAvailableCurrencies(): Promise<string[]> {
  const res = await apiClient.get<{ currencies: string[] }>(
    '/api/pricing/available-currencies'
  );
  if (!res.success || !res.data) {
    throw new Error(res.error || 'Failed to fetch available currencies');
  }
  return res.data.currencies;
}
