import React, { createContext, useContext, useState, useEffect } from 'react';

type CurrencyFormat = 'whole' | 'decimal';
type CurrencyCode = 'USD' | 'EUR' | 'GBP';

interface ExchangeRates {
  EUR: number;
  GBP: number;
}

interface CurrencyFormatContextType {
  currencyFormat: CurrencyFormat;
  setCurrencyFormat: (format: CurrencyFormat) => void;
  selectedCurrency: CurrencyCode;
  setSelectedCurrency: (currency: CurrencyCode) => void;
  formatCurrency: (value: number, sourceCurrency?: string) => string;
  exchangeRates: ExchangeRates;
}

const CurrencyFormatContext = createContext<CurrencyFormatContextType | undefined>(undefined);

const CURRENCY_FORMAT_KEY = 'hrm8_currency_format';
const SELECTED_CURRENCY_KEY = 'hrm8_selected_currency';

// Fallback exchange rates (updated periodically)
const FALLBACK_RATES: ExchangeRates = {
  EUR: 0.92,
  GBP: 0.79,
};

export function CurrencyFormatProvider({ children }: { children: React.ReactNode }) {
  const [currencyFormat, setCurrencyFormatState] = useState<CurrencyFormat>(() => {
    const stored = localStorage.getItem(CURRENCY_FORMAT_KEY);
    return (stored as CurrencyFormat) || 'whole';
  });

  const [selectedCurrency, setSelectedCurrencyState] = useState<CurrencyCode>(() => {
    const stored = localStorage.getItem(SELECTED_CURRENCY_KEY);
    return (stored as CurrencyCode) || 'USD';
  });

  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>(FALLBACK_RATES);

  // Fetch exchange rates on mount
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        if (response.ok) {
          const data = await response.json();
          setExchangeRates({
            EUR: data.rates.EUR || FALLBACK_RATES.EUR,
            GBP: data.rates.GBP || FALLBACK_RATES.GBP,
          });
        }
      } catch (error) {
        console.log('Using fallback exchange rates');
        // Keep using fallback rates
      }
    };

    fetchExchangeRates();
    // Refresh rates every hour
    const interval = setInterval(fetchExchangeRates, 3600000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem(CURRENCY_FORMAT_KEY, currencyFormat);
  }, [currencyFormat]);

  useEffect(() => {
    localStorage.setItem(SELECTED_CURRENCY_KEY, selectedCurrency);
  }, [selectedCurrency]);

  const setCurrencyFormat = (format: CurrencyFormat) => {
    setCurrencyFormatState(format);
  };

  const setSelectedCurrency = (currency: CurrencyCode) => {
    setSelectedCurrencyState(currency);
  };

  const formatCurrency = (value: number, sourceCurrency: string = 'USD'): string => {
    // Convert value to selected currency
    let convertedValue = value;
    
    // First convert to USD if source is different
    if (sourceCurrency !== 'USD') {
      if (sourceCurrency === 'EUR') {
        convertedValue = value / exchangeRates.EUR;
      } else if (sourceCurrency === 'GBP') {
        convertedValue = value / exchangeRates.GBP;
      }
    }

    // Then convert from USD to selected currency
    if (selectedCurrency === 'EUR') {
      convertedValue = convertedValue * exchangeRates.EUR;
    } else if (selectedCurrency === 'GBP') {
      convertedValue = convertedValue * exchangeRates.GBP;
    }

    const options: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: selectedCurrency,
      minimumFractionDigits: currencyFormat === 'whole' ? 0 : 2,
      maximumFractionDigits: currencyFormat === 'whole' ? 0 : 2,
    };

    // Use appropriate locale for currency
    const locale = selectedCurrency === 'EUR' ? 'de-DE' : selectedCurrency === 'GBP' ? 'en-GB' : 'en-US';
    return new Intl.NumberFormat(locale, options).format(convertedValue);
  };

  return (
    <CurrencyFormatContext.Provider value={{ 
      currencyFormat, 
      setCurrencyFormat, 
      selectedCurrency,
      setSelectedCurrency,
      formatCurrency,
      exchangeRates
    }}>
      {children}
    </CurrencyFormatContext.Provider>
  );
}

export function useCurrencyFormat() {
  const context = useContext(CurrencyFormatContext);
  if (context === undefined) {
    throw new Error('useCurrencyFormat must be used within a CurrencyFormatProvider');
  }
  return context;
}
