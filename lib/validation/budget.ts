import { z } from "zod";
import { CATEGORIES } from "@/lib/types/transaction";

export const budgetFormSchema = z.object({
  category: z.enum(CATEGORIES as unknown as [string, ...string[]]),
  limitAmount: z.coerce
    .number({ message: "Please enter a budget amount." })
    .positive({ message: "Amount must be greater than 0." }),
});

export type BudgetFormValues = z.infer<typeof budgetFormSchema>;
export type CreateBudgetInput = BudgetFormValues;
export type UpdateBudgetInput = Partial<BudgetFormValues>;
