import type { DashboardSummary, MonthlyReport } from "../types/transaction";
import { getStoredTransactions, getStoredBudgets, getStoredGoals } from "./localStorage";

export function computeDashboardSummary(): DashboardSummary {
  const transactions = getStoredTransactions();

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const recentTransactions = transactions.slice(0, 5);

  // Group expenses by category
  const expenseMap: Record<string, number> = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      expenseMap[t.category] = (expenseMap[t.category] || 0) + t.amount;
    });

  const expenseBreakdown = Object.entries(expenseMap).map(([name, value]) => ({
    name,
    value,
  }));

  return {
    balance,
    totalIncome,
    totalExpenses,
    recentTransactions,
    expenseBreakdown,
  };
}

export function computeMonthlyReport(year?: number): MonthlyReport {
  const transactions = getStoredTransactions();
  const targetYear = year || new Date().getFullYear();

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const reportMap: Record<number, { income: number; expense: number }> = {};
  for (let m = 0; m < 12; m++) {
    reportMap[m] = { income: 0, expense: 0 };
  }

  const categoryMap: Record<string, number> = {};

  transactions.forEach((t) => {
    const d = new Date(t.date);
    if (d.getFullYear() === targetYear) {
      const m = d.getMonth();
      if (t.type === "income") {
        reportMap[m].income += t.amount;
      } else {
        reportMap[m].expense += t.amount;
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
      }
    }
  });

  const report = monthNames.map((month, idx) => ({
    month,
    income: reportMap[idx].income,
    expense: reportMap[idx].expense,
  }));

  const categoryBreakdown = Object.entries(categoryMap).map(([_id, total]) => ({
    _id,
    total,
  }));

  return {
    report,
    categoryBreakdown,
  };
}

export function computeCategoryBreakdown(): { name: string; value: number }[] {
  const transactions = getStoredTransactions();
  const categoryMap: Record<string, number> = {};

  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

  return Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
  }));
}

export function computeInsights(): {
  insights: { type: "spending" | "budget" | "savings" | "trend"; message: string; severity: "info" | "warning" | "success" }[];
} {
  const transactions = getStoredTransactions();
  const budgets = getStoredBudgets();
  const goals = getStoredGoals();

  const insights: { type: "spending" | "budget" | "savings" | "trend"; message: string; severity: "info" | "warning" | "success" }[] = [];

  // Check budgets
  budgets.forEach((b) => {
    if (b.spent > b.limitAmount) {
      insights.push({
        type: "budget",
        message: `You have exceeded your ${b.category} budget by $${(b.spent - b.limitAmount).toFixed(2)}!`,
        severity: "warning",
      });
    } else if (b.spent >= b.limitAmount * 0.8) {
      insights.push({
        type: "budget",
        message: `You have used ${Math.round((b.spent / b.limitAmount) * 100)}% of your ${b.category} budget.`,
        severity: "info",
      });
    }
  });

  // Check goals
  goals.forEach((g) => {
    const progress = Math.round((g.currentAmount / g.targetAmount) * 100);
    if (progress >= 100) {
      insights.push({
        type: "savings",
        message: `Congratulations! You've achieved 100% of your savings goal: "${g.name}".`,
        severity: "success",
      });
    } else if (progress >= 50) {
      insights.push({
        type: "savings",
        message: `Great progress! You are ${progress}% of the way to achieving "${g.name}".`,
        severity: "info",
      });
    }
  });

  // Overall financial summary insight
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  if (totalIncome > 0 && totalExpenses / totalIncome < 0.7) {
    insights.push({
      type: "trend",
      message: "Healthy savings rate! You are spending less than 70% of your total income.",
      severity: "success",
    });
  } else if (totalExpenses > totalIncome && totalIncome > 0) {
    insights.push({
      type: "spending",
      message: "Warning: Total expenses exceed income for this period.",
      severity: "warning",
    });
  }

  if (insights.length === 0) {
    insights.push({
      type: "spending",
      message: "Keep adding transactions to receive personalized financial insights.",
      severity: "info",
    });
  }

  return { insights };
}
