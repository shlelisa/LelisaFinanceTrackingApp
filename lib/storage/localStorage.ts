import type { Transaction, CreateTransactionInput, UpdateTransactionInput, TransactionFilters, FavoriteExpense } from "../types/transaction";
import type { Budget } from "../types/budget";
import type { CreateBudgetInput, UpdateBudgetInput } from "../validation/budget";
import type { Goal } from "../types/goal";
import type { CreateGoalInput, UpdateGoalInput } from "../validation/goal";
import type { RecurringTransaction } from "../types/recurring";
import type { CreateRecurringInput, UpdateRecurringInput } from "../validation/recurring";
import type { Account, CreateAccountInput, UpdateAccountInput } from "../types/account";
import type { Bill, CreateBillInput, UpdateBillInput } from "../types/bill";
import type { Debt, CreateDebtInput, UpdateDebtInput } from "../types/debt";
import type { CustomCategory, CreateCategoryInput, UpdateCategoryInput } from "../types/category";
import type { User, AuthResponse } from "../types/api";

const KEYS = {
  TRANSACTIONS: "pft_offline_transactions",
  BUDGETS: "pft_offline_budgets",
  GOALS: "pft_offline_goals",
  RECURRING: "pft_offline_recurring",
  ACCOUNTS: "pft_offline_accounts",
  BILLS: "pft_offline_bills",
  DEBTS: "pft_offline_debts",
  CATEGORIES: "pft_offline_categories",
  FAVORITES: "pft_offline_favorites",
  EXCHANGE_RATES: "pft_offline_exchange_rates",
  PIN: "pft_security_pin",
  USER: "auth_user",
  TOKEN: "auth_token",
  REGISTERED_USERS: "pft_registered_users",
  PREFERENCES: "pft_user_preferences",
};

export const generateId = (): string =>
  "local_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage`, e);
  }
}

