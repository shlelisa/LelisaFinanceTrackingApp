import type { RecurringTransaction } from "@/lib/types/recurring";
import type { CreateRecurringInput, UpdateRecurringInput } from "@/lib/validation/recurring";
import {
  getStoredRecurring,
  saveStoredRecurring,
  updateStoredRecurring,
  deleteStoredRecurring,
} from "../storage/localStorage";

export const fetchRecurringTransactions = async (): Promise<RecurringTransaction[]> => {
  return getStoredRecurring();
};

export const fetchRecurringTransaction = async (id: string): Promise<RecurringTransaction> => {
  const recurring = getStoredRecurring();
  const found = recurring.find((r) => r._id === id);
  if (!found) throw new Error("Recurring transaction not found");
  return found;
};

export const createRecurringTransaction = async (data: CreateRecurringInput): Promise<RecurringTransaction> => {
  return saveStoredRecurring(data);
};

export const updateRecurringTransaction = async (id: string, data: UpdateRecurringInput): Promise<RecurringTransaction> => {
  return updateStoredRecurring(id, data);
};

export const deleteRecurringTransaction = async (id: string): Promise<{ message: string }> => {
  deleteStoredRecurring(id);
  return { message: "Recurring transaction deleted successfully" };
};
