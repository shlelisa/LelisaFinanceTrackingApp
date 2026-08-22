import type { DashboardSummary, MonthlyReport, Transaction, TransactionType } from "../types/transaction";
import { getStoredTransactions, getStoredBudgets, getStoredGoals, getStoredFavorites, canonicalCategoryName } from "./localStorage";
import { formatCurrencyExact, getAppCurrency } from "../currency";

export interface PeriodRange {
  start: number;
  end: number;
}

export function monthRange(offsetFromNow = 0, reference = new Date()): PeriodRange {
  const y = reference.getFullYear();
  const m = reference.getMonth() + offsetFromNow;
  const start = new Date(y, m, 1).getTime();
  const end = new Date(y, m + 1, 0, 23, 59, 59, 999).getTime();
  return { start, end };
}

export function isInRange(t: Transaction, range: PeriodRange): boolean {
  const time = new Date(t.date).getTime();
  return time >= range.start && time <= range.end;
}

export function sumByType(transactions: Transaction[], type: TransactionType): number {
  return transactions
    .filter((t) => t.type === type)
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getCategoryTotals(
  transactions: Transaction[],
  type: TransactionType,
  range?: PeriodRange,
): Record<string, number> {
  const totals: Record<string, number> = {};
  transactions.forEach((t) => {
    if (t.type !== type) return;
    if (range && !isInRange(t, range)) return;
    const name = canonicalCategoryName(t.category) || "Other";
    totals[name] = (totals[name] || 0) + t.amount;
  });
  return totals;
}

export function getSpendForCategory(transactions: Transaction[], category: string, range?: PeriodRange): number {
  const target = canonicalCategoryName(category);
  return transactions.reduce((sum, t) => {
    if (t.type !== "expense") return sum;
    if (range && !isInRange(t, range)) return sum;
    if (canonicalCategoryName(t.category) !== target) return sum;
    return sum + t.amount;
  }, 0);
}

export function percentChange(current: number, previous: number): number | null {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) return null;
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / Math.abs(previous)) * 100);
}

export function estimateMonthlySavingsRate(): number {
  const transactions = getStoredTransactions();
  if (transactions.length === 0) return 0;
  const net =
    sumByType(transactions, "income") - sumByType(transactions, "expense");
  const earliest = transactions.reduce(
    (min, t) => Math.min(min, new Date(t.date).getTime()),
    Date.now(),
  );
  const monthsElapsed = Math.max(
    1,
    (Date.now() - earliest) / (1000 * 60 * 60 * 24 * 30.44),
  );
  return net / monthsElapsed;
}

export interface CategoryPeriodComparison {
  category: string;
  currentTotal: number;
  previousTotal: number;
  changePct: number | null;
}

export function compareCategorySpend(
  transactions: Transaction[],
  category: string,
  current: PeriodRange,
  previous: PeriodRange,
): CategoryPeriodComparison {
  const name = canonicalCategoryName(category) || "Other";
  const currentTotal = getSpendForCategory(transactions, name, current);
  const previousTotal = getSpendForCategory(transactions, name, previous);
  return {
    category: name,
    currentTotal,
    previousTotal,
    changePct: percentChange(currentTotal, previousTotal),
  };
}

export interface FavoriteStat {
  favoriteId: string;
  category: string;
  currentTotal: number;
  previousTotal: number;
  changePct: number | null;
}

export function computeFavoritesStats(): Record<string, FavoriteStat> {
  const favorites = getStoredFavorites();
  if (favorites.length === 0) return {};

  const transactions = getStoredTransactions();
  const thisMonth = monthRange(0);
  const lastMonth = monthRange(-1);

  const stats: Record<string, FavoriteStat> = {};
  favorites.forEach((fav) => {
    const comparison = compareCategorySpend(transactions, fav.category, thisMonth, lastMonth);
    stats[fav._id] = {
      favoriteId: fav._id,
      category: comparison.category,
      currentTotal: comparison.currentTotal,
      previousTotal: comparison.previousTotal,
      changePct: comparison.changePct,
    };
  });
  return stats;
}

