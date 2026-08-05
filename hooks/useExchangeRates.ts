import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchUserRates,
  upsertUserRate,
  deleteUserRate,
  type UserRateDoc,
} from "@/lib/api/exchangeRates";

export const EXCHANGE_RATES_KEY = ["user-exchange-rates"] as const;

export const useExchangeRates = () =>
  useQuery<UserRateDoc[], Error>({
    queryKey: EXCHANGE_RATES_KEY,
    queryFn: fetchUserRates,
  });

export const useUpsertExchangeRate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ from, to, rate }: { from: string; to: string; rate: number }) =>
      upsertUserRate(from, to, rate),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EXCHANGE_RATES_KEY });
      qc.invalidateQueries({ queryKey: ["exchange-rates"] });
    },
  });
};

export const useDeleteExchangeRate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteUserRate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EXCHANGE_RATES_KEY });
      qc.invalidateQueries({ queryKey: ["exchange-rates"] });
    },
  });
};
