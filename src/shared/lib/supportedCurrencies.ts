export const HRM8_SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'AUD', 'INR'] as const;

export type Hrm8SupportedCurrency = (typeof HRM8_SUPPORTED_CURRENCIES)[number];

export const HRM8_SUPPORTED_CURRENCY_LABELS: Record<Hrm8SupportedCurrency, string> = {
  USD: 'USD ($)',
  EUR: 'EUR (€)',
  GBP: 'GBP (£)',
  AUD: 'AUD (A$)',
  INR: 'INR (₹)',
};
