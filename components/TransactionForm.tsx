"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { getStoredAccounts, getStoredCategories } from "@/lib/storage/localStorage";
import type { Account } from "@/lib/types/account";
import { autoCategorizeDescription } from "@/lib/aiCategorizer";
import ReceiptOcrScanner from "@/components/ReceiptOcrScanner";
import { Calculator, Camera, X, Tag, AlertCircle } from "lucide-react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TransactionFormValues) => Promise<void>;
  defaultValues?: Partial<TransactionFormValues>;
  mode: "create" | "edit";
};

// Safe simple math expression evaluator (e.g. 250 + 180 - 50)
function evaluateAmountMath(expr: string): number | null {
  if (!expr) return null;
  const sanitized = expr.replace(/[^0-9+\-*/.]/g, "");
  if (!sanitized) return null;
  try {
    const fn = new Function(`return (${sanitized})`);
    const val = fn();
    return typeof val === "number" && !isNaN(val) && val > 0 ? val : null;
  } catch {
    return null;
  }
}

export default function TransactionForm({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  mode,
}: Props) {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const [calcInput, setCalcInput] = useState(defaultValues?.amount ? String(defaultValues.amount) : "");
  const [receiptPreview, setReceiptPreview] = useState<string | undefined>(defaultValues?.receiptUrl);
  const [tagInput, setTagInput] = useState(defaultValues?.tags ? defaultValues.tags.join(", ") : "");
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setAccounts(getStoredAccounts());
      setSubmitError(null);

      const storedCats = getStoredCategories().map((c) => c.name);
      const combined = Array.from(new Set([...storedCats, ...CATEGORIES]));
      setCategoryList(combined);

      setCalcInput(defaultValues?.amount ? String(defaultValues.amount) : "");
      setReceiptPreview(defaultValues?.receiptUrl);
      setTagInput(defaultValues?.tags ? defaultValues.tags.join(", ") : "");
    }
  }, [open, defaultValues]);

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
      time: new Date().toTimeString().slice(0, 5),
      paymentMethod: "Cash",
      ...defaultValues,
    },
  });

  const watchType = watch("type");
  const watchCategory = watch("category");

  const handleAmountBlur = () => {
    const calculated = evaluateAmountMath(calcInput);
    if (calculated !== null) {
      setCalcInput(String(calculated));
      setValue("amount", calculated);
    }
  };

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setReceiptPreview(base64);
        setValue("receiptUrl", base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (values: TransactionFormValues) => {
    setSubmitError(null);
    try {
      const parsedAmount = evaluateAmountMath(calcInput) || values.amount;
      if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
        const msg = "Please enter a valid amount greater than 0.";
        setSubmitError(msg);
        toast.error(msg);
        return;
      }

      if (!values.category) {
        const msg = "Please select a category.";
        setSubmitError(msg);
        toast.error(msg);
        return;
      }

      const parsedTags = tagInput
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
        .map((t) => (t.startsWith("#") ? t : `#${t}`));

      await onSubmit({
        ...values,
        amount: parsedAmount,
        receiptUrl: receiptPreview,
        tags: parsedTags,
      });

      toast.success("Transaction saved successfully!");
      reset();
      setCalcInput("");
      setReceiptPreview(undefined);
      onOpenChange(false);
    } catch (err: any) {
      const msg = err?.message || "Failed to save transaction.";
      setSubmitError(msg);
      toast.error(msg);
    }
  };

  const handleInvalid = (errs: any) => {
    console.warn("Form validation errors:", errs);
    toast.error("Please fill in all required fields (Amount, Category, Description).");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? t("transaction.add") : t("transaction.edit")}
          </DialogTitle>
        </DialogHeader>

        {submitError && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit, handleInvalid)} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="type">{t("transaction.type")}</Label>
              <Select
                value={watchType}
                onValueChange={(v) => setValue("type", (v ?? "expense") as any)}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">{t("common.income")}</SelectItem>
                  <SelectItem value="expense">{t("common.expenses")}</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Built-in Amount Calculator Input */}
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="amount_calc" className="flex items-center justify-between">
                <span>{t("transaction.amount")} *</span>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Calculator className="size-3" /> Auto-eval (e.g. 250+180)
                </span>
              </Label>
              <Input
                id="amount_calc"
                type="text"
                placeholder="0.00 or 150+50"
                value={calcInput}
                onChange={(e) => {
                  setCalcInput(e.target.value);
                  const evalVal = evaluateAmountMath(e.target.value);
                  if (evalVal !== null) setValue("amount", evalVal);
                }}
                onBlur={handleAmountBlur}
              />
              {errors.amount && (
                <p className="text-xs text-destructive">
                  {t(String(errors.amount.message))}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category">{t("transaction.category")} *</Label>
              <Select
                value={watchCategory}
                onValueChange={(v) => setValue("category", v ?? "")}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder={t("transaction.select_category")} />
                </SelectTrigger>
                <SelectContent>
                  {categoryList.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
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
          </div>

          {/* Accounts & Payment Method Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Account</Label>
              <Select
                value={watch("accountId") || ""}
                onValueChange={(v) => setValue("accountId", v || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc._id} value={acc._id}>
                      {acc.name} ({acc.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Payment Method</Label>
              <Select
                value={watch("paymentMethod") || "Cash"}
                onValueChange={(v) => setValue("paymentMethod", v || undefined)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Debit/Credit Card">Card</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description & Note */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="flex items-center justify-between">
              <span>{t("transaction.description")} *</span>
              <span className="text-[10px] text-primary font-medium">✨ Auto AI Categorizing</span>
            </Label>
            <Input
              id="description"
              placeholder="e.g. Starbucks Coffee, Gas Station, Uber"
              {...register("description", {
                onChange: (e) => {
                  const detectedCat = autoCategorizeDescription(e.target.value);
                  if (detectedCat && !watchCategory) {
                    setValue("category", detectedCat);
                  }
                },
              })}
            />
            {errors.description && (
              <p className="text-xs text-destructive">
                {t(String(errors.description.message))}
              </p>
            )}
          </div>

          <ReceiptOcrScanner
            onParsed={(data) => {
              if (data.amount) {
                setCalcInput(String(data.amount));
                setValue("amount", data.amount);
              }
              if (data.merchant && !watch("description")) {
                setValue("description", data.merchant);
              }
            }}
          />

          {/* Tags & Receipt Photo */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="tags" className="flex items-center gap-1">
                <Tag className="size-3" /> Tags
              </Label>
              <Input
                id="tags"
                placeholder="#Family, #Business"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1">
                <Camera className="size-3" /> Receipt Photo
              </Label>
              {receiptPreview ? (
                <div className="relative flex items-center justify-between rounded-lg border p-1.5 text-xs">
                  <span className="truncate max-w-[120px]">Receipt attached</span>
                  <button
                    type="button"
                    onClick={() => {
                      setReceiptPreview(undefined);
                      setValue("receiptUrl", undefined);
                    }}
                    className="rounded-md p-1 hover:bg-muted"
                  >
                    <X className="size-3.5 text-destructive" />
                  </button>
                </div>
              ) : (
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleReceiptChange}
                  className="text-xs file:text-xs"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="date">{t("transaction.date")}</Label>
              <Input id="date" type="date" {...register("date")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" {...register("time")} />
            </div>
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
