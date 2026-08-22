export const DEFAULT_CURRENCY = "ETB";

const currencySymbols: Record<string, string> = {
  ETB: "Br",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

const currencyLocales: Record<string, string> = {
  ETB: "en-ET",
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
};

export const SUPPORTED_CURRENCIES = Object.keys(currencySymbols);

export const getCurrencySymbol = (code: string = DEFAULT_CURRENCY): string =>
  currencySymbols[code] || code;

export const formatCurrency = (
  amount: number,
  currencyCode: string = DEFAULT_CURRENCY,
  locale?: string,
): string => {
  const loc = locale || currencyLocales[currencyCode] || "en-US";
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat(loc, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(safeAmount);
  } catch {
    return `${getCurrencySymbol(currencyCode)} ${safeAmount.toLocaleString()}`;
  }
};

export const formatCurrencyExact = (
  amount: number,
  currencyCode: string = DEFAULT_CURRENCY,
): string => {
  const loc = currencyLocales[currencyCode] || "en-US";
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat(loc, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeAmount);
  } catch {
    return `${getCurrencySymbol(currencyCode)} ${safeAmount.toFixed(2)}`;
  }
};

export const STORAGE_CURRENCY_KEY = "preferred_currency";

export const getAppCurrency = (): string => {
  if (typeof window === "undefined") return DEFAULT_CURRENCY;
  return localStorage.getItem(STORAGE_CURRENCY_KEY) || DEFAULT_CURRENCY;
};

export const getPreferredCurrency = getAppCurrency;

export const setPreferredCurrency = (code: string) => {
  localStorage.setItem(STORAGE_CURRENCY_KEY, code);
};
