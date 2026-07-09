import { useEffect, useRef } from "react";
import { useBudgets } from "./useBudgets";
import { showBudgetAlert } from "@/lib/notifications";

export const useBudgetAlerts = () => {
  const { data: budgets = [] } = useBudgets();
  const alertedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    for (const budget of budgets) {
      const key = `${budget._id}-${budget.spent}`;
      if (alertedRef.current.has(key)) continue;
      alertedRef.current.add(key);

      if (budget.spent > 0) {
        showBudgetAlert(budget.category, budget.spent, budget.limitAmount);
      }
    }
  }, [budgets]);
};
