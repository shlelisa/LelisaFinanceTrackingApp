"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CATEGORIES, CURRENCIES } from "@/lib/constants";
import {
  transactionSchema,
  type TransactionFormValues,
} from "@/lib/validation/transaction";
import { useTranslation } from "@/hooks/useTranslation";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TransactionFormValues) => Promise<void>;
  defaultValues?: Partial<TransactionFormValues>;
  mode: "create" | "edit";
};

export default function TransactionForm({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  mode,
}: Props) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema) as any,
    defaultValues: {
      type: "expense",
      amount: undefined,
      currency: "ETB",
      category: "",
      description: "",
      date: new Date().toISOString().slice(0, 10),
      ...defaultValues,
    },
  });

  const watchType = watch("type");
  const watchCategory = watch("category");

  const handleFormSubmit = async (values: TransactionFormValues) => {
    try {
      await onSubmit(values);
      reset();
      onOpenChange(false);
    } catch {
      // Error handled by parent
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? t("transaction.add") : t("transaction.edit")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="type">{t("transaction.type")}</Label>
              <Select
                value={watchType}
                onValueChange={(v) => setValue("type", (v ?? "expense") as "income" | "expense")}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">{t("common.income")}</SelectItem>
                  <SelectItem value="expense">{t("common.expenses")}</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-xs text-destructive">{t(String(errors.type.message))}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="amount">{t("transaction.amount")}</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register("amount")}
              />
              {errors.amount && (
                <p className="text-xs text-destructive">
                  {t(String(errors.amount.message))}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="currency">{t("transaction.currency")}</Label>
              <Select
                value={watch("currency") || "ETB"}
                onValueChange={(v) => setValue("currency", v ?? "ETB")}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category">{t("transaction.category")}</Label>
            <Select
              value={watchCategory}
              onValueChange={(v) => setValue("category", v ?? "")}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder={t("transaction.select_category")} />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {t(`categories.${cat}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-destructive">
                {t(String(errors.category.message))}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">{t("transaction.description")}</Label>
            <Input id="description" placeholder="e.g. Coffee" {...register("description")} />
            {errors.description && (
              <p className="text-xs text-destructive">
                {t(String(errors.description.message))}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="date">{t("transaction.date")}</Label>
            <Input id="date" type="date" {...register("date")} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? t("common.saving")
                : mode === "create"
                  ? t("common.create")
                  : t("common.save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
