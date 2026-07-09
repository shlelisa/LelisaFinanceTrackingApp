"use client";
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
import { CATEGORIES } from "@/lib/constants";
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
    defaultValues: { category: "", limitAmount: 0, ...defaultValues },
  });

  const availableCategories = CATEGORIES.filter(
    (cat) =>
      !existingCategories.includes(cat) || cat === defaultValues?.category,
  );

  const handleFormSubmit = form.handleSubmit(async (data) => {
    try {
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
                           {t(`categories.${cat}`)}
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
