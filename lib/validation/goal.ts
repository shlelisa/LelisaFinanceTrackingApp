import { z } from "zod";

export const goalFormSchema = z.object({
  name: z.string().min(1, "validation.goal_name_required"),
  targetAmount: z.coerce
    .number({ message: "validation.goal_target_required" })
    .positive({ message: "validation.goal_target_positive" }),
  currentAmount: z.coerce
    .number({ message: "validation.goal_current_required" })
    .min(0, "validation.goal_current_negative")
    .optional()
    .default(0),
  deadline: z.string().optional(),
  category: z.string().optional(),
});

export type GoalFormValues = z.infer<typeof goalFormSchema>;
export type CreateGoalInput = GoalFormValues;
export type UpdateGoalInput = Partial<GoalFormValues>;
