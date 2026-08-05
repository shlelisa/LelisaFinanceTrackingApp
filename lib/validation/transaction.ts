import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["income", "expense", "transfer"]),
  amount: z.coerce.number().positive("validation.amount_positive"),
  currency: z.string().optional().default("ETB"),
  category: z.string().min(1, "validation.category_required"),
  description: z.string().min(1, "validation.description_required").max(500),
  date: z.string().optional(),
  time: z.string().optional(),
  accountId: z.string().optional(),
  toAccountId: z.string().optional(),
  paymentMethod: z.string().optional(),
  receiptUrl: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;