// Initial Seed Data for first run
function initializeSeedData() {
  if (typeof window === "undefined") return;

  if (!localStorage.getItem(KEYS.REGISTERED_USERS)) {
    const defaultUsers: User[] = [
      {
        id: "local_user_1",
        fullName: "Lelisa Finance Tracking",
        email: "lelisa@local.app",
        phone: "0969642103",
        role: "user",
      },
      {
        id: "local_user_2",
        fullName: "Local Standard User",
        email: "user@local.app",
        phone: "0911223344",
        role: "user",
      },
    ];
    setItem(KEYS.REGISTERED_USERS, defaultUsers);
  }

  if (!localStorage.getItem(KEYS.TRANSACTIONS)) {
    const today = new Date();
    const nowISO = today.toISOString();

    const initialTransactions: Transaction[] = [
      {
        _id: generateId(),
        userId: "local_user_1",
        type: "income",
        amount: 3500,
        currency: "USD",
        originalAmount: 3500,
        category: "Salary",
        description: "Monthly Salary Deposit",
        date: new Date(today.getFullYear(), today.getMonth(), 1).toISOString(),
        createdAt: nowISO,
        updatedAt: nowISO,
      },
      {
        _id: generateId(),
        userId: "local_user_1",
        type: "expense",
        amount: 450,
        currency: "USD",
        originalAmount: 450,
        category: "Food & Dining",
        description: "Supermarket & Groceries",
        date: new Date(today.getFullYear(), today.getMonth(), 5).toISOString(),
        createdAt: nowISO,
        updatedAt: nowISO,
      },
      {
        _id: generateId(),
        userId: "local_user_1",
        type: "expense",
        amount: 120,
        currency: "USD",
        originalAmount: 120,
        category: "Utilities",
        description: "Electricity & Water Bill",
        date: new Date(today.getFullYear(), today.getMonth(), 10).toISOString(),
        createdAt: nowISO,
        updatedAt: nowISO,
      },
      {
        _id: generateId(),
        userId: "local_user_1",
        type: "expense",
        amount: 85,
        currency: "USD",
        originalAmount: 85,
        category: "Entertainment",
        description: "Streaming Services & Cinema",
        date: new Date(today.getFullYear(), today.getMonth(), 12).toISOString(),
        createdAt: nowISO,
        updatedAt: nowISO,
      },
      {
        _id: generateId(),
        userId: "local_user_1",
        type: "expense",
        amount: 60,
        currency: "USD",
        originalAmount: 60,
        category: "Transportation",
        description: "Gas & Parking",
        date: new Date(today.getFullYear(), today.getMonth(), 14).toISOString(),
        createdAt: nowISO,
        updatedAt: nowISO,
      },
    ];
    setItem(KEYS.TRANSACTIONS, initialTransactions);
  }

  if (!localStorage.getItem(KEYS.BUDGETS)) {
    const nowISO = new Date().toISOString();
    const initialBudgets: Budget[] = [
      {
        _id: generateId(),
        userId: "local_user_1",
        category: "Food & Dining",
        limitAmount: 600,
        spent: 450,
        remaining: 150,
        createdAt: nowISO,
        updatedAt: nowISO,
      },
      {
        _id: generateId(),
        userId: "local_user_1",
        category: "Utilities",
        limitAmount: 200,
        spent: 120,
        remaining: 80,
        createdAt: nowISO,
        updatedAt: nowISO,
      },
      {
        _id: generateId(),
        userId: "local_user_1",
        category: "Entertainment",
        limitAmount: 150,
        spent: 85,
        remaining: 65,
        createdAt: nowISO,
        updatedAt: nowISO,
      },
    ];
    setItem(KEYS.BUDGETS, initialBudgets);
  }

  if (!localStorage.getItem(KEYS.GOALS)) {
    const nowISO = new Date().toISOString();
    const initialGoals: Goal[] = [
      {
        _id: generateId(),
        userId: "local_user_1",
        name: "Emergency Savings Fund",
        targetAmount: 5000,
        currentAmount: 2200,
        deadline: new Date(new Date().getFullYear(), 11, 31).toISOString(),
        category: "Savings",
        createdAt: nowISO,
        updatedAt: nowISO,
      },
      {
        _id: generateId(),
        userId: "local_user_1",
        name: "Vacation Fund",
        targetAmount: 1500,
        currentAmount: 650,
        deadline: new Date(new Date().getFullYear() + 1, 5, 30).toISOString(),
        category: "Travel",
        createdAt: nowISO,
        updatedAt: nowISO,
      },
    ];
    setItem(KEYS.GOALS, initialGoals);
  }

  if (!localStorage.getItem(KEYS.RECURRING)) {
    const nowISO = new Date().toISOString();
    const initialRecurring: RecurringTransaction[] = [
      {
        _id: generateId(),
        userId: "local_user_1",
        type: "income",
        amount: 3500,
        category: "Salary",
        description: "Monthly Employer Salary",
        frequency: "monthly",
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
        nextDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
        isActive: true,
        createdAt: nowISO,
        updatedAt: nowISO,
      },
      {
        _id: generateId(),
        userId: "local_user_1",
        type: "expense",
        amount: 15,
        category: "Entertainment",
        description: "Monthly Subscription",
        frequency: "monthly",
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 15).toISOString(),
        nextDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 15).toISOString(),
        isActive: true,
        createdAt: nowISO,
        updatedAt: nowISO,
      },
    ];
    setItem(KEYS.RECURRING, initialRecurring);
  }

  if (!localStorage.getItem(KEYS.ACCOUNTS)) {
    const nowISO = new Date().toISOString();
    const initialAccounts: Account[] = [
      {
        _id: "acc_1",
        userId: "local_user_1",
        name: "Main Cash Wallet",
        type: "cash",
        balance: 450,
        currency: "USD",
        color: "#10b981",
        icon: "Wallet",
        createdAt: nowISO,
        updatedAt: nowISO,
      },
      {
        _id: "acc_2",
        userId: "local_user_1",
        name: "Bank Checking Account",
        type: "bank",
        balance: 3200,
        currency: "USD",
        color: "#3b82f6",
        icon: "Building2",
        createdAt: nowISO,
        updatedAt: nowISO,
      },
      {
        _id: "acc_3",
        userId: "local_user_1",
        name: "Rewards Credit Card",
        type: "credit_card",
        balance: -250,
        currency: "USD",
        color: "#ef4444",
        icon: "CreditCard",
        createdAt: nowISO,
        updatedAt: nowISO,
      },
      {
        _id: "acc_4",
        userId: "local_user_1",
        name: "Mobile Money",
        type: "mobile_money",
        balance: 890,
        currency: "ETB",
        color: "#8b5cf6",
        icon: "Smartphone",
        createdAt: nowISO,
        updatedAt: nowISO,
      },
    ];
    setItem(KEYS.ACCOUNTS, initialAccounts);
  }

  if (!localStorage.getItem(KEYS.BILLS)) {
    const nowISO = new Date().toISOString();
    const initialBills: Bill[] = [
      {
        _id: generateId(),
        userId: "local_user_1",
        name: "Electricity Bill",
        category: "Utilities",
        amount: 80,
        currency: "USD",
        dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 25).toISOString().split("T")[0],
        repeatMonthly: true,
        status: "unpaid",
        reminderEnabled: true,
        createdAt: nowISO,
        updatedAt: nowISO,
      },
      {
        _id: generateId(),
        userId: "local_user_1",
        name: "High-Speed Internet",
        category: "Utilities",
        amount: 55,
        currency: "USD",
        dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 18).toISOString().split("T")[0],
        repeatMonthly: true,
        status: "paid",
        reminderEnabled: true,
        createdAt: nowISO,
        updatedAt: nowISO,
      },
    ];
    setItem(KEYS.BILLS, initialBills);
  }

  if (!localStorage.getItem(KEYS.DEBTS)) {
    const nowISO = new Date().toISOString();
    const initialDebts: Debt[] = [
      {
        _id: generateId(),
        userId: "local_user_1",
        type: "lent",
        person: "John Doe",
        totalAmount: 300,
        remainingBalance: 150,
        currency: "USD",
        dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().split("T")[0],
        notes: "Lent money for emergency laptop repair",
        createdAt: nowISO,
        updatedAt: nowISO,
      },
      {
        _id: generateId(),
        userId: "local_user_1",
        type: "loan",
        person: "National Bank Loan",
        totalAmount: 2000,
        remainingBalance: 1200,
        currency: "USD",
        interestRate: 4.5,
        dueDate: new Date(new Date().getFullYear() + 1, 0, 15).toISOString().split("T")[0],
        notes: "Personal loan for home renovation",
        createdAt: nowISO,
        updatedAt: nowISO,
      },
    ];
    setItem(KEYS.DEBTS, initialDebts);
  }

  if (!localStorage.getItem(KEYS.CATEGORIES)) {
    const nowISO = new Date().toISOString();
    const initialCategories: CustomCategory[] = [
      { _id: "cat_1", userId: "local_user_1", name: "Salary", type: "income", color: "#10b981", icon: "Briefcase", isDefault: true, createdAt: nowISO },
      { _id: "cat_2", userId: "local_user_1", name: "Business", type: "income", color: "#06b6d4", icon: "Building", isDefault: true, createdAt: nowISO },
      { _id: "cat_3", userId: "local_user_1", name: "Gift", type: "income", color: "#ec4899", icon: "Gift", isDefault: true, createdAt: nowISO },
      { _id: "cat_4", userId: "local_user_1", name: "Food & Dining", type: "expense", color: "#f59e0b", icon: "Utensils", isDefault: true, createdAt: nowISO },
      { _id: "cat_5", userId: "local_user_1", name: "Transportation", type: "expense", color: "#3b82f6", icon: "Car", isDefault: true, createdAt: nowISO },
      { _id: "cat_6", userId: "local_user_1", name: "Shopping", type: "expense", color: "#a855f7", icon: "ShoppingBag", isDefault: true, createdAt: nowISO },
      { _id: "cat_7", userId: "local_user_1", name: "Utilities", type: "expense", color: "#ef4444", icon: "Zap", isDefault: true, createdAt: nowISO },
      { _id: "cat_8", userId: "local_user_1", name: "Rent", type: "expense", color: "#64748b", icon: "Home", isDefault: true, createdAt: nowISO },
      { _id: "cat_9", userId: "local_user_1", name: "Health", type: "expense", color: "#14b8a6", icon: "Activity", isDefault: true, createdAt: nowISO },
      { _id: "cat_10", userId: "local_user_1", name: "Entertainment", type: "expense", color: "#8b5cf6", icon: "Film", isDefault: true, createdAt: nowISO },
    ];
    setItem(KEYS.CATEGORIES, initialCategories);
  }

  if (!localStorage.getItem(KEYS.FAVORITES)) {
    const initialFavorites: FavoriteExpense[] = [
      { _id: "fav_1", name: "Coffee", amount: 4.5, category: "Food & Dining", icon: "Coffee", color: "#f59e0b" },
      { _id: "fav_2", name: "Taxi Ride", amount: 15, category: "Transportation", icon: "Car", color: "#3b82f6" },
      { _id: "fav_3", name: "Quick Lunch", amount: 12, category: "Food & Dining", icon: "Utensils", color: "#10b981" },
    ];
    setItem(KEYS.FAVORITES, initialFavorites);
  }
}