export function computeDashboardSummary(): DashboardSummary {
  const transactions = getStoredTransactions();

  const totalIncome = sumByType(transactions, "income");
  const totalExpenses = sumByType(transactions, "expense");

  const totalAccountBalance = totalIncome - totalExpenses;

  const recentTransactions = transactions.slice(0, 5);

  const expenseMap = getCategoryTotals(transactions, "expense");

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

  const categoryMap = getCategoryTotals(
    transactions.filter((t) => new Date(t.date).getFullYear() === targetYear),
    "expense",
  );

  transactions.forEach((t) => {
    const d = new Date(t.date);
    if (d.getFullYear() === targetYear) {
      const m = d.getMonth();
      if (t.type === "income") {
        reportMap[m].income += t.amount;
      } else if (t.type === "expense") {
        reportMap[m].expense += t.amount;
      }
    }
  });

  const report = monthNames.map((month, idx) => ({
    month,
    income: reportMap[idx].income,
    expense: reportMap[idx].expense,
  }));

  const categoryBreakdown = Object.entries(categoryMap).map(([name, total]) => ({
    _id: name,
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

  const range: PeriodRange = { start: startD.getTime(), end: endD.getTime() };

  const filtered = transactions.filter((t) => isInRange(t, range));

  const categoryMap = getCategoryTotals(filtered, "expense");
  let totalIncome = sumByType(filtered, "income");
  let totalExpenses = sumByType(filtered, "expense");

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
  const categoryMap = getCategoryTotals(transactions, "expense");
  return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
}

export function computeInsights(): {
  insights: { type: "spending" | "budget" | "savings" | "trend"; message: string; severity: "info" | "warning" | "success" }[];
} {
  const transactions = getStoredTransactions();
  const budgets = getStoredBudgets();
  const goals = getStoredGoals();
  const currency = getAppCurrency();

  const insights: { type: "spending" | "budget" | "savings" | "trend"; message: string; severity: "info" | "warning" | "success" }[] = [];

  budgets.forEach((b) => {
    if (b.limitAmount <= 0) return;
    if (b.spent > b.limitAmount) {
      insights.push({
        type: "budget",
        message: `You have exceeded your ${b.category} budget by ${formatCurrencyExact(b.spent - b.limitAmount, currency)}!`,
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

  goals.forEach((g) => {
    if (g.targetAmount <= 0) return;
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

  const totalIncome = sumByType(transactions, "income");
  const totalExpenses = sumByType(transactions, "expense");

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

  const totalIncome = sumByType(transactions, "income");
  const totalExpense = sumByType(transactions, "expense");

  // 1. Savings Rate (30 pts max)
  let savingsRate = 0;
  if (totalIncome > 0) {
    savingsRate = Math.max(0, ((totalIncome - totalExpense) / totalIncome) * 100);
  }
  const savingsScore = Math.min(30, (savingsRate / 20) * 30);

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
  const debtScore = 20;

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

  const monthlySavingsRate = estimateMonthlySavingsRate();
  const forecasts: Record<string, string> = {};

  goals.forEach((g) => {
    const remaining = g.targetAmount - g.currentAmount;
    if (remaining <= 0) {
      forecasts[g._id] = "Goal Achieved!";
    } else if (monthlySavingsRate <= 0) {
      forecasts[g._id] = "Increase your monthly savings to reach this goal";
    } else {
      const months = Math.ceil(remaining / monthlySavingsRate);
      forecasts[g._id] = `At current rate, achieved in ~${months} ${months === 1 ? "month" : "months"}`;
    }
  });

  return forecasts;
}

export interface SmartStatistics {
  topCategoryComparison: CategoryPeriodComparison | null;
  weekendPercentage: number;
  largestExpense: { description: string; amount: number } | null;
  projectedMonthEnd: number;
  currentMonthExpenses: number;
  currentMonthIncome: number;
}

export function computeSmartStatistics(): SmartStatistics {
  const transactions = getStoredTransactions();
  const thisMonth = monthRange(0);
  const lastMonth = monthRange(-1);

  const expensesThisMonth = transactions.filter(
    (t) => t.type === "expense" && isInRange(t, thisMonth),
  );
  const incomeThisMonth = sumByType(
    transactions.filter((t) => t.type === "income" && isInRange(t, thisMonth)),
    "income",
  );
  const totalExpensesThisMonth = expensesThisMonth.reduce((s, t) => s + t.amount, 0);

  const weekendExpensesThisMonth = expensesThisMonth
    .filter((t) => {
      const day = new Date(t.date).getDay();
      return day === 0 || day === 6;
    })
    .reduce((s, t) => s + t.amount, 0);

  const largestExpenseThisMonth = expensesThisMonth.reduce<{ description: string; amount: number } | null>(
    (largest, t) =>
      !largest || t.amount > largest.amount
        ? { description: t.description, amount: t.amount }
        : largest,
    null,
  );

  const thisMonthTotals = getCategoryTotals(transactions, "expense", thisMonth);
  const lastMonthTotals = getCategoryTotals(transactions, "expense", lastMonth);

  let topCategoryComparison: CategoryPeriodComparison | null = null;
  const topEntry = Object.entries(thisMonthTotals).sort((a, b) => b[1] - a[1])[0];
  if (topEntry) {
    const [category, currentTotal] = topEntry;
    const previousTotal = lastMonthTotals[category] || 0;
    topCategoryComparison = {
      category,
      currentTotal,
      previousTotal,
      changePct: percentChange(currentTotal, previousTotal),
    };
  }

  const weekendPercentage =
    totalExpensesThisMonth > 0
      ? Math.round((weekendExpensesThisMonth / totalExpensesThisMonth) * 100)
      : 0;

  return {
    topCategoryComparison,
    weekendPercentage,
    largestExpense: largestExpenseThisMonth,
    projectedMonthEnd: incomeThisMonth - totalExpensesThisMonth,
    currentMonthExpenses: totalExpensesThisMonth,
    currentMonthIncome: incomeThisMonth,
  };
}
