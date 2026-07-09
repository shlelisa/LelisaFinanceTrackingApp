export type Transaction = {
  _id: string;
  userId: string;
  type: "income" | "expense";
  amount: number;
  currency: string;
  originalAmount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateTransactionInput = {
  type: "income" | "expense";
  amount: number;
  currency?: string;
  category: string;
  description: string;
  date?: string;
};

export type UpdateTransactionInput = Partial<CreateTransactionInput>;

export type TransactionFilters = {
  search?: string;
  type?: "income" | "expense";
  category?: string;
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

export { CATEGORIES } from "@/lib/constants";