// Auto-run seed data initialization
if (typeof window !== "undefined") {
  initializeSeedData();
}

// Admin Target User Filter State
export function getAdminTargetUserId(): string {
  if (typeof window === "undefined") return "all";
  return localStorage.getItem("pft_admin_target_user_id") || "all";
}

export function setAdminTargetUserId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("pft_admin_target_user_id", id);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("admin-user-filter-changed"));
  }
}

export function getRegisteredUsersList(): User[] {
  initializeSeedData();
  const registered = getItem<User[]>(KEYS.REGISTERED_USERS, []);
  if (registered.length === 0) {
    const current = getStoredUser();
    return [current];
  }
  return registered;
}

// Helper to get active session user context
function getCurrentUserContext(): User {
  return getStoredUser();
}

// --- TRANSACTIONS STORAGE WITH ROLE ISOLATION & ADMIN TARGET FILTER ---
export function getStoredTransactions(filters?: TransactionFilters): Transaction[] {
  initializeSeedData();
  let list: Transaction[] = getItem(KEYS.TRANSACTIONS, []);
  const currentUser = getCurrentUserContext();

  // Strict Role Isolation: Admin sees all records or specific target user; User sees ONLY their own records
  if (currentUser.role === "admin") {
    const targetId = getAdminTargetUserId();
    if (targetId && targetId !== "all") {
      list = list.filter((t) => t.userId === targetId);
    }
  } else {
    list = list.filter((t) => t.userId === currentUser.id);
  }

  if (filters) {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }
    if (filters.type) {
      list = list.filter((t) => t.type === filters.type);
    }
    if (filters.category) {
      list = list.filter((t) => t.category === filters.category);
    }
    if (filters.startDate) {
      const s = new Date(filters.startDate).getTime();
      list = list.filter((t) => new Date(t.date).getTime() >= s);
    }
    if (filters.endDate) {
      const e = new Date(filters.endDate).getTime();
      list = list.filter((t) => new Date(t.date).getTime() <= e);
    }
  }

  // Default sort by date descending
  list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return list;
}

export function getStoredTransactionById(id: string): Transaction | undefined {
  const list = getStoredTransactions();
  return list.find((t) => t._id === id);
}

