import type { Budget } from "@/lib/types/budget";
import type { CreateBudgetInput, UpdateBudgetInput } from "@/lib/validation/budget";
import {
  getStoredBudgets,
  saveStoredBudget,
  updateStoredBudget,
  deleteStoredBudget,
} from "../storage/localStorage";

export const fetchBudgets = async (): Promise<Budget[]> => {
  return getStoredBudgets();
};

export const fetchBudget = async (id: string): Promise<Budget> => {
  const budgets = getStoredBudgets();
  const found = budgets.find((b) => b._id === id);
  if (!found) throw new Error("Budget not found");
  return found;
};

export const createBudget = async (data: CreateBudgetInput): Promise<Budget> => {
  return saveStoredBudget(data);
};

export const updateBudget = async (id: string, data: UpdateBudgetInput): Promise<Budget> => {
  return updateStoredBudget(id, data);
};

export const deleteBudget = async (id: string): Promise<{ message: string }> => {
  deleteStoredBudget(id);
  return { message: "Budget deleted successfully" };
};
