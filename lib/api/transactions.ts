import type { CreateTransactionInput, UpdateTransactionInput, TransactionFilters } from "../types/transaction";
import api from "../axios";

export const fetchTransactions = (filters?: TransactionFilters) =>
  api.get("/transactions", { params: filters }).then((r) => r.data);

export const fetchTransaction = (id: string) =>
  api.get(`/transactions/${id}`).then((r) => r.data);

export const createTransaction = (data: CreateTransactionInput) =>
  api.post("/transactions", data).then((r) => r.data);

export const updateTransaction = (id: string, data: UpdateTransactionInput) =>
  api.put(`/transactions/${id}`, data).then((r) => r.data);

export const deleteTransaction = (id: string) =>
  api.delete(`/transactions/${id}`).then((r) => r.data);

export const fetchDashboardSummary = () =>
  api.get("/transactions/summary").then((r) => r.data);

export const fetchMonthlyReport = (year?: number) =>
  api.get("/transactions/report", { params: { year } }).then((r) => r.data);

export const fetchCategoryBreakdown = () =>
  api.get("/transactions/categories").then((r) => r.data);
