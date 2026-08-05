import { getEffectiveExchangeRates } from "../storage/localStorage";

export interface RatesResponse {
  base: string;
  rates: Record<string, number>;
  etbRates: Record<string, number>;
}

export const fetchRates = async (): Promise<RatesResponse> => {
  return getEffectiveExchangeRates();
};