export function saveStoredTransaction(input: CreateTransactionInput): Transaction {
  const allList = getItem<Transaction[]>(KEYS.TRANSACTIONS, []);
  const currentUser = getCurrentUserContext();
  const nowISO = new Date().toISOString();

  const newTx: Transaction = {
    _id: generateId(),
    userId: currentUser.id,
    type: input.type,
    amount: input.amount,
    currency: input.currency || "USD",
    originalAmount: input.amount,
    category: input.category,
    description: input.description,
    date: input.date ? new Date(input.date).toISOString() : nowISO,
    time: input.time,
    accountId: input.accountId,
    toAccountId: input.toAccountId,
    paymentMethod: input.paymentMethod,
    receiptUrl: input.receiptUrl,
    tags: input.tags,
    createdAt: nowISO,
    updatedAt: nowISO,
  };
  allList.unshift(newTx);
  setItem(KEYS.TRANSACTIONS, allList);
  recalculateBudgets();

  // Adjust account balance if linked
  if (input.accountId) {
    try {
      const accounts = getItem<Account[]>(KEYS.ACCOUNTS, []);
      const accIdx = accounts.findIndex((a) => a._id === input.accountId);
      if (accIdx !== -1) {
        if (input.type === "income") accounts[accIdx].balance += input.amount;
        else if (input.type === "expense") accounts[accIdx].balance -= input.amount;
        setItem(KEYS.ACCOUNTS, accounts);
      }
    } catch (e) {
      console.error("Account balance update error", e);
    }
  }

  return newTx;
}

export const addStoredTransaction = saveStoredTransaction;

export function updateStoredTransaction(id: string, input: UpdateTransactionInput): Transaction {
  const allList = getItem<Transaction[]>(KEYS.TRANSACTIONS, []);
  const idx = allList.findIndex((t) => t._id === id);
  if (idx === -1) throw new Error("Transaction not found");

  const existing = allList[idx];
  const updated: Transaction = {
    ...existing,
    ...input,
    date: input.date ? new Date(input.date).toISOString() : existing.date,
    updatedAt: new Date().toISOString(),
  };
  allList[idx] = updated;
  setItem(KEYS.TRANSACTIONS, allList);
  recalculateBudgets();
  return updated;
}

export function deleteStoredTransaction(id: string): void {
  let allList = getItem<Transaction[]>(KEYS.TRANSACTIONS, []);
  allList = allList.filter((t) => t._id !== id);
  setItem(KEYS.TRANSACTIONS, allList);
  recalculateBudgets();
}

// --- BUDGETS STORAGE WITH ROLE ISOLATION ---
export function getStoredBudgets(): Budget[] {
  initializeSeedData();
  const allBudgets: Budget[] = getItem(KEYS.BUDGETS, []);
  const currentUser = getCurrentUserContext();

  const recomputed = recalculateBudgets(allBudgets);
  if (currentUser.role === "admin") {
    const targetId = getAdminTargetUserId();
    if (targetId && targetId !== "all") {
      return recomputed.filter((b) => b.userId === targetId);
    }
    return recomputed;
  }
  return recomputed.filter((b) => b.userId === currentUser.id);
}

export function recalculateBudgets(budgetsInput?: Budget[]): Budget[] {
  const budgets = budgetsInput || getItem<Budget[]>(KEYS.BUDGETS, []);
  const transactions = getItem<Transaction[]>(KEYS.TRANSACTIONS, []);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const updatedBudgets = budgets.map((b) => {
    const spent = transactions
      .filter(
        (t) =>
          t.userId === b.userId &&
          t.type === "expense" &&
          t.category.toLowerCase() === b.category.toLowerCase() &&
          new Date(t.date).getMonth() === currentMonth &&
          new Date(t.date).getFullYear() === currentYear
      )
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      ...b,
      spent,
      remaining: Math.max(0, b.limitAmount - spent),
      updatedAt: new Date().toISOString(),
    };
  });

  setItem(KEYS.BUDGETS, updatedBudgets);
  return updatedBudgets;
}

export function saveStoredBudget(input: CreateBudgetInput): Budget {
  const allBudgets = getItem<Budget[]>(KEYS.BUDGETS, []);
  const currentUser = getCurrentUserContext();
  const nowISO = new Date().toISOString();

  const newBudget: Budget = {
    _id: generateId(),
    userId: currentUser.id,
    category: input.category,
    limitAmount: input.limitAmount,
    spent: 0,
    remaining: input.limitAmount,
    createdAt: nowISO,
    updatedAt: nowISO,
  };
  allBudgets.push(newBudget);
  const recomputed = recalculateBudgets(allBudgets);
  return recomputed.find((b) => b._id === newBudget._id) || newBudget;
}

export function updateStoredBudget(id: string, input: UpdateBudgetInput): Budget {
  const allBudgets = getItem<Budget[]>(KEYS.BUDGETS, []);
  const idx = allBudgets.findIndex((b) => b._id === id);
  if (idx === -1) throw new Error("Budget not found");

  const existing = allBudgets[idx];
  const updated: Budget = {
    ...existing,
    ...input,
    updatedAt: new Date().toISOString(),
  };
  allBudgets[idx] = updated;
  const recomputed = recalculateBudgets(allBudgets);
  return recomputed.find((b) => b._id === id) || updated;
}

export function deleteStoredBudget(id: string): void {
  let budgets = getItem<Budget[]>(KEYS.BUDGETS, []);
  budgets = budgets.filter((b) => b._id !== id);
  setItem(KEYS.BUDGETS, budgets);
}

