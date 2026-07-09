"use client";

import { useBudgetAlerts } from "@/hooks/useBudgetAlerts";
import { useTranslation } from "@/hooks/useTranslation";

const BudgetAlertWatcher = () => {
  const { t } = useTranslation();
  useBudgetAlerts(t);
  return null;
};

export default BudgetAlertWatcher;
