import { z } from "zod";

export const recurringFormSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce
    .number({ message: "validation.recurring_amount_required" })
    .positive({ message: "validation.recurring_amount_positive" }),
  category: z.string().min(1, "validation.category_required"),
  description: z.string().min(1, "validation.description_required").max(200),
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "validation.date_format"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "validation.date_format").optional().or(z.literal("")),
});

export type RecurringFormValues = z.infer<typeof recurringFormSchema>;
export type CreateRecurringInput = RecurringFormValues;
export type UpdateRecurringInput = Partial<RecurringFormValues> & { isActive?: boolean };
