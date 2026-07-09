import type { Goal } from "@/lib/types/goal";
import type { CreateGoalInput, UpdateGoalInput } from "@/lib/validation/goal";
import api from "../axios";

export const fetchGoals = (): Promise<Goal[]> =>
  api.get("/goals").then((r) => r.data);

export const fetchGoal = (id: string): Promise<Goal> =>
  api.get(`/goals/${id}`).then((r) => r.data);

export const createGoal = (data: CreateGoalInput): Promise<Goal> =>
  api.post("/goals", data).then((r) => r.data);

export const updateGoal = (id: string, data: UpdateGoalInput): Promise<Goal> =>
  api.put(`/goals/${id}`, data).then((r) => r.data);

export const deleteGoal = (id: string): Promise<{ message: string }> =>
  api.delete(`/goals/${id}`).then((r) => r.data);
