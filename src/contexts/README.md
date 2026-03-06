# Currency Format Context

This context provides application-wide currency formatting based on user preferences.

## Usage

### In React Components

Use the `useCurrencyFormat` hook to access the currency formatting functionality:

```tsx
import { useCurrencyFormat } from '@/contexts/CurrencyFormatContext';

function MyComponent() {
  const { currencyFormat, formatCurrency } = useCurrencyFormat();
  
  return (
    <div>
      <p>Current format: {currencyFormat}</p>
      <p>Formatted value: {formatCurrency(1234567.89)}</p>
    </div>
  );
}
```

### In Non-React Code

For utility functions or code outside of React components, use the standalone utility:

```typescript
import { formatCurrency } from '@/lib/currencyUtils';

const formattedValue = formatCurrency(1234567.89);
```

## API Reference

### useCurrencyFormat Hook

Returns an object with:

- `currencyFormat`: `'whole' | 'decimal'` - Current format preference
- `setCurrencyFormat(format)`: Function to update the format
- `formatCurrency(value, currency?)`: Function to format a number as currency

### formatCurrency Utility

```typescript
formatCurrency(
  value: number,
  currency?: string,  // Default: 'USD'
  forceFormat?: 'whole' | 'decimal'  // Optional: Override user preference
): string
```

### Examples

```tsx
// With hook (respects user preference)
const { formatCurrency } = useCurrencyFormat();
formatCurrency(1234567.89) // "$1,234,567" or "$1,234,567.89" based on setting

// With utility (respects user preference)
import { formatCurrency } from '@/lib/currencyUtils';
formatCurrency(1234567.89) // "$1,234,567" or "$1,234,567.89" based on setting

// Force decimal format
formatCurrency(1234567.89, 'USD', 'decimal') // Always "$1,234,567.89"

// Different currency
formatCurrency(1234567.89, 'EUR') // "€1,234,567" or "€1,234,567.89" based on setting
```

## User Setting

Users can change their currency format preference in **Settings > Display & Formatting**.

The preference is stored in `localStorage` and persists across sessions.
