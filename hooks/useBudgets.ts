import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { Budget } from "@/lib/types/budget";
import type {
  CreateBudgetInput,
  UpdateBudgetInput,
} from "@/lib/validation/budget";

const fetchBudgets = async (): Promise<Budget[]> => {
  const { data } = await api.get("/budgets");
  return data;
};

export const useBudgets = () => {
  return useQuery<Budget[], Error>({
    queryKey: ["budgets"],
    queryFn: fetchBudgets,
  });
};

const createBudget = async (budget: CreateBudgetInput): Promise<Budget> => {
  const { data } = await api.post("/budgets", budget);
  return data;
};

export const useCreateBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBudget,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] }),
  });
};

const updateBudget = async ({
  id,
  data,
}: {
  id: string;
  data: UpdateBudgetInput;
}): Promise<Budget> => {
  const { data: responseData } = await api.put(`/budgets/${id}`, data);
  return responseData;
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateBudget,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] }),
  });
};

const deleteBudget = async (id: string): Promise<{ message: string }> => {
  const { data } = await api.delete(`/budgets/${id}`);
  return data;
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBudget,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] }),
  });
};
