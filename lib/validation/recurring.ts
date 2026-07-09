import { z } from "zod";

export const recurringFormSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce
    .number({ message: "Please enter an amount." })
    .positive({ message: "Amount must be greater than 0." }),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required").max(200),
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD").optional().or(z.literal("")),
});

export type RecurringFormValues = z.infer<typeof recurringFormSchema>;
export type CreateRecurringInput = RecurringFormValues;
export type UpdateRecurringInput = Partial<RecurringFormValues> & { isActive?: boolean };