// --- GOALS STORAGE WITH ROLE ISOLATION ---
export function getStoredGoals(): Goal[] {
  initializeSeedData();
  const allGoals: Goal[] = getItem(KEYS.GOALS, []);
  const currentUser = getCurrentUserContext();
  if (currentUser.role === "admin") {
    const targetId = getAdminTargetUserId();
    if (targetId && targetId !== "all") {
      return allGoals.filter((g) => g.userId === targetId);
    }
    return allGoals;
  }
  return allGoals.filter((g) => g.userId === currentUser.id);
}

export function saveStoredGoal(input: CreateGoalInput): Goal {
  const goals = getItem<Goal[]>(KEYS.GOALS, []);
  const currentUser = getCurrentUserContext();
  const nowISO = new Date().toISOString();

  const newGoal: Goal = {
    _id: generateId(),
    userId: currentUser.id,
    name: input.name,
    targetAmount: input.targetAmount,
    currentAmount: input.currentAmount || 0,
    deadline: input.deadline ? new Date(input.deadline).toISOString() : undefined,
    category: input.category || "General",
    createdAt: nowISO,
    updatedAt: nowISO,
  };
  goals.push(newGoal);
  setItem(KEYS.GOALS, goals);
  return newGoal;
}

export function updateStoredGoal(id: string, input: UpdateGoalInput): Goal {
  const goals = getItem<Goal[]>(KEYS.GOALS, []);
  const idx = goals.findIndex((g) => g._id === id);
  if (idx === -1) throw new Error("Goal not found");

  const existing = goals[idx];
  const updated: Goal = {
    ...existing,
    ...input,
    deadline: input.deadline ? new Date(input.deadline).toISOString() : existing.deadline,
    updatedAt: new Date().toISOString(),
  };
  goals[idx] = updated;
  setItem(KEYS.GOALS, goals);
  return updated;
}

export function deleteStoredGoal(id: string): void {
  let goals = getItem<Goal[]>(KEYS.GOALS, []);
  goals = goals.filter((g) => g._id !== id);
  setItem(KEYS.GOALS, goals);
}

// --- RECURRING TRANSACTIONS STORAGE WITH ROLE ISOLATION ---
export function getStoredRecurring(): RecurringTransaction[] {
  initializeSeedData();
  const allRecurring: RecurringTransaction[] = getItem(KEYS.RECURRING, []);
  const currentUser = getCurrentUserContext();
  if (currentUser.role === "admin") {
    const targetId = getAdminTargetUserId();
    if (targetId && targetId !== "all") {
      return allRecurring.filter((r) => r.userId === targetId);
    }
    return allRecurring;
  }
  return allRecurring.filter((r) => r.userId === currentUser.id);
}

export function saveStoredRecurring(input: CreateRecurringInput): RecurringTransaction {
  const recurring = getItem<RecurringTransaction[]>(KEYS.RECURRING, []);
  const currentUser = getCurrentUserContext();
  const nowISO = new Date().toISOString();

  const newRec: RecurringTransaction = {
    _id: generateId(),
    userId: currentUser.id,
    type: input.type,
    amount: input.amount,
    category: input.category,
    description: input.description,
    frequency: input.frequency,
    startDate: new Date(input.startDate).toISOString(),
    nextDate: new Date(input.startDate).toISOString(),
    endDate: input.endDate ? new Date(input.endDate).toISOString() : undefined,
    isActive: true,
    createdAt: nowISO,
    updatedAt: nowISO,
  };
  recurring.push(newRec);
  setItem(KEYS.RECURRING, recurring);
  return newRec;
}

export function updateStoredRecurring(id: string, input: UpdateRecurringInput): RecurringTransaction {
  const recurring = getItem<RecurringTransaction[]>(KEYS.RECURRING, []);
  const idx = recurring.findIndex((r) => r._id === id);
  if (idx === -1) throw new Error("Recurring transaction not found");

  const existing = recurring[idx];
  const updated: RecurringTransaction = {
    ...existing,
    ...input,
    startDate: input.startDate ? new Date(input.startDate).toISOString() : existing.startDate,
    endDate: input.endDate ? new Date(input.endDate).toISOString() : existing.endDate,
    updatedAt: new Date().toISOString(),
  };
  recurring[idx] = updated;
  setItem(KEYS.RECURRING, recurring);
  return updated;
}

export function deleteStoredRecurring(id: string): void {
  let recurring = getItem<RecurringTransaction[]>(KEYS.RECURRING, []);
  recurring = recurring.filter((r) => r._id !== id);
  setItem(KEYS.RECURRING, recurring);
}

// --- USER & AUTH STORAGE WITH ROLE-BASED LOGIN & REGISTER ---
export function getStoredUser(): User {
  initializeSeedData();
  return getItem<User>(KEYS.USER, {
    id: "local_user_1",
    fullName: "Lelisa Finance Tracking",
    email: "user@local.app",
    role: "user",
  });
}

export function saveStoredUser(user: Partial<User>): User {
  const current = getStoredUser();
  const updated = { ...current, ...user };
  setItem(KEYS.USER, updated);
  
  // Also update inside registered users array if present
  const registered = getItem<User[]>(KEYS.REGISTERED_USERS, []);
  const idx = registered.findIndex((u) => u.id === updated.id);
  if (idx !== -1) {
    registered[idx] = updated;
    setItem(KEYS.REGISTERED_USERS, registered);
  }

  return updated;
}

