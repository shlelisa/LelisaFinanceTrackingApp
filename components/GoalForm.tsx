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
import { goalFormSchema, GoalFormValues } from "@/lib/validation/goal";
import { CATEGORIES } from "@/lib/constants";
import { useTranslation } from "@/hooks/useTranslation";

interface GoalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: GoalFormValues) => void;
  defaultValues?: Partial<GoalFormValues>;
  mode: "create" | "edit";
}

const GoalForm = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  mode,
}: GoalFormProps) => {
  const { t } = useTranslation();
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema) as any,
    defaultValues: { name: "", targetAmount: 0, currentAmount: 0, deadline: "", category: "", ...defaultValues },
  });

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
            {mode === "create" ? t("common.create") : t("goals.edit")} Savings Goal
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("goals.name")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("goals.name_placeholder")} {...field} />
                  </FormControl>
                  <FormMessage>{fieldState.error ? t(String(fieldState.error.message)) : undefined}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="targetAmount"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("goals.target_amount")}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder={t("goals.target_placeholder")} {...field} />
                  </FormControl>
                  <FormMessage>{fieldState.error ? t(String(fieldState.error.message)) : undefined}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currentAmount"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("goals.current_savings")}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder={t("goals.current_placeholder")} {...field} />
                  </FormControl>
                  <FormMessage>{fieldState.error ? t(String(fieldState.error.message)) : undefined}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="deadline"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("goals.target_date")}</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage>{fieldState.error ? t(String(fieldState.error.message)) : undefined}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("goals.category_optional")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("goals.select_category")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
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

export default GoalForm;
