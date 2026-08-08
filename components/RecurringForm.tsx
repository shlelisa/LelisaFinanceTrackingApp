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
import { recurringFormSchema, RecurringFormValues } from "@/lib/validation/recurring";
import { getAllKnownCategoryNames } from "@/lib/storage/localStorage";
import { useTranslation } from "@/hooks/useTranslation";

interface RecurringFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: RecurringFormValues) => void;
  defaultValues?: Partial<RecurringFormValues>;
  mode: "create" | "edit";
}

const RecurringForm = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  mode,
}: RecurringFormProps) => {
  const { t } = useTranslation();
  const form = useForm<RecurringFormValues>({
    resolver: zodResolver(recurringFormSchema) as any,
    defaultValues: {
      type: "expense",
      amount: 0,
      category: "",
      description: "",
      frequency: "monthly",
      startDate: new Date().toISOString().slice(0, 10),
      endDate: "",
      ...defaultValues,
    },
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
            {mode === "create" ? t("common.add") : t("recurring.edit")} Recurring Transaction
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("recurring.description")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("recurring.description_placeholder")} {...field} />
                  </FormControl>
                  <FormMessage>{fieldState.error ? t(String(fieldState.error.message)) : undefined}</FormMessage>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("recurring.type")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("recurring.select_type")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="income">{t("common.income")}</SelectItem>
                      <SelectItem value="expense">{t("common.expenses")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage>{fieldState.error ? t(String(fieldState.error.message)) : undefined}</FormMessage>
                </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("recurring.amount")}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="5000" {...field} />
                  </FormControl>
                  <FormMessage>{fieldState.error ? t(String(fieldState.error.message)) : undefined}</FormMessage>
                </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("recurring.category")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("recurring.select_category")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getAllKnownCategoryNames().map((cat) => (
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
                name="frequency"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("recurring.frequency")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("recurring.select_frequency")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="daily">{t("recurring.daily")}</SelectItem>
                      <SelectItem value="weekly">{t("recurring.weekly")}</SelectItem>
                      <SelectItem value="monthly">{t("recurring.monthly")}</SelectItem>
                      <SelectItem value="yearly">{t("recurring.yearly")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage>{fieldState.error ? t(String(fieldState.error.message)) : undefined}</FormMessage>
                </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("recurring.start_date")}</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage>{fieldState.error ? t(String(fieldState.error.message)) : undefined}</FormMessage>
                </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("recurring.end_date")}</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage>{fieldState.error ? t(String(fieldState.error.message)) : undefined}</FormMessage>
                </FormItem>
                )}
              />
            </div>
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

export default RecurringForm;
