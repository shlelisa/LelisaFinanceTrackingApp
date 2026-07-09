import type { Budget } from "@/lib/types/budget";
import type { CreateBudgetInput, UpdateBudgetInput } from "@/lib/validation/budget";
import api from "../axios";

export const fetchBudgets = (): Promise<Budget[]> =>
  api.get("/budgets").then((r) => r.data);

export const fetchBudget = (id: string): Promise<Budget> =>
  api.get(`/budgets/${id}`).then((r) => r.data);

export const createBudget = (data: CreateBudgetInput): Promise<Budget> =>
  api.post("/budgets", data).then((r) => r.data);

export const updateBudget = (id: string, data: UpdateBudgetInput): Promise<Budget> =>
  api.put(`/budgets/${id}`, data).then((r) => r.data);

export const deleteBudget = (id: string): Promise<{ message: string }> =>
  api.delete(`/budgets/${id}`).then((r) => r.data);
