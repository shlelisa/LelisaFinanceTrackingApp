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

export const getCurrencySymbol = (code: string = "ETB"): string =>
  currencySymbols[code] || code;

export const formatCurrency = (
  amount: number,
  currencyCode: string = "ETB",
  locale?: string,
): string => {
  const loc = locale || currencyLocales[currencyCode] || "en-US";
  try {
    return new Intl.NumberFormat(loc, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${getCurrencySymbol(currencyCode)} ${amount.toLocaleString()}`;
  }
};

export const STORAGE_CURRENCY_KEY = "preferred_currency";

export const getPreferredCurrency = (): string => {
  if (typeof window === "undefined") return "ETB";
  return localStorage.getItem(STORAGE_CURRENCY_KEY) || "ETB";
};

export const setPreferredCurrency = (code: string) => {
  localStorage.setItem(STORAGE_CURRENCY_KEY, code);
};
