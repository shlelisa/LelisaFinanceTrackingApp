import { z } from "zod";
import { BUDGET_PERIODS } from "@/lib/types/budget";

export const budgetFormSchema = z.object({
  category: z.string().min(1, "validation.category_required"),
  period: z.enum(BUDGET_PERIODS).default("monthly"),
  limitAmount: z.coerce
    .number({ message: "validation.budget_amount_required" })
    .positive({ message: "validation.budget_amount_positive" }),
});

export type BudgetFormValues = z.infer<typeof budgetFormSchema>;
export type CreateBudgetInput = BudgetFormValues;
export type UpdateBudgetInput = Partial<BudgetFormValues>;
