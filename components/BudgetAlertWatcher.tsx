"use client";

import { useBudgetAlerts } from "@/hooks/useBudgetAlerts";

const BudgetAlertWatcher = () => {
  useBudgetAlerts();
  return null;
};

export default BudgetAlertWatcher;
