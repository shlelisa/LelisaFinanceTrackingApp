"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Money from "@/components/Money";
import {
  getStoredSalary,
  getSalaryCreditedMonths,
  saveStoredSalary,
  deleteStoredSalary,
  ensureSalaryIncome,
  salaryPayDateForMonth,
  onDataChanged,
} from "@/lib/storage/localStorage";
import type { SalaryConfig } from "@/lib/types/salary";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { Banknote, CalendarClock, CheckCircle2, Pencil, Trash2 } from "lucide-react";

function currentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function SalaryCard() {
  const { t } = useTranslation();
  const [salary, setSalary] = useState<SalaryConfig | null>(() => getStoredSalary());
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentDay, setPaymentDay] = useState("1");
  const [error, setError] = useState("");

  const refresh = () => setSalary(getStoredSalary());

  useEffect(() => {
    return onDataChanged(refresh);
  }, []);

  const openDialog = () => {
    setError("");
    setAmount(salary ? String(salary.amount) : "");
    setPaymentDay(salary ? String(salary.paymentDay) : "1");
    setOpen(true);
  };

  const handleSave = () => {
    const parsedAmount = parseFloat(amount);
    const parsedDay = parseInt(paymentDay, 10);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError(t("salary.invalid_amount"));
      return;
    }
    if (isNaN(parsedDay) || parsedDay < 1 || parsedDay > 31 || !Number.isInteger(parsedDay)) {
      setError(t("salary.invalid_day"));
      return;
    }
    saveStoredSalary({ amount: parsedAmount, paymentDay: parsedDay });
    ensureSalaryIncome();
    refresh();
    setOpen(false);
    toast.success(t("salary.saved"));
  };

  const handleDelete = () => {
    deleteStoredSalary();
    refresh();
    toast.success(t("salary.removed"));
  };

  // Status line
  let status: { credited: boolean; dateLabel: string } | null = null;
  if (salary) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const payThisMonth = salaryPayDateForMonth(year, month, salary.paymentDay);
    const credited = getSalaryCreditedMonths().includes(currentMonthKey());
    let next: Date;
    if (!credited && now.getTime() < payThisMonth.getTime()) {
      next = payThisMonth;
    } else {
      const m = month + 1;
      next = salaryPayDateForMonth(year + Math.floor(m / 12), m % 12, salary.paymentDay);
    }
    status = { credited, dateLabel: next.toLocaleDateString() };
  }

  return (
    <>
      <Card className="border shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Banknote className="size-4 text-primary" />
            {t("salary.title")}
          </CardTitle>
          {salary ? (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 px-2 text-xs text-primary hover:text-primary/80"
                onClick={openDialog}
              >
                <Pencil className="size-3" />
                {t("common.edit")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 px-2 text-muted-foreground hover:text-destructive"
                onClick={handleDelete}
                aria-label={t("salary.remove")}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 px-2 text-xs text-primary hover:text-primary/80"
              onClick={openDialog}
            >
              <Pencil className="size-3" />
              {t("salary.set")}
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-6">
          {!salary || !status ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CalendarClock className="size-8 text-muted-foreground/50" />
              <p className="max-w-xs text-sm text-muted-foreground">
                {t("salary.not_set")}
              </p>
              <Button size="sm" onClick={openDialog}>
                {t("salary.set")}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t("salary.amount")}</span>
                <span className="text-lg font-bold text-success">
                  <Money amount={salary.amount} />
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("salary.payment_day")}</span>
                <span className="font-medium text-foreground">
                  {t("salary.paid_on", { day: salary.paymentDay })}
                </span>
              </div>
              <div
                className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium ${
                  status.credited
                    ? "bg-success/10 text-success"
                    : "bg-muted/40 text-foreground"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {status.credited ? (
                    <CheckCircle2 className="size-4" />
                  ) : (
                    <CalendarClock className="size-4" />
                  )}
                  {status.credited
                    ? t("salary.credited")
                    : t("salary.next_credit", { date: status.dateLabel })}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{salary ? t("salary.edit_title") : t("salary.set_title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("salary.amount")}</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>{t("salary.payment_day")}</Label>
              <Input
                type="number"
                min="1"
                max="31"
                step="1"
                value={paymentDay}
                onChange={(e) => setPaymentDay(e.target.value)}
                className="mt-1.5"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">{t("salary.auto_note")}</p>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSave}>{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
