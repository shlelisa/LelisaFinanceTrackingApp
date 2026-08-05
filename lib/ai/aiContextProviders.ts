import { getStoredTransactions, getStoredAccounts, getStoredBudgets, getStoredGoals, getStoredDebts, getStoredBills, getStoredUser } from "../storage/localStorage";
import type { Transaction } from "../types/transaction";
import type { Account } from "../types/account";
import type { Budget } from "../types/budget";
import type { Goal } from "../types/goal";

export interface TransactionVelocityContext {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRatePercentage: number;
  expenseCategoryBreakdown: Record<string, number>;
  incomeCategoryBreakdown: Record<string, number>;
  topMerchants: { description: string; totalAmount: number; count: number }[];
  weekendExpensePercentage: number;
}

export interface AccountLiquidityContext {
  totalLiquidity: number;
  accountsSummary: { name: string; type: string; balance: number; currency: string }[];
}

export interface BudgetRiskContext {
  budgets: { category: string; limit: number; spent: number; remaining: number; riskLevel: "safe" | "warning" | "exceeded" }[];
  overallAdherenceRate: number;
}

export interface GoalVelocityContext {
  goals: { name: string; target: number; current: number; percentage: number; estimatedMonthsToComplete: number }[];
}

export interface FinancialAIContext {
  timestamp: string;
  currency: string;
  userProfile: {
    fullName: string;
    email: string;
    phone: string;
    role: string;
  };
  liquidity: AccountLiquidityContext;
  transactionVelocity: TransactionVelocityContext;
  budgetRisk: BudgetRiskContext;
  goalVelocity: GoalVelocityContext;
  rawTransactionsCount: number;
}

export function getFullAIContext(baseCurrency: string = "USD"): FinancialAIContext {
  const user = getStoredUser();
  const transactions = getStoredTransactions();
  const accounts = getStoredAccounts();
  const budgets = getStoredBudgets();
  const goals = getStoredGoals();

  // 1. Liquidity Context
  const accountsSummary = accounts.map((a) => ({
    name: a.name,
    type: a.type,
    balance: a.balance,
    currency: a.currency,
  }));
  const totalLiquidity = accounts.reduce((sum, a) => sum + a.balance, 0);

  // 2. Transaction Velocity Context
  let totalIncome = 0;
  let totalExpenses = 0;
  const expenseCategoryBreakdown: Record<string, number> = {};
  const incomeCategoryBreakdown: Record<string, number> = {};
  const merchantMap: Record<string, { totalAmount: number; count: number }> = {};
  let weekendExpenses = 0;

  transactions.forEach((t) => {
    const d = new Date(t.date);
    if (t.type === "income") {
      totalIncome += t.amount;
      incomeCategoryBreakdown[t.category] = (incomeCategoryBreakdown[t.category] || 0) + t.amount;
    } else if (t.type === "expense") {
      totalExpenses += t.amount;
      expenseCategoryBreakdown[t.category] = (expenseCategoryBreakdown[t.category] || 0) + t.amount;

      const descKey = t.description.trim().toLowerCase();
      if (!merchantMap[descKey]) {
        merchantMap[descKey] = { totalAmount: 0, count: 0 };
      }
      merchantMap[descKey].totalAmount += t.amount;
      merchantMap[descKey].count += 1;

      const day = d.getDay();
      if (day === 0 || day === 6) {
        weekendExpenses += t.amount;
      }
    }
  });

  const netSavings = totalIncome - totalExpenses;
  const savingsRatePercentage = totalIncome > 0 ? Math.max(0, Math.round((netSavings / totalIncome) * 100)) : 0;
  const weekendExpensePercentage = totalExpenses > 0 ? Math.round((weekendExpenses / totalExpenses) * 100) : 0;

  const topMerchants = Object.entries(merchantMap)
    .map(([desc, data]) => ({ description: desc, totalAmount: data.totalAmount, count: data.count }))
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 5);

  // 3. Budget Risk Context
  const budgetList = budgets.map((b) => {
    const remaining = b.limitAmount - b.spent;
    let riskLevel: "safe" | "warning" | "exceeded" = "safe";
    if (b.spent > b.limitAmount) riskLevel = "exceeded";
    else if (b.spent >= b.limitAmount * 0.8) riskLevel = "warning";

    return {
      category: b.category,
      limit: b.limitAmount,
      spent: b.spent,
      remaining,
      riskLevel,
    };
  });

  const safeBudgets = budgetList.filter((b) => b.riskLevel !== "exceeded").length;
  const overallAdherenceRate = budgetList.length > 0 ? Math.round((safeBudgets / budgetList.length) * 100) : 100;

  // 4. Goal Velocity Context
  const monthlyRate = Math.max(100, netSavings);
  const goalList = goals.map((g) => {
    const pct = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
    const remaining = g.targetAmount - g.currentAmount;
    const estimatedMonthsToComplete = remaining <= 0 ? 0 : Math.ceil(remaining / monthlyRate);

    return {
      name: g.name,
      target: g.targetAmount,
      current: g.currentAmount,
      percentage: pct,
      estimatedMonthsToComplete,
    };
  });

  return {
    timestamp: new Date().toISOString(),
    currency: baseCurrency,
    userProfile: {
      fullName: user.fullName || "User",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "user",
    },
    liquidity: {
      totalLiquidity,
      accountsSummary,
    },
    transactionVelocity: {
      totalIncome,
      totalExpenses,
      netSavings,
      savingsRatePercentage,
      expenseCategoryBreakdown,
      incomeCategoryBreakdown,
      topMerchants,
      weekendExpensePercentage,
    },
    budgetRisk: {
      budgets: budgetList,
      overallAdherenceRate,
    },
    goalVelocity: {
      goals: goalList,
    },
    rawTransactionsCount: transactions.length,
  };
}
