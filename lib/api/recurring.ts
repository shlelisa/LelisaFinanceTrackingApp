import type { RecurringTransaction } from "@/lib/types/recurring";
import type { CreateRecurringInput, UpdateRecurringInput } from "@/lib/validation/recurring";
import api from "../axios";

export const fetchRecurringTransactions = (): Promise<RecurringTransaction[]> =>
  api.get("/recurring").then((r) => r.data);

export const fetchRecurringTransaction = (id: string): Promise<RecurringTransaction> =>
  api.get(`/recurring/${id}`).then((r) => r.data);

export const createRecurringTransaction = (data: CreateRecurringInput): Promise<RecurringTransaction> =>
  api.post("/recurring", data).then((r) => r.data);

export const updateRecurringTransaction = (id: string, data: UpdateRecurringInput): Promise<RecurringTransaction> =>
  api.put(`/recurring/${id}`, data).then((r) => r.data);

export const deleteRecurringTransaction = (id: string): Promise<{ message: string }> =>
  api.delete(`/recurring/${id}`).then((r) => r.data);
