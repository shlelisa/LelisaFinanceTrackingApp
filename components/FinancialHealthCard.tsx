"use client";

import { computeFinancialHealthScore } from "@/lib/storage/financeLogic";
import { useLiveData } from "@/hooks/useLiveData";
import { Activity, ShieldCheck, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";

export default function FinancialHealthCard() {
  const healthData = useLiveData(computeFinancialHealthScore);

  if (!healthData) return null;

  const { score, savingsRate, budgetAdherence, expenseToIncomeRatio, tips } = healthData;

  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-emerald-600 bg-emerald-500/10 border-emerald-500/30";
    if (s >= 60) return "text-amber-600 bg-amber-500/10 border-amber-500/30";
    return "text-destructive bg-destructive/10 border-destructive/30";
  };

  return (
    <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Activity className="size-4" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-sm">Financial Health Score</h3>
            <p className="text-[11px] text-muted-foreground">Based on savings, budgets & debt ratios</p>
          </div>
        </div>

        <div className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-black text-lg ${getScoreColor(score)}`}>
          <span>{score}</span>
          <span className="text-xs font-semibold text-muted-foreground">/ 100</span>
        </div>
      </div>

      {/* Metrics Progress Grid */}
      <div className="grid grid-cols-3 gap-3 border-t pt-3 text-center">
        <div>
          <div className="text-[10px] font-semibold uppercase text-muted-foreground">Savings Rate</div>
          <div className="text-sm font-bold text-foreground mt-0.5">{savingsRate}%</div>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase text-muted-foreground">Budget Adherence</div>
          <div className="text-sm font-bold text-foreground mt-0.5">{budgetAdherence}%</div>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase text-muted-foreground">Expense/Income</div>
          <div className="text-sm font-bold text-foreground mt-0.5">{expenseToIncomeRatio}%</div>
        </div>
      </div>

      {/* Improvement Tips */}
      {tips.length > 0 && (
        <div className="rounded-lg bg-muted/50 p-3 text-xs space-y-1">
          <div className="flex items-center gap-1 font-semibold text-foreground">
            <Lightbulb className="size-3.5 text-amber-500" />
            <span>Smart Recommendations</span>
          </div>
          <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
            {tips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
