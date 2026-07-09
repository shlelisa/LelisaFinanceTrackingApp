import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { TransactionFilters, CreateTransactionInput, UpdateTransactionInput } from "@/lib/types/transaction";
import {
  fetchTransactions,
  fetchTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  fetchDashboardSummary,
  fetchMonthlyReport,
  fetchCategoryBreakdown,
} from "@/lib/api/transactions";

export const TRANSACTIONS_KEY = ["transactions"] as const;
const BUDGETS_KEY = ["budgets"];

export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: [...TRANSACTIONS_KEY, filters],
    queryFn: () => fetchTransactions(filters),
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: [...TRANSACTIONS_KEY, id],
    queryFn: () => fetchTransaction(id),
    enabled: !!id,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTransactionInput) => createTransaction(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRANSACTIONS_KEY });
      qc.invalidateQueries({ queryKey: BUDGETS_KEY });
    },
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionInput }) =>
      updateTransaction(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRANSACTIONS_KEY });
      qc.invalidateQueries({ queryKey: BUDGETS_KEY });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRANSACTIONS_KEY });
      qc.invalidateQueries({ queryKey: BUDGETS_KEY });
    },
  });
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: [...TRANSACTIONS_KEY, "summary"],
    queryFn: fetchDashboardSummary,
  });
}

export function useMonthlyReport(year?: number) {
  return useQuery({
    queryKey: [...TRANSACTIONS_KEY, "report", year],
    queryFn: () => fetchMonthlyReport(year),
  });
}

export function useCategoryBreakdown() {
  return useQuery({
    queryKey: [...TRANSACTIONS_KEY, "categories"],
    queryFn: fetchCategoryBreakdown,
  });
}
