import type { CreateTransactionInput, UpdateTransactionInput, TransactionFilters, Transaction, DashboardSummary, MonthlyReport } from "../types/transaction";
import api from "../axios";

export const fetchTransactions = (filters?: TransactionFilters): Promise<Transaction[]> =>
  api.get("/transactions", { params: filters }).then((r) => r.data);

export const fetchTransaction = (id: string): Promise<Transaction> =>
  api.get(`/transactions/${id}`).then((r) => r.data);

export const createTransaction = (data: CreateTransactionInput): Promise<Transaction> =>
  api.post("/transactions", data).then((r) => r.data);

export const updateTransaction = (id: string, data: UpdateTransactionInput): Promise<Transaction> =>
  api.put(`/transactions/${id}`, data).then((r) => r.data);

export const deleteTransaction = (id: string): Promise<{ message: string }> =>
  api.delete(`/transactions/${id}`).then((r) => r.data);

export const fetchDashboardSummary = (): Promise<DashboardSummary> =>
  api.get("/transactions/summary").then((r) => r.data);

export const fetchMonthlyReport = (year?: number): Promise<MonthlyReport> =>
  api.get("/transactions/report", { params: { year } }).then((r) => r.data);

export const fetchCategoryBreakdown = (): Promise<{ name: string; value: number }[]> =>
  api.get("/transactions/categories").then((r) => r.data);
