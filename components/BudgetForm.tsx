"use client";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { budgetFormSchema, BudgetFormValues } from "@/lib/validation/budget";
import { BUDGET_PERIODS } from "@/lib/types/budget";
import {
  getAllKnownCategoryNames,
  getExpectedMonthlyIncome,
  getAverageMonthlyIncome,
  getStoredBudgets,
} from "@/lib/storage/localStorage";
import { formatCurrency } from "@/lib/currency";
import { useTranslation } from "@/hooks/useTranslation";

interface BudgetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: BudgetFormValues) => void;
  defaultValues?: Partial<BudgetFormValues>;
  mode: "create" | "edit";
  existingCategories: string[];
}

const BudgetForm = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  mode,
  existingCategories,
}: BudgetFormProps) => {
  const { t } = useTranslation();
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema) as any,
    defaultValues: { category: "", period: "monthly", limitAmount: 0, ...defaultValues },
  });

  const availableCategories = getAllKnownCategoryNames("expense").filter(
    (cat) =>
      !existingCategories.includes(cat) || cat === defaultValues?.category,
  );

  // Monthly budget ceiling: configured salary + active monthly recurring income.
  // Falls back to the average actual income of the last 3 full months when no
  // recurring income sources are configured. 0 means "cannot validate".
  const { monthlyIncomeCap, allocatedMonthly, remainingAllowance } = useMemo(() => {
    const expected = getExpectedMonthlyIncome();
    const cap = expected.total > 0 ? expected.total : getAverageMonthlyIncome();
    const allocated = getStoredBudgets()
      .filter((b) => (b.period || "monthly") === "monthly")
      .filter((b) => !(mode === "edit" && b.category === defaultValues?.category))
      .reduce((sum, b) => sum + b.limitAmount, 0);
    return {
      monthlyIncomeCap: cap,
      allocatedMonthly: allocated,
      remainingAllowance: Math.max(cap - allocated, 0),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, defaultValues?.category]);

  const handleFormSubmit = form.handleSubmit(async (data) => {
    try {
      const period = data.period || "monthly";
      if (
        period === "monthly" &&
        monthlyIncomeCap > 0 &&
        data.limitAmount > monthlyIncomeCap - allocatedMonthly
      ) {
        // Plain key only — FormMessage resolves it through t(); the actual
        // remaining allowance is shown live in the hint below the field.
        form.setError("limitAmount", { message: "budgets.exceeds_income" });
        return;
      }
      await onSubmit(data);
      form.reset();
      onOpenChange(false);
    } catch {
      // Error handled by parent
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? t("budgets.create") : t("budgets.edit")}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("budgets.category")}</FormLabel>
                   <Select
                     onValueChange={field.onChange}
                     value={field.value || ""}
                     disabled={mode === "edit"}
                   >
                     <FormControl>
                       <SelectTrigger>
                         <SelectValue placeholder={t("budgets.select_category")} />
                       </SelectTrigger>
                     </FormControl>
                     <SelectContent>
                       {availableCategories.map((cat) => (
                         <SelectItem key={cat} value={cat}>
                           {cat}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                   <FormMessage>{fieldState.error ? t(String(fieldState.error.message)) : undefined}</FormMessage>
                 </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="period"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("budgets.period")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || "monthly"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BUDGET_PERIODS.map((period) => (
                        <SelectItem key={period} value={period}>
                          {t(`budgets.period_${period}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage>{fieldState.error ? t(String(fieldState.error.message)) : undefined}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="limitAmount"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("budgets.budget_amount")}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder={t("budgets.amount_placeholder")} {...field} />
                  </FormControl>
                  <FormMessage>{fieldState.error ? t(String(fieldState.error.message)) : undefined}</FormMessage>
                  {monthlyIncomeCap > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {t("budgets.max_budget_hint", {
                        income: formatCurrency(monthlyIncomeCap),
                        max: formatCurrency(remainingAllowance),
                      })}
                    </p>
                  )}
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? t("common.saving") : t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BudgetForm;
