import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import type { ConsultantUser } from '@/shared/lib/consultantAuthService';

type CurrencyFormat = 'whole' | 'decimal';

const CURRENCY_FORMAT_KEY = 'hrm8_currency_format';

function localeForCurrency(code: string): string {
  const c = code.toUpperCase();
  if (c === 'EUR') return 'de-DE';
  if (c === 'GBP') return 'en-GB';
  if (c === 'INR') return 'en-IN';
  return 'en-US';
}

function staffDisplayCurrency(user: ReturnType<typeof useAuth>['user']): string {
  if (!user) return 'USD';
  if (user.type === 'ADMIN') return 'USD';
  const raw = user.rawUser as ConsultantUser;
  const code = String(raw.payoutCurrency || raw.defaultCurrency || 'USD')
    .trim()
    .toUpperCase();
  return /^[A-Z]{3}$/.test(code) ? code : 'USD';
}

export interface StaffCurrencyFormatContextType {
  currencyFormat: CurrencyFormat;
  setCurrencyFormat: (format: CurrencyFormat) => void;
  /** Consultant payout / staff display currency, or USD for HRM8 admin. */
  billingCurrency: string;
  formatCurrency: (value: number, amountCurrency?: string) => string;
}

const CurrencyFormatContext = createContext<StaffCurrencyFormatContextType | undefined>(undefined);

export function CurrencyFormatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const billingCurrency = useMemo(() => staffDisplayCurrency(user), [user]);

  useEffect(() => {
    try {
      localStorage.removeItem('hrm8_selected_currency');
    } catch {
      /* noop */
    }
  }, []);

  const [currencyFormat, setCurrencyFormatState] = useState<CurrencyFormat>(() => {
    const stored = localStorage.getItem(CURRENCY_FORMAT_KEY);
    return stored === 'decimal' || stored === 'whole' ? stored : 'whole';
  });

  useEffect(() => {
    localStorage.setItem(CURRENCY_FORMAT_KEY, currencyFormat);
  }, [currencyFormat]);

  const setCurrencyFormat = useCallback((format: CurrencyFormat) => {
    setCurrencyFormatState(format);
  }, []);

  const formatCurrency = useCallback(
    (value: number, amountCurrency?: string) => {
      const code = (amountCurrency || billingCurrency).toUpperCase();
      const locale = localeForCurrency(code);
      const opts: Intl.NumberFormatOptions = {
        style: 'currency',
        currency: code,
        minimumFractionDigits: currencyFormat === 'whole' ? 0 : 2,
        maximumFractionDigits: currencyFormat === 'whole' ? 0 : 2,
      };
      try {
        return new Intl.NumberFormat(locale, opts).format(value);
      } catch {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(value);
      }
    },
    [billingCurrency, currencyFormat]
  );

  const value = useMemo(
    () => ({
      currencyFormat,
      setCurrencyFormat,
      billingCurrency,
      formatCurrency,
    }),
    [currencyFormat, setCurrencyFormat, billingCurrency, formatCurrency]
  );

  return <CurrencyFormatContext.Provider value={value}>{children}</CurrencyFormatContext.Provider>;
}

export function useCurrencyFormat() {
  const context = useContext(CurrencyFormatContext);
  if (context === undefined) {
    throw new Error('useCurrencyFormat must be used within a CurrencyFormatProvider');
  }
  return context;
}