export function authenticateLocalUser(email: string, password?: string): AuthResponse {
  const normEmail = email.trim().toLowerCase();

  // Administrator Login Check: admin@gmail.com & password "admin"
  if (normEmail === "admin@gmail.com") {
    if (password && password !== "admin") {
      throw new Error("Invalid password for System Administrator.");
    }
    const adminUser: User = {
      id: "admin_super_user_0",
      fullName: "System Administrator",
      email: "admin@gmail.com",
      phone: "+1000000000",
      role: "admin",
    };
    setItem(KEYS.USER, adminUser);
    setItem(KEYS.TOKEN, "admin_token_" + Date.now());
    return {
      message: "Administrator Login Successful",
      token: "admin_token_" + Date.now(),
      user: adminUser,
    };
  }

  // Strict Lookup in registered accounts: Must register first!
  let registered = getItem<User[]>(KEYS.REGISTERED_USERS, []);
  let found = registered.find((u) => u.email.toLowerCase() === normEmail);

  if (!found) {
    if (normEmail === "user@local.app" || normEmail === "lelisa@local.app") {
      found = {
        id: normEmail === "user@local.app" ? "local_user_2" : "local_user_1",
        fullName: normEmail === "user@local.app" ? "Local Standard User" : "Lelisa Finance Tracking",
        email: normEmail,
        phone: "0969642103",
        role: "user",
      };
      registered.push(found);
      setItem(KEYS.REGISTERED_USERS, registered);
    } else {
      throw new Error("Account not found. Please register first before logging in.");
    }
  }

  setItem(KEYS.USER, found);
  setItem(KEYS.TOKEN, "local_token_" + Date.now());
  return {
    message: "Login successful",
    token: "local_token_" + Date.now(),
    user: found,
  };
}

export function registerLocalUser(data: { fullName: string; email: string; phone?: string }): User {
  const registered = getItem<User[]>(KEYS.REGISTERED_USERS, []);
  const normEmail = data.email.trim().toLowerCase();

  const existing = registered.find((u) => u.email.toLowerCase() === normEmail);
  if (existing) {
    setItem(KEYS.USER, existing);
    setItem(KEYS.TOKEN, "local_token_" + Date.now());
    return existing;
  }

  const isAdministrator = normEmail === "admin@gmail.com";
  const newUser: User = {
    id: isAdministrator ? "admin_super_user_0" : "usr_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
    fullName: isAdministrator ? "System Administrator" : data.fullName,
    email: normEmail,
    phone: data.phone || "",
    role: isAdministrator ? "admin" : "user",
  };

  registered.push(newUser);
  setItem(KEYS.REGISTERED_USERS, registered);
  setItem(KEYS.USER, newUser);
  setItem(KEYS.TOKEN, "local_token_" + Date.now());
  return newUser;
}

// --- ACCOUNTS CRUD ---
export function getStoredAccounts(): Account[] {
  initializeSeedData();
  const currentUser = getStoredUser();
  const accounts = getItem<Account[]>(KEYS.ACCOUNTS, []);
  return accounts.filter((a) => a.userId === currentUser.id);
}

export function addStoredAccount(input: CreateAccountInput): Account {
  const accounts = getItem<Account[]>(KEYS.ACCOUNTS, []);
  const currentUser = getStoredUser();
  const nowISO = new Date().toISOString();
  const newAccount: Account = {
    _id: generateId(),
    userId: currentUser.id,
    ...input,
    createdAt: nowISO,
    updatedAt: nowISO,
  };
  accounts.push(newAccount);
  setItem(KEYS.ACCOUNTS, accounts);
  return newAccount;
}

export function updateStoredAccount(id: string, input: UpdateAccountInput): Account {
  const accounts = getItem<Account[]>(KEYS.ACCOUNTS, []);
  const idx = accounts.findIndex((a) => a._id === id);
  if (idx === -1) throw new Error("Account not found");

  const updated: Account = {
    ...accounts[idx],
    ...input,
    updatedAt: new Date().toISOString(),
  };
  accounts[idx] = updated;
  setItem(KEYS.ACCOUNTS, accounts);
  return updated;
}

export function deleteStoredAccount(id: string): void {
  let accounts = getItem<Account[]>(KEYS.ACCOUNTS, []);
  accounts = accounts.filter((a) => a._id !== id);
  setItem(KEYS.ACCOUNTS, accounts);
}

// --- BILLS CRUD ---
export function getStoredBills(): Bill[] {
  initializeSeedData();
  const currentUser = getStoredUser();
  const bills = getItem<Bill[]>(KEYS.BILLS, []);
  return bills.filter((b) => b.userId === currentUser.id);
}

export function addStoredBill(input: CreateBillInput): Bill {
  const bills = getItem<Bill[]>(KEYS.BILLS, []);
  const currentUser = getStoredUser();
  const nowISO = new Date().toISOString();
  const newBill: Bill = {
    _id: generateId(),
    userId: currentUser.id,
    ...input,
    createdAt: nowISO,
    updatedAt: nowISO,
  };
  bills.push(newBill);
  setItem(KEYS.BILLS, bills);
  return newBill;
}

