import { z } from "zod";

export const budgetFormSchema = z.object({
  category: z.string().min(1, "Category is required"),
  limitAmount: z.coerce
    .number({ message: "Please enter a budget amount." })
    .positive({ message: "Amount must be greater than 0." }),
});

export type BudgetFormValues = z.infer<typeof budgetFormSchema>;
export type CreateBudgetInput = BudgetFormValues;
export type UpdateBudgetInput = Partial<BudgetFormValues>;
