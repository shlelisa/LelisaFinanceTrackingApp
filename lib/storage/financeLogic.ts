import type { DashboardSummary, MonthlyReport } from "../types/transaction";
import { getStoredTransactions, getStoredBudgets, getStoredGoals, canonicalCategoryName } from "./localStorage";

export function computeDashboardSummary(): DashboardSummary {
  const transactions = getStoredTransactions();

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalAccountBalance = totalIncome - totalExpenses;

  const recentTransactions = transactions.slice(0, 5);

  // Group expenses by category
  const expenseMap: Record<string, number> = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      const name = canonicalCategoryName(t.category);
      expenseMap[name] = (expenseMap[name] || 0) + t.amount;
    });

  const expenseBreakdown = Object.entries(expenseMap).map(([name, value]) => ({
    name,
    value,
  }));

  return {
    balance: totalAccountBalance,
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
      } else if (t.type === "expense") {
        reportMap[m].expense += t.amount;
        const name = canonicalCategoryName(t.category);
        categoryMap[name] = (categoryMap[name] || 0) + t.amount;
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

export function computeReportRange(startDate: string, endDate: string, groupBy: string = "daily") {
  const transactions = getStoredTransactions();

  const startD = startDate ? new Date(startDate) : new Date(0);
  startD.setHours(0, 0, 0, 0);

  const endD = endDate ? new Date(endDate) : new Date(Date.now() + 86400000);
  endD.setHours(23, 59, 59, 999);

  const start = startD.getTime();
  const end = endD.getTime();

  const filtered = transactions.filter((t) => {
    const time = new Date(t.date).getTime();
    return time >= start && time <= end;
  });

  const categoryMap: Record<string, number> = {};
  let totalIncome = 0;
  let totalExpenses = 0;

  filtered.forEach((t) => {
    if (t.type === "income") {
      totalIncome += t.amount;
    } else if (t.type === "expense") {
      totalExpenses += t.amount;
      const name = canonicalCategoryName(t.category);
      categoryMap[name] = (categoryMap[name] || 0) + t.amount;
    }
  });

  const trendMap: Record<string, { income: number; expense: number }> = {};
  filtered.forEach((t) => {
    const d = new Date(t.date);
    const label = groupBy === "monthly"
      ? d.toLocaleDateString("en-US", { month: "short", year: "numeric" })
      : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    if (!trendMap[label]) trendMap[label] = { income: 0, expense: 0 };
    if (t.type === "income") trendMap[label].income += t.amount;
    else if (t.type === "expense") trendMap[label].expense += t.amount;
  });

  const report = Object.entries(trendMap).map(([label, val]) => ({
    label,
    income: val.income,
    expense: val.expense,
  }));

  const categoryBreakdown = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
  }));

  return {
    summary: { totalIncome, totalExpenses, balance: totalIncome - totalExpenses },
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
      const name = canonicalCategoryName(t.category);
      categoryMap[name] = (categoryMap[name] || 0) + t.amount;
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

export function computeFinancialHealthScore(): {
  score: number; // 0 to 100
  savingsRate: number;
  budgetAdherence: number;
  expenseToIncomeRatio: number;
  debtRatio: number;
  tips: string[];
} {
  const transactions = getStoredTransactions();
  const budgets = getStoredBudgets();

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  // 1. Savings Rate (30 pts max)
  let savingsRate = 0;
  if (totalIncome > 0) {
    savingsRate = Math.max(0, ((totalIncome - totalExpense) / totalIncome) * 100);
  }
  const savingsScore = Math.min(30, (savingsRate / 20) * 30); // 20% savings rate gives full 30 pts

  // 2. Budget Adherence (30 pts max)
  let budgetAdherence = 100;
  if (budgets.length > 0) {
    const underBudgetCount = budgets.filter((b) => b.spent <= b.limitAmount).length;
    budgetAdherence = (underBudgetCount / budgets.length) * 100;
  }
  const budgetScore = (budgetAdherence / 100) * 30;

  // 3. Expense to Income Ratio (20 pts max)
  let expenseToIncomeRatio = 0;
  if (totalIncome > 0) {
    expenseToIncomeRatio = (totalExpense / totalIncome) * 100;
  }
  let ratioScore = 20;
  if (expenseToIncomeRatio > 80) ratioScore = 5;
  else if (expenseToIncomeRatio > 60) ratioScore = 12;
  else if (expenseToIncomeRatio > 40) ratioScore = 17;

  // 4. Debt/Liquidity Ratio (20 pts max)
  const debtScore = 20; // Default good standing

  const totalScore = Math.round(savingsScore + budgetScore + ratioScore + debtScore);
  const score = Math.min(100, Math.max(0, totalScore));

  const tips: string[] = [];
  if (savingsRate < 20) tips.push("Try to save at least 20% of your income each month.");
  if (budgetAdherence < 100) tips.push("Review categories where budget limits were exceeded.");
  if (expenseToIncomeRatio > 70) tips.push("Your expenses account for over 70% of your income. Look for recurring non-essential expenses to trim.");
  if (tips.length === 0) tips.push("Excellent financial management! Keep maintaining your savings habits.");

  return {
    score,
    savingsRate: Math.round(savingsRate),
    budgetAdherence: Math.round(budgetAdherence),
    expenseToIncomeRatio: Math.round(expenseToIncomeRatio),
    debtRatio: 0,
    tips,
  };
}

export function computeGoalForecasts(): Record<string, string> {
  const goals = getStoredGoals();
  const transactions = getStoredTransactions();

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const monthlySavingsRate = Math.max(100, totalIncome - totalExpense); // Default monthly rate estimate
  const forecasts: Record<string, string> = {};

  goals.forEach((g) => {
    const remaining = g.targetAmount - g.currentAmount;
    if (remaining <= 0) {
      forecasts[g._id] = "Goal Achieved!";
    } else {
      const months = Math.ceil(remaining / monthlySavingsRate);
      forecasts[g._id] = `At current rate, achieved in ~${months} ${months === 1 ? "month" : "months"}`;
    }
  });

  return forecasts;
}

export function computeSmartStatistics() {
  const transactions = getStoredTransactions();
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  // 1. Food comparison between this month & last month
  let thisMonthFood = 0;
  let lastMonthFood = 0;

  let totalExpensesThisMonth = 0;
  let weekendExpensesThisMonth = 0;
  let largestExpenseThisMonth: { description: string; amount: number } | null = null;

  transactions.forEach((t) => {
    const d = new Date(t.date);
    const m = d.getMonth();
    const y = d.getFullYear();

    if (t.type === "expense") {
      if (m === currentMonth && y === currentYear) {
        totalExpensesThisMonth += t.amount;

        const day = d.getDay();
        if (day === 0 || day === 6) {
          weekendExpensesThisMonth += t.amount;
        }

        if (t.category.toLowerCase().includes("food") || t.category.toLowerCase().includes("dining")) {
          thisMonthFood += t.amount;
        }

        if (!largestExpenseThisMonth || t.amount > largestExpenseThisMonth.amount) {
          largestExpenseThisMonth = { description: t.description, amount: t.amount };
        }
      } else if (m === prevMonth && y === prevMonthYear) {
        if (t.category.toLowerCase().includes("food") || t.category.toLowerCase().includes("dining")) {
          lastMonthFood += t.amount;
        }
      }
    }
  });

  let foodComparison: number | null = null;
  if (lastMonthFood > 0 && thisMonthFood > 0) {
    foodComparison = Math.round(((thisMonthFood - lastMonthFood) / lastMonthFood) * 100);
  }

  const weekendPercentage =
    totalExpensesThisMonth > 0
      ? Math.round((weekendExpensesThisMonth / totalExpensesThisMonth) * 100)
      : 0;

  const totalIncomeThisMonth = transactions
    .filter((t) => {
      const d = new Date(t.date);
      return t.type === "income" && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((s, t) => s + t.amount, 0);

  const projectedMonthEnd = totalIncomeThisMonth - totalExpensesThisMonth;

  return {
    foodComparison,
    weekendPercentage,
    largestExpense: largestExpenseThisMonth,
    projectedMonthEnd,
  };
}
