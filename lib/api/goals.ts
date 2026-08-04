import type { Goal } from "@/lib/types/goal";
import type { CreateGoalInput, UpdateGoalInput } from "@/lib/validation/goal";
import {
  getStoredGoals,
  saveStoredGoal,
  updateStoredGoal,
  deleteStoredGoal,
} from "../storage/localStorage";

export const fetchGoals = async (): Promise<Goal[]> => {
  return getStoredGoals();
};

export const fetchGoal = async (id: string): Promise<Goal> => {
  const goals = getStoredGoals();
  const found = goals.find((g) => g._id === id);
  if (!found) throw new Error("Goal not found");
  return found;
};

export const createGoal = async (data: CreateGoalInput): Promise<Goal> => {
  return saveStoredGoal(data);
};

export const updateGoal = async (id: string, data: UpdateGoalInput): Promise<Goal> => {
  return updateStoredGoal(id, data);
};

export const deleteGoal = async (id: string): Promise<{ message: string }> => {
  deleteStoredGoal(id);
  return { message: "Goal deleted successfully" };
};
