import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Goal } from "@/lib/types/goal";
import type { CreateGoalInput, UpdateGoalInput } from "@/lib/validation/goal";
import {
  fetchGoals,
  createGoal as createGoalApi,
  updateGoal as updateGoalApi,
  deleteGoal as deleteGoalApi,
} from "@/lib/api/goals";

export const GOALS_KEY = ["goals"] as const;

export const useGoals = () => {
  return useQuery<Goal[], Error>({
    queryKey: GOALS_KEY,
    queryFn: fetchGoals,
  });
};

export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (goal: CreateGoalInput) => createGoalApi(goal),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOALS_KEY }),
  });
};

export const useUpdateGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGoalInput }) =>
      updateGoalApi(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOALS_KEY }),
  });
};

export const useDeleteGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteGoalApi(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GOALS_KEY }),
  });
};
