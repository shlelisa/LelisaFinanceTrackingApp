import { z } from "zod";

export const goalFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  targetAmount: z.coerce
    .number({ message: "Please enter a target amount." })
    .positive({ message: "Target must be greater than 0." }),
  currentAmount: z.coerce
    .number({ message: "Please enter current savings." })
    .min(0, "Amount cannot be negative.")
    .optional()
    .default(0),
  deadline: z.string().optional(),
  category: z.string().optional(),
});

export type GoalFormValues = z.infer<typeof goalFormSchema>;
export type CreateGoalInput = GoalFormValues;
export type UpdateGoalInput = Partial<GoalFormValues>;
