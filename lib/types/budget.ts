export const BUDGET_PERIODS = ["daily", "weekly", "monthly", "quarterly", "yearly"] as const;

export type BudgetPeriod = (typeof BUDGET_PERIODS)[number];

export type Budget = {
  _id: string;
  userId: string;
  category: string;
  period: BudgetPeriod;
  limitAmount: number;
  spent: number;
  remaining: number;
  createdAt: string;
  updatedAt: string;
};
