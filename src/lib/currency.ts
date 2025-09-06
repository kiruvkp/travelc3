// Currency conversion utilities
export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  INR: '₹',
} as const;

export const CURRENCY_NAMES = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
  CAD: 'Canadian Dollar',
  AUD: 'Australian Dollar',
  INR: 'Indian Rupee',
} as const;

// Exchange rates (in a real app, these would come from an API)
export const EXCHANGE_RATES = {
  USD: 1,
  EUR: 0.85,
  GBP: 0.73,
  JPY: 110,
  CAD: 1.25,
  AUD: 1.35,
  INR: 83,
} as const;

export type Currency = keyof typeof CURRENCY_SYMBOLS;

export function formatCurrency(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  
  // Handle invalid amounts
  if (isNaN(amount) || amount === null || amount === undefined) {
    return `${symbol || '$'}0`;
  }
  
  // Format based on currency
  if (currency === 'JPY') {
    // Japanese Yen doesn't use decimals
    return `${symbol}${Math.round(amount).toLocaleString()}`;
  } else if (currency === 'INR') {
    // Indian Rupee formatting
    return `${symbol}${amount.toLocaleString('en-IN', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 2 
    })}`;
  } else {
    // Standard formatting for other currencies
    return `${symbol}${amount.toLocaleString('en-US', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 2 
    })}`;
  }
}

export function convertCurrency(amount: number, fromCurrency: Currency, toCurrency: Currency): number {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to USD first, then to target currency
  const usdAmount = amount / EXCHANGE_RATES[fromCurrency];
  const convertedAmount = usdAmount * EXCHANGE_RATES[toCurrency];
  
  return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
}

export function getCurrencySymbol(currency: Currency): string {
  return CURRENCY_SYMBOLS[currency];
}

export function getCurrencyName(currency: Currency): string {
  return CURRENCY_NAMES[currency];
}

// Helper function to get currency display info
export function getCurrencyInfo(currency: Currency) {
  return {
    symbol: getCurrencySymbol(currency),
    name: getCurrencyName(currency),
    code: currency
  };
}

// Helper function to format currency with proper locale
export function formatCurrencyWithLocale(amount: number, currency: Currency): string {
  const symbol = getCurrencySymbol(currency);
  
  // Handle invalid amounts
  if (isNaN(amount) || amount === null || amount === undefined) {
    return `${symbol}0`;
  }
  
  // Use appropriate locale for each currency
  const localeMap: Record<Currency, string> = {
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB', 
    JPY: 'ja-JP',
    CAD: 'en-CA',
    AUD: 'en-AU',
    INR: 'en-IN'
  };
  
  const locale = localeMap[currency] || 'en-US';
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'JPY' ? 0 : 2,
      maximumFractionDigits: currency === 'JPY' ? 0 : 2
    }).format(amount);
  } catch (error) {
    // Fallback to manual formatting if Intl fails
    return formatCurrency(amount, currency);
  }
}