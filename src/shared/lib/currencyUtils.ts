/**
 * Currency formatting utilities
 * 
 * Note: For component usage, prefer using the useCurrencyFormat hook from CurrencyFormatContext
 * to respect user preferences. These standalone functions are for cases where hooks can't be used.
 */

type CurrencyFormat = 'whole' | 'decimal';

/**
 * Get the stored currency format preference from localStorage
 */
export function getCurrencyFormat(): CurrencyFormat {
  const stored = localStorage.getItem('hrm8_currency_format');
  return (stored as CurrencyFormat) || 'whole';
}

/**
 * Format a currency value respecting user's format preference
 * 
 * @param value - The numeric value to format
 * @param currency - The currency code (default: 'USD')
 * @param forceFormat - Optional: Force a specific format regardless of user preference
 * @returns Formatted currency string
 * 
 * @example
 * formatCurrency(1234567) // Returns "$1,234,567" if preference is 'whole'
 * formatCurrency(1234567) // Returns "$1,234,567.00" if preference is 'decimal'
 * formatCurrency(1234567, 'USD', 'decimal') // Always returns "$1,234,567.00"
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD',
  forceFormat?: CurrencyFormat
): string {
  const format = forceFormat || getCurrencyFormat();
  
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: format === 'whole' ? 0 : 2,
    maximumFractionDigits: format === 'whole' ? 0 : 2,
  };

  return new Intl.NumberFormat('en-US', options).format(value);
}

/**
 * Format a currency value without the currency symbol
 * 
 * @param value - The numeric value to format
 * @param forceFormat - Optional: Force a specific format regardless of user preference
 * @returns Formatted number string
 * 
 * @example
 * formatCurrencyNumber(1234567) // Returns "1,234,567" if preference is 'whole'
 * formatCurrencyNumber(1234567) // Returns "1,234,567.00" if preference is 'decimal'
 */
export function formatCurrencyNumber(
  value: number,
  forceFormat?: CurrencyFormat
): string {
  const format = forceFormat || getCurrencyFormat();
  
  const options: Intl.NumberFormatOptions = {
    minimumFractionDigits: format === 'whole' ? 0 : 2,
    maximumFractionDigits: format === 'whole' ? 0 : 2,
  };

  return new Intl.NumberFormat('en-US', options).format(value);
}
