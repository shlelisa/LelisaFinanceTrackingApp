import { useProfile } from "./useProfile";
import {
  getPreferredCurrency,
  setPreferredCurrency,
  formatCurrency,
  getCurrencySymbol,
} from "@/lib/currency";
import { useUpdatePreferences } from "./useProfile";
import { getLocale } from "@/lib/i18n";

export const useAppCurrency = () => {
  const { data: profile } = useProfile();
  const updatePrefs = useUpdatePreferences();

  const currency = profile?.preferences?.currency || getPreferredCurrency();
  const lang = profile?.preferences?.language ?? "English";
  const locale = getLocale(lang);

  const setCurrency = (code: string) => {
    setPreferredCurrency(code);
    updatePrefs.mutate({ currency: code });
  };

  return {
    currency,
    symbol: getCurrencySymbol(currency),
    format: (amount: number) => formatCurrency(amount, currency, locale),
    setCurrency,
  };
};
