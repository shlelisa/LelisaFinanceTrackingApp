"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
import Money from "@/components/Money";
import {
  incomePeriodSchema,
  type IncomePeriodFormValues,
} from "@/lib/validation/incomePeriod";
import {
  getIncomePeriod,
  saveIncomePeriod,
  onDataChanged,
} from "@/lib/storage/localStorage";
import type { IncomePeriod } from "@/lib/types/incomePeriod";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Wallet,
  CalendarRange,
  Pencil,
  CircleDollarSign,
} from "lucide-react";

function startOfMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function endOfMonth(): string {
  const d = new Date();
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${lastDay}`;
}

export default function IncomePeriodCard() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<IncomePeriod | null>(() => getIncomePeriod());
  const [open, setOpen] = useState(false);

  const form = useForm<IncomePeriodFormValues>({
    resolver: zodResolver(incomePeriodSchema) as any,
    defaultValues: {
      amount: period?.amount ?? 0,
      startDate: period ? period.startDate.slice(0, 10) : startOfMonth(),
      endDate: period ? period.endDate.slice(0, 10) : endOfMonth(),
    },
  });

  const refresh = () => setPeriod(getIncomePeriod());

  useEffect(() => {
    return onDataChanged(refresh);
  }, []);

  const handleSubmit = (values: IncomePeriodFormValues) => {
    saveIncomePeriod(values);
    refresh();
    setOpen(false);
  };

  const spentPercentage =
    period && period.amount > 0
      ? Math.min((period.spent / period.amount) * 100, 100)
      : 0;
  const exceeded = period ? period.remaining < 0 : false;

  return (
    <>
      <Card className="border shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <CircleDollarSign className="size-4 text-primary" />
            {t("incomePeriod.title")}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 px-2 text-xs text-primary hover:text-primary/80"
            onClick={() => setOpen(true)}
          >
            <Pencil className="size-3" />
            {period ? t("common.edit") : t("incomePeriod.set")}
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          {!period ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CalendarRange className="size-8 text-muted-foreground/50" />
              <p className="max-w-xs text-sm text-muted-foreground">
                {t("incomePeriod.not_set")}
              </p>
              <Button size="sm" onClick={() => setOpen(true)}>
                {t("incomePeriod.set")}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("incomePeriod.income")}
                </span>
                <span className="text-lg font-bold text-success">
                  <Money amount={period.amount} />
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {new Date(period.startDate).toLocaleDateString()} →{" "}
                  {new Date(period.endDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{t("incomePeriod.spent")}</span>
                <span>
                  <Money amount={period.spent} /> / <Money amount={period.amount} />
                </span>
              </div>
              <Progress
                value={spentPercentage}
                className="h-3"
                indicatorClassName={
                  exceeded
                    ? "bg-red-500"
                    : spentPercentage > 80
                      ? "bg-yellow-500"
                      : "bg-green-500"
                }
              />
              <div
                className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium ${
                  exceeded
                    ? "bg-destructive/10 text-destructive"
                    : "bg-muted/40 text-foreground"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Wallet className="size-4" />
                  {t("incomePeriod.remaining")}
                </span>
                <span>
                  {exceeded ? "-" : ""}
                  <Money amount={Math.abs(period.remaining)} />
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("incomePeriod.set_period")}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>{t("incomePeriod.amount")}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage>
                      {fieldState.error ? t(String(fieldState.error.message)) : undefined}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>{t("incomePeriod.start_date")}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage>
                        {fieldState.error ? t(String(fieldState.error.message)) : undefined}
                      </FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>{t("incomePeriod.end_date")}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage>
                        {fieldState.error ? t(String(fieldState.error.message)) : undefined}
                      </FormMessage>
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
    </>
  );
}
