import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive("Amount must be positive"),
  currency: z.string().optional().default("ETB"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required").max(200),
  date: z.string().optional(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;
