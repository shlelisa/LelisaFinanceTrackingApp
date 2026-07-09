import { useQuery } from "@tanstack/react-query";
import { fetchRates, type RatesResponse } from "@/lib/api/rates";

export const RATES_KEY = ["exchange-rates"] as const;

export const useRates = () => {
  return useQuery<RatesResponse, Error>({
    queryKey: RATES_KEY,
    queryFn: fetchRates,
    staleTime: 6 * 60 * 60 * 1000, // 6h cache
  });
};
