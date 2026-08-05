"use client";

import { useState, useEffect } from "react";
import { computeSmartStatistics } from "@/lib/storage/financeLogic";
import { TrendingUp, Sparkles, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function SmartStatisticsCard() {
  const [stats, setStats] = useState<{
    foodComparison: number | null;
    weekendPercentage: number;
    largestExpense: { description: string; amount: number } | null;
    projectedMonthEnd: number;
  } | null>(null);

  useEffect(() => {
    setStats(computeSmartStatistics());
  }, []);

  if (!stats) return null;

  const { foodComparison, weekendPercentage, largestExpense, projectedMonthEnd } = stats;

  return (
    <div className="rounded-xl border bg-card p-5 shadow-xs space-y-3">
      <div className="flex items-center gap-2 border-b pb-3">
        <Sparkles className="size-4 text-primary" />
        <h3 className="font-bold text-foreground text-sm">Smart Comparative Analytics</h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 text-xs">
        {foodComparison !== null && (
          <div className="flex items-start gap-2.5 rounded-lg border bg-muted/40 p-3">
            <div className={`mt-0.5 flex size-6 items-center justify-center rounded-md text-white ${
              foodComparison > 0 ? "bg-destructive" : "bg-emerald-500"
            }`}>
              {foodComparison > 0 ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
            </div>
            <div>
              <div className="font-semibold text-foreground">Food & Dining Spending</div>
              <p className="text-muted-foreground mt-0.5">
                {foodComparison > 0
                  ? `You spent ${foodComparison}% more on food than last month.`
                  : `You saved ${Math.abs(foodComparison)}% on food compared to last month.`}
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
                "{largestExpense.description}" — ${largestExpense.amount.toFixed(2)}
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
              Estimated closing balance: ${projectedMonthEnd.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