export function updateStoredBill(id: string, input: UpdateBillInput): Bill {
  const bills = getItem<Bill[]>(KEYS.BILLS, []);
  const idx = bills.findIndex((b) => b._id === id);
  if (idx === -1) throw new Error("Bill not found");

  const updated: Bill = {
    ...bills[idx],
    ...input,
    updatedAt: new Date().toISOString(),
  };
  bills[idx] = updated;
  setItem(KEYS.BILLS, bills);
  return updated;
}

export function toggleBillPaidStatus(id: string): Bill {
  const bills = getItem<Bill[]>(KEYS.BILLS, []);
  const idx = bills.findIndex((b) => b._id === id);
  if (idx === -1) throw new Error("Bill not found");

  const current = bills[idx];
  const newStatus = current.status === "paid" ? "unpaid" : "paid";
  const updated: Bill = {
    ...current,
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };
  bills[idx] = updated;
  setItem(KEYS.BILLS, bills);

  // If marked as paid, automatically log expense transaction if not already logged
  if (newStatus === "paid") {
    try {
      addStoredTransaction({
        type: "expense",
        amount: current.amount,
        category: current.category || "Utilities",
        description: `Paid Bill: ${current.name}`,
        date: new Date().toISOString(),
      });
    } catch (e) {
      console.error("Failed to auto-log bill payment transaction", e);
    }
  }

  return updated;
}

export function deleteStoredBill(id: string): void {
  let bills = getItem<Bill[]>(KEYS.BILLS, []);
  bills = bills.filter((b) => b._id !== id);
  setItem(KEYS.BILLS, bills);
}

// --- DEBT & LOAN CRUD ---
export function getStoredDebts(): Debt[] {
  initializeSeedData();
  const currentUser = getStoredUser();
  const debts = getItem<Debt[]>(KEYS.DEBTS, []);
  return debts.filter((d) => d.userId === currentUser.id);
}

export function addStoredDebt(input: CreateDebtInput): Debt {
  const debts = getItem<Debt[]>(KEYS.DEBTS, []);
  const currentUser = getStoredUser();
  const nowISO = new Date().toISOString();
  const newDebt: Debt = {
    _id: generateId(),
    userId: currentUser.id,
    ...input,
    remainingBalance: input.remainingBalance ?? input.totalAmount,
    createdAt: nowISO,
    updatedAt: nowISO,
  };
  debts.push(newDebt);
  setItem(KEYS.DEBTS, debts);
  return newDebt;
}

export function updateStoredDebt(id: string, input: UpdateDebtInput): Debt {
  const debts = getItem<Debt[]>(KEYS.DEBTS, []);
  const idx = debts.findIndex((d) => d._id === id);
  if (idx === -1) throw new Error("Debt record not found");

  const updated: Debt = {
    ...debts[idx],
    ...input,
    updatedAt: new Date().toISOString(),
  };
  debts[idx] = updated;
  setItem(KEYS.DEBTS, debts);
  return updated;
}

export function deleteStoredDebt(id: string): void {
  let debts = getItem<Debt[]>(KEYS.DEBTS, []);
  debts = debts.filter((d) => d._id !== id);
  setItem(KEYS.DEBTS, debts);
}

// --- CATEGORIES CRUD ---
export function getStoredCategories(): CustomCategory[] {
  initializeSeedData();
  const currentUser = getStoredUser();
  const categories = getItem<CustomCategory[]>(KEYS.CATEGORIES, []);
  return categories.filter((c) => c.userId === currentUser.id || c.isDefault);
}

export function addStoredCategory(input: CreateCategoryInput): CustomCategory {
  const categories = getItem<CustomCategory[]>(KEYS.CATEGORIES, []);
  const currentUser = getStoredUser();
  const newCat: CustomCategory = {
    _id: generateId(),
    userId: currentUser.id,
    ...input,
    createdAt: new Date().toISOString(),
  };
  categories.push(newCat);
  setItem(KEYS.CATEGORIES, categories);
  return newCat;
}

export function updateStoredCategory(id: string, input: UpdateCategoryInput): CustomCategory {
  const categories = getItem<CustomCategory[]>(KEYS.CATEGORIES, []);
  const idx = categories.findIndex((c) => c._id === id);
  if (idx === -1) throw new Error("Category not found");

  const updated: CustomCategory = {
    ...categories[idx],
    ...input,
  };
  categories[idx] = updated;
  setItem(KEYS.CATEGORIES, categories);
  return updated;
}

export function deleteStoredCategory(id: string): void {
  let categories = getItem<CustomCategory[]>(KEYS.CATEGORIES, []);
  categories = categories.filter((c) => c._id !== id);
  setItem(KEYS.CATEGORIES, categories);
}

// --- FAVORITES QUICK-ADD ---
export function getStoredFavorites(): FavoriteExpense[] {
  initializeSeedData();
  return getItem<FavoriteExpense[]>(KEYS.FAVORITES, []);
}

export function addStoredFavorite(fav: Omit<FavoriteExpense, "_id">): FavoriteExpense {
  const favs = getStoredFavorites();
  const newFav: FavoriteExpense = {
    _id: generateId(),
    ...fav,
  };
  favs.push(newFav);
  setItem(KEYS.FAVORITES, favs);
  return newFav;
}

