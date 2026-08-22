"use client";

import { computeSmartStatistics, type SmartStatistics } from "@/lib/storage/financeLogic";
import { useLiveData } from "@/hooks/useLiveData";
import { useAppCurrency } from "@/hooks/useAppCurrency";
import { TrendingUp, Sparkles, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function SmartStatisticsCard() {
  const { format } = useAppCurrency();
  const stats = useLiveData<SmartStatistics>(computeSmartStatistics);

  if (!stats) return null;

  const { topCategoryComparison, weekendPercentage, largestExpense, projectedMonthEnd } = stats;
  const comparison = topCategoryComparison;

  return (
    <div className="rounded-xl border bg-card p-5 shadow-xs space-y-3">
      <div className="flex items-center gap-2 border-b pb-3">
        <Sparkles className="size-4 text-primary" />
        <h3 className="font-bold text-foreground text-sm">Smart Comparative Analytics</h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 text-xs">
        {comparison && (
          <div className="flex items-start gap-2.5 rounded-lg border bg-muted/40 p-3">
            <div className={`mt-0.5 flex size-6 items-center justify-center rounded-md text-white ${
              comparison.changePct === null || comparison.changePct <= 0 ? "bg-emerald-500" : "bg-destructive"
            }`}>
              {comparison.changePct !== null && comparison.changePct > 0 ? (
                <ArrowUpRight className="size-4" />
              ) : (
                <ArrowDownRight className="size-4" />
              )}
            </div>
            <div>
              <div className="font-semibold text-foreground">{comparison.category} Spending</div>
              <p className="text-muted-foreground mt-0.5">
                {format(comparison.currentTotal)} this month vs{" "}
                {format(comparison.previousTotal)} last month
                {comparison.changePct !== null &&
                  (comparison.changePct > 0
                    ? ` (+${comparison.changePct}%).`
                    : comparison.changePct < 0
                      ? ` (${comparison.changePct}%).`
                      : " (no change).")}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2.5 rounded-lg border bg-muted/40 p-3">
          <div className="mt-0.5 flex size-6 items-center justify-center rounded-md bg-blue-500 text-white">
            <Calendar className="size-4" />
          </div>
          <div>
            <div className="font-semibold text-foreground">Weekend Activity Pattern</div>
            <p className="text-muted-foreground mt-0.5">
              {weekendPercentage > 0
                ? `${weekendPercentage}% of your total expenses occur on weekends.`
                : "Your spending is evenly distributed throughout weekdays."}
            </p>
          </div>
        </div>

        {largestExpense && (
          <div className="flex items-start gap-2.5 rounded-lg border bg-muted/40 p-3">
            <div className="mt-0.5 flex size-6 items-center justify-center rounded-md bg-purple-500 text-white">
              <TrendingUp className="size-4" />
            </div>
            <div>
              <div className="font-semibold text-foreground">Largest Expense This Month</div>
              <p className="text-muted-foreground mt-0.5">
                &quot;{largestExpense.description}&quot; — {format(largestExpense.amount)}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2.5 rounded-lg border bg-muted/40 p-3">
          <div className="mt-0.5 flex size-6 items-center justify-center rounded-md bg-emerald-500 text-white">
            <Sparkles className="size-4" />
          </div>
          <div>
            <div className="font-semibold text-foreground">Projected Month-End Balance</div>
            <p className="text-muted-foreground mt-0.5">
              Estimated closing balance: {format(projectedMonthEnd)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
