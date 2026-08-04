import type { CreateTransactionInput, UpdateTransactionInput, TransactionFilters, Transaction, DashboardSummary, MonthlyReport } from "../types/transaction";
import {
  getStoredTransactions,
  getStoredTransactionById,
  saveStoredTransaction,
  updateStoredTransaction,
  deleteStoredTransaction,
} from "../storage/localStorage";
import {
  computeDashboardSummary,
  computeMonthlyReport,
  computeCategoryBreakdown,
} from "../storage/financeLogic";

export const fetchTransactions = async (filters?: TransactionFilters): Promise<Transaction[]> => {
  return getStoredTransactions(filters);
};

export const fetchTransaction = async (id: string): Promise<Transaction> => {
  const tx = getStoredTransactionById(id);
  if (!tx) throw new Error("Transaction not found");
  return tx;
};

export const createTransaction = async (data: CreateTransactionInput): Promise<Transaction> => {
  return saveStoredTransaction(data);
};

export const updateTransaction = async (id: string, data: UpdateTransactionInput): Promise<Transaction> => {
  return updateStoredTransaction(id, data);
};

export const deleteTransaction = async (id: string): Promise<{ message: string }> => {
  deleteStoredTransaction(id);
  return { message: "Transaction deleted successfully" };
};

export const fetchDashboardSummary = async (): Promise<DashboardSummary> => {
  return computeDashboardSummary();
};

export const fetchMonthlyReport = async (year?: number): Promise<MonthlyReport> => {
  return computeMonthlyReport(year);
};

export const fetchCategoryBreakdown = async (): Promise<{ name: string; value: number }[]> => {
  return computeCategoryBreakdown();
};
