import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { RecurringTransaction } from "@/lib/types/recurring";
import type { CreateRecurringInput, UpdateRecurringInput } from "@/lib/validation/recurring";
import {
  fetchRecurringTransactions,
  createRecurringTransaction as createApi,
  updateRecurringTransaction as updateApi,
  deleteRecurringTransaction as deleteApi,
} from "@/lib/api/recurring";

export const RECURRING_KEY = ["recurring"] as const;

export const useRecurringTransactions = () => {
  return useQuery<RecurringTransaction[], Error>({
    queryKey: RECURRING_KEY,
    queryFn: fetchRecurringTransactions,
  });
};

export const useCreateRecurring = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRecurringInput) => createApi(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RECURRING_KEY }),
  });
};

export const useUpdateRecurring = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRecurringInput }) =>
      updateApi(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RECURRING_KEY }),
  });
};

export const useDeleteRecurring = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteApi(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RECURRING_KEY }),
  });
};
