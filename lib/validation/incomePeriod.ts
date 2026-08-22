import { z } from "zod";

export const incomePeriodSchema = z
  .object({
    amount: z.coerce
      .number({ message: "validation.income_amount_required" })
      .positive({ message: "validation.income_amount_positive" }),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "validation.date_format"),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "validation.date_format"),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "validation.end_after_start",
    path: ["endDate"],
  });

export type IncomePeriodFormValues = z.infer<typeof incomePeriodSchema>;
export type CreateIncomePeriodInput = IncomePeriodFormValues;
export type UpdateIncomePeriodInput = Partial<IncomePeriodFormValues>;
