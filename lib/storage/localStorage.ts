import type { Transaction, CreateTransactionInput, UpdateTransactionInput, TransactionFilters } from "../types/transaction";
import type { Budget } from "../types/budget";
import type { CreateBudgetInput, UpdateBudgetInput } from "../validation/budget";
import type { Goal } from "../types/goal";
import type { CreateGoalInput, UpdateGoalInput } from "../validation/goal";
import type { RecurringTransaction } from "../types/recurring";
import type { CreateRecurringInput, UpdateRecurringInput } from "../validation/recurring";
import type { User, AuthResponse } from "../types/api";

const KEYS = {
  TRANSACTIONS: "pft_offline_transactions",
  BUDGETS: "pft_offline_budgets",
  GOALS: "pft_offline_goals",
  RECURRING: "pft_offline_recurring",
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

  if (!localStorage.getItem(KEYS.USER)) {
    const defaultUser: User = {
      id: "local_user_1",
      fullName: "Lelisa Finance Tracking",
      email: "lelisa@local.app",
      phone: "0969642103",
      role: "user",
    };
    setItem(KEYS.USER, defaultUser);
    setItem(KEYS.TOKEN, "offline_token_local");
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
    createdAt: nowISO,
    updatedAt: nowISO,
  };
  allList.unshift(newTx);
  setItem(KEYS.TRANSACTIONS, allList);
  recalculateBudgets();
  return newTx;
}

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
  const registered = getItem<User[]>(KEYS.REGISTERED_USERS, []);
  const found = registered.find((u) => u.email.toLowerCase() === normEmail);

  if (!found) {
    throw new Error("Account not found. Please register first before logging in.");
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
