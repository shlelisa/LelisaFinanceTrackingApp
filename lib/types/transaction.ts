export type TransactionType = "income" | "expense" | "transfer";

export type Transaction = {
  _id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  originalAmount: number;
  category: string;
  description: string;
  date: string;
  time?: string;
  accountId?: string;
  toAccountId?: string;
  paymentMethod?: string;
  receiptUrl?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreateTransactionInput = {
  type: TransactionType;
  amount: number;
  currency?: string;
  category: string;
  description: string;
  date?: string;
  time?: string;
  accountId?: string;
  toAccountId?: string;
  paymentMethod?: string;
  receiptUrl?: string;
  tags?: string[];
};

export type UpdateTransactionInput = Partial<CreateTransactionInput>;

export type TransactionFilters = {
  search?: string;
  type?: TransactionType;
  category?: string;
  accountId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type DashboardSummary = {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  recentTransactions: Transaction[];
  expenseBreakdown: { name: string; value: number }[];
};

export type MonthlyReport = {
  report: { month: string; income: number; expense: number }[];
  categoryBreakdown: { _id: string; total: number }[];
};

export interface FavoriteExpense {
  _id: string;
  userId?: string;
  name: string;
  amount: number;
  currency?: string;
  category: string;
  icon?: string;
  color?: string;
}

export { CATEGORIES } from "@/lib/constants";
