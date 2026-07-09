"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Budget } from "@/lib/types/budget";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Money from "@/components/Money";
import { useTranslation } from "@/hooks/useTranslation";

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

const BudgetCard = ({ budget, onEdit, onDelete }: BudgetCardProps) => {
  const { t } = useTranslation();
  const spentPercentage =
    budget.limitAmount > 0
      ? Math.min((budget.spent / budget.limitAmount) * 100, 999)
      : 0;

  const getProgressColor = () => {
    if (spentPercentage >= 100) return "bg-red-500";
    if (spentPercentage > 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const isExceeded = budget.remaining < 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">{budget.category}</CardTitle>
        {isExceeded && <Badge variant="destructive">{t("budgets.exceeded")}</Badge>}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{t("budgets.spent")}</span>
          <span>
            <Money amount={budget.spent} /> /{" "}
            <Money amount={budget.limitAmount} />
          </span>
        </div>
        <Progress
          value={Math.min(spentPercentage, 100)}
          className="h-3"
          indicatorClassName={getProgressColor()}
        />
        <div className="flex justify-between items-center">
          <p className={`text-sm font-medium ${isExceeded ? "text-destructive" : ""}`}>
            {isExceeded
              ? <>{t("budgets.overspent_by")} <Money amount={Math.abs(budget.remaining)} /></>
              : <>{t("budgets.remaining")} <Money amount={budget.remaining} /></>}
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => onEdit(budget)}>
              {t("common.edit")}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm(t("budgets.delete_confirm"))) {
                  onDelete(budget._id);
                }
              }}
            >
              {t("common.delete")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetCard;
