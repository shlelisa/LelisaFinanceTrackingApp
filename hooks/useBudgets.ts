import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Budget } from "@/lib/types/budget";
import type { CreateBudgetInput, UpdateBudgetInput } from "@/lib/validation/budget";
import {
  fetchBudgets,
  createBudget as createBudgetApi,
  updateBudget as updateBudgetApi,
  deleteBudget as deleteBudgetApi,
} from "@/lib/api/budgets";

export const BUDGETS_KEY = ["budgets"] as const;

export const useBudgets = () => {
  return useQuery<Budget[], Error>({
    queryKey: BUDGETS_KEY,
    queryFn: fetchBudgets,
  });
};

export const useCreateBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (budget: CreateBudgetInput) => createBudgetApi(budget),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BUDGETS_KEY }),
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBudgetInput }) =>
      updateBudgetApi(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BUDGETS_KEY }),
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBudgetApi(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BUDGETS_KEY }),
  });
};