export function deleteStoredFavorite(id: string): void {
  let favs = getStoredFavorites();
  favs = favs.filter((f) => f._id !== id);
  setItem(KEYS.FAVORITES, favs);
}

// --- PIN LOCK SECURITY ---
export function getStoredPin(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEYS.PIN);
}

export function setStoredPin(pin: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.PIN, pin);
}

export function removeStoredPin(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEYS.PIN);
}

// --- BACKUP DATA IMPORT & EXPORT ---
export function exportFullBackupJSON(): string {
  const data = {
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
    transactions: getItem(KEYS.TRANSACTIONS, []),
    budgets: getItem(KEYS.BUDGETS, []),
    goals: getItem(KEYS.GOALS, []),
    recurring: getItem(KEYS.RECURRING, []),
    accounts: getItem(KEYS.ACCOUNTS, []),
    bills: getItem(KEYS.BILLS, []),
    debts: getItem(KEYS.DEBTS, []),
    categories: getItem(KEYS.CATEGORIES, []),
    favorites: getItem(KEYS.FAVORITES, []),
    exchangeRates: getItem(KEYS.EXCHANGE_RATES, []),
  };
  return JSON.stringify(data, null, 2);
}

function remapUserId<T extends { userId?: string }>(items: T[], newUserId: string): T[] {
  if (!Array.isArray(items)) return [];
  return items.map((item) => ({
    ...item,
    userId: newUserId,
  }));
}

export function importFullBackupJSON(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (!data.transactions && !data.accounts && !data.budgets) {
      throw new Error("Invalid backup JSON format");
    }

    const currentUser = getCurrentUserContext();
    const currentId = currentUser?.id || "local_user_1";

    if (Array.isArray(data.transactions)) {
      setItem(KEYS.TRANSACTIONS, remapUserId(data.transactions, currentId));
    }
    if (Array.isArray(data.budgets)) {
      setItem(KEYS.BUDGETS, remapUserId(data.budgets, currentId));
    }
    if (Array.isArray(data.goals)) {
      setItem(KEYS.GOALS, remapUserId(data.goals, currentId));
    }
    if (Array.isArray(data.recurring)) {
      setItem(KEYS.RECURRING, remapUserId(data.recurring, currentId));
    }
    if (Array.isArray(data.accounts)) {
      setItem(KEYS.ACCOUNTS, remapUserId(data.accounts, currentId));
    }
    if (Array.isArray(data.bills)) {
      setItem(KEYS.BILLS, remapUserId(data.bills, currentId));
    }
    if (Array.isArray(data.debts)) {
      setItem(KEYS.DEBTS, remapUserId(data.debts, currentId));
    }
    if (Array.isArray(data.categories)) {
      setItem(KEYS.CATEGORIES, remapUserId(data.categories, currentId));
    }
    if (Array.isArray(data.favorites)) {
      setItem(KEYS.FAVORITES, data.favorites);
    }
    if (Array.isArray(data.exchangeRates)) {
      setItem(KEYS.EXCHANGE_RATES, remapUserId(data.exchangeRates, currentId));
    }

    recalculateBudgets();
    return true;
  } catch (e) {
    console.error("Backup import error:", e);
    throw new Error("Failed to parse JSON backup file.");
  }
}

// --- EXCHANGE RATES STORAGE ---
export interface ExchangeRateDoc {
  _id: string;
  userId: string;
  from: string;
  to: string;
  rate: number;
}

export function getStoredExchangeRates(): ExchangeRateDoc[] {
  const current = getCurrentUserContext();
  const all = getItem<ExchangeRateDoc[]>(KEYS.EXCHANGE_RATES, []);
  return all.filter((r) => r.userId === current.id);
}

export function saveStoredExchangeRate(from: string, to: string, rate: number): ExchangeRateDoc {
  const current = getCurrentUserContext();
  const all = getItem<ExchangeRateDoc[]>(KEYS.EXCHANGE_RATES, []);

  const existingIdx = all.findIndex((r) => r.userId === current.id && r.from === from && r.to === to);
  let updatedDoc: ExchangeRateDoc;
  if (existingIdx !== -1) {
    all[existingIdx].rate = rate;
    updatedDoc = all[existingIdx];
  } else {
    updatedDoc = {
      _id: generateId(),
      userId: current.id,
      from,
      to,
      rate,
    };
    all.push(updatedDoc);
  }
  setItem(KEYS.EXCHANGE_RATES, all);
  return updatedDoc;
}

export function deleteStoredExchangeRate(id: string): void {
  let all = getItem<ExchangeRateDoc[]>(KEYS.EXCHANGE_RATES, []);
  all = all.filter((r) => r._id !== id);
  setItem(KEYS.EXCHANGE_RATES, all);
}

export function getEffectiveExchangeRates() {
  const userRates = getStoredExchangeRates();
  const defaults: Record<string, number> = {
    USD: 120.0,
    EUR: 130.0,
    GBP: 150.0,
    ETB: 1.0,
  };

  userRates.forEach((r) => {
    if (r.to === "ETB") {
      defaults[r.from] = r.rate;
    }
  });

  return {
    base: "ETB",
    rates: defaults,
    etbRates: defaults,
  };
}
